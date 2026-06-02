package com.store.be_api.category;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategoryDataLoader implements CommandLineRunner {
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() > 0) return;

        OffsetDateTime now = OffsetDateTime.now();

        List<Category> defaults = List.of(
                Category.builder().id(UUID.fromString("1741efc8-f949-485c-af66-abafc8666f57")).name("Guitar Classic").slug("guitar-classic").position(3).createdAt(now).updatedAt(now).build(),
                Category.builder().id(UUID.fromString("284474d7-17c6-4257-82e3-d70c18bb9b9d")).name("Guitar Điện").slug("guitar-dien").position(2).createdAt(now).updatedAt(now).build(),
                Category.builder().id(UUID.fromString("7b2db7d5-02ff-42fa-a377-47ca48e3cd33")).name("Dây Đàn & Phụ Kiện").slug("day-dan-phu-kien").position(9).createdAt(now).updatedAt(now).build(),
                Category.builder().id(UUID.fromString("989c2a9d-b253-4e44-b267-92109f0c508e")).name("Amply & Loa").slug("amply-loa").position(7).createdAt(now).updatedAt(now).build(),
                Category.builder().id(UUID.fromString("a028b9fe-c518-4ea1-b6d5-4156a6c17f75")).name("Organ").slug("organ-keyboard").position(5).createdAt(now).updatedAt(now).build(),
                Category.builder().id(UUID.fromString("bb84afaa-0814-4d97-b58a-1c24135f217c")).name("Piano").slug("piano").position(6).createdAt(now).updatedAt(now).build(),
                Category.builder().id(UUID.fromString("cf9dc7f7-5784-4cfe-a760-767ece340d95")).name("Guitar Acoustic").slug("guitar-acoustic").position(1).createdAt(now).updatedAt(now).build(),
                Category.builder().id(UUID.fromString("ef361cc5-e15b-489a-93f4-234a278635a3")).name("Violin").slug("violin").position(4).createdAt(now).updatedAt(now).build(),
                Category.builder().id(UUID.fromString("f66518bb-7c6c-415b-b1f7-a5e9b562b767")).name("Pedal & Multi-Effects").slug("pedal-multi-effects").position(8).createdAt(now).updatedAt(now).build()
        );

        categoryRepository.saveAll(defaults);
    }
}
