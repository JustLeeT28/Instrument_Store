package com.store.be_api.payment;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.be_api.order.Order;
import com.store.be_api.order.OrderRepository;
import com.store.be_api.order.OrderStatus;
import com.store.be_api.order.OrderItem;
import com.store.be_api.user.User;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PayOSService {
    private static final String PAYMENT_REQUEST_PATH = "/v2/payment-requests";

    private final PayOSProperties properties;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public PayOSService(PayOSProperties properties, OrderRepository orderRepository, ObjectMapper objectMapper) {
        this.properties = properties;
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
    }

    public record PaymentLinkResult(String checkoutUrl, Long payosOrderCode) {}

    public PaymentLinkResult createPaymentLink(Order order, User user, List<OrderItem> items) {
        validateConfiguration();

        try {
            long amount = toAmount(order.getTotal());
            long payosOrderCode = Objects.requireNonNull(order.getPayosOrderCode(), "payosOrderCode");
            String description = buildDescription(payosOrderCode);
            String returnUrl = properties.getFrontendBaseUrl() + "/orders?payment=success&orderCode=" + order.getDisplayOrderCode();
            String cancelUrl = properties.getFrontendBaseUrl() + "/orders?payment=cancelled&orderCode=" + order.getDisplayOrderCode();

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("orderCode", payosOrderCode);
            requestBody.put("amount", amount);
            requestBody.put("description", description);
            requestBody.put("buyerName", user.getFullName());
            requestBody.put("buyerEmail", user.getEmail());
            requestBody.put("cancelUrl", cancelUrl);
            requestBody.put("returnUrl", returnUrl);
            requestBody.put("items", buildItems(items));
            requestBody.put("signature", buildSignature(amount, cancelUrl, description, payosOrderCode, returnUrl));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.getBaseUrl() + PAYMENT_REQUEST_PATH))
                    .header("Content-Type", "application/json")
                    .header("x-client-id", properties.getClientId())
                    .header("x-api-key", properties.getApiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "PayOS khong the tao link thanh toan: " + extractPayOSMessage(response.body()));
            }

            JsonNode root = objectMapper.readTree(response.body());
            String code = root.path("code").asText("");
            if (!"00".equals(code)) {
                String desc = root.path("desc").asText("PayOS returned an error");
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "PayOS: " + desc);
            }

            String checkoutUrl = root.path("data").path("checkoutUrl").asText(null);
            if (checkoutUrl == null || checkoutUrl.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "PayOS khong tra ve checkoutUrl");
            }

            return new PaymentLinkResult(checkoutUrl, payosOrderCode);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Khong the ket noi PayOS", ex);
        }
    }

    @Transactional
    public void handleWebhook(PayOSWebhookRequest request) {
        validateConfiguration();
        if (request == null || request.getData() == null || request.getSignature() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Du lieu webhook khong hop le");
        }

        if (!isValidWebhook(request.getData(), request.getSignature())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chu ky webhook khong hop le");
        }

        Long payosOrderCode = request.getData().getOrderCode();
        if (payosOrderCode == null) {
            return;
        }

        orderRepository.findByPayosOrderCode(payosOrderCode).ifPresent(order -> {
            boolean success = Boolean.TRUE.equals(request.getSuccess()) && "00".equals(request.getData().getCode());
            if (success) {
                if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
                    order.setStatus(OrderStatus.PREPARING);
                }
            } else if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
                order.setStatus(OrderStatus.CANCELLED);
            }
            orderRepository.save(order);
        });
    }

    private void validateConfiguration() {
        if (isMissingPayOSValue(properties.getClientId())
                || isMissingPayOSValue(properties.getApiKey())
                || isMissingPayOSValue(properties.getChecksumKey())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PayOS chua duoc cau hinh");
        }
    }

    private boolean isMissingPayOSValue(String value) {
        if (isBlank(value)) {
            return true;
        }

        String normalized = value.trim().toLowerCase();
        return normalized.startsWith("your_")
                || normalized.contains("placeholder")
                || normalized.contains("change_me");
    }

    private List<Map<String, Object>> buildItems(List<OrderItem> items) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (items == null) {
            return result;
        }

        for (OrderItem item : items) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", item.getProductName());
            row.put("quantity", item.getQuantity());
            row.put("price", toAmount(item.getUnitPrice()));
            row.put("unit", "cai");
            result.add(row);
        }
        return result;
    }

    private String buildSignature(long amount, String cancelUrl, String description, long orderCode, String returnUrl)
            throws Exception {
        String payload = "amount=" + amount
                + "&cancelUrl=" + cancelUrl
                + "&description=" + description
                + "&orderCode=" + orderCode
                + "&returnUrl=" + returnUrl;
        return hmacSha256(payload, properties.getChecksumKey());
    }

    private boolean isValidWebhook(PayOSWebhookRequest.WebhookData data, String signature) {
        try {
            Map<String, Object> payload = objectMapper.convertValue(data, new TypeReference<Map<String, Object>>() {});
            String computed = payload.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry -> entry.getKey() + "=" + encodeValue(entry.getValue()))
                    .reduce((left, right) -> left + "&" + right)
                    .map(value -> {
                        try {
                            return hmacSha256(value, properties.getChecksumKey());
                        } catch (Exception ex) {
                            throw new RuntimeException(ex);
                        }
                    })
                    .orElse("");
            return computed.equalsIgnoreCase(signature);
        } catch (Exception ex) {
            return false;
        }
    }

    private String hmacSha256(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(bytes);
    }

    private String encodeValue(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof Number number) {
            return number.toString();
        }
        if (value instanceof Boolean bool) {
            return bool.toString();
        }
        return URLEncoder.encode(String.valueOf(value), StandardCharsets.UTF_8);
    }

    private long toAmount(java.math.BigDecimal value) {
        if (value == null) {
            return 0L;
        }
        return value.setScale(0, java.math.RoundingMode.HALF_UP).longValueExact();
    }

    private long toAmount(double value) {
        return Math.round(value);
    }

    private String buildDescription(long payosOrderCode) {
        String digits = Long.toString(Math.abs(payosOrderCode));
        String suffix = digits.length() > 7 ? digits.substring(digits.length() - 7) : digits;
        return "DH" + suffix;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String extractPayOSMessage(String body) {
        if (body == null || body.isBlank()) {
            return "khong co noi dung phan hoi";
        }

        try {
            JsonNode root = objectMapper.readTree(body);
            String code = root.path("code").asText("");
            String desc = root.path("desc").asText("");
            if (!code.isBlank() || !desc.isBlank()) {
                return (!code.isBlank() ? code + ": " : "") + desc;
            }
        } catch (Exception ignored) {
            // fall back to raw body below
        }

        return body.length() > 240 ? body.substring(0, 240) + "..." : body;
    }
}
