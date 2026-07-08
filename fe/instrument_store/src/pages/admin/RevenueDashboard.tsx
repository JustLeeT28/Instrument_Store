import { useEffect, useMemo, useState } from 'react';
import { fetchRevenueStats, type RevenueStats } from '../../services/adminRevenue';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value || 0);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
}

export function RevenueDashboard() {
  const initialRange = useMemo(() => getDefaultRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    revenue: number;
    orders: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetchRevenueStats(startDate, endDate)
      .then(data => {
        if (!mounted) return;
        setStats(data);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Không thể tải thống kê doanh thu');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [startDate, endDate]);

  const maxDailyRevenue = useMemo(() => {
    if (!stats?.dailyRevenue.length) return 0;
    return Math.max(...stats.dailyRevenue.map(item => item.revenue));
  }, [stats]);

  const lineChart = useMemo(() => {
    const dailyRevenue = stats?.dailyRevenue ?? [];
    const width = Math.max((dailyRevenue.length - 1) * 64, 720);
    const height = 320;
    const padding = 40;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const maxValue = maxDailyRevenue || 1;

    const points = dailyRevenue.map((day, index) => {
      const x = dailyRevenue.length === 1
        ? width / 2
        : padding + (index / (dailyRevenue.length - 1)) * chartWidth;
      const y = padding + chartHeight - (day.revenue / maxValue) * chartHeight;

      return { ...day, x, y };
    });

    return {
      width,
      height,
      points,
      path: points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
      areaPath: points.length
        ? `${points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
        : '',
      gridLines: [0, 1, 2, 3].map(index => padding + (index / 3) * chartHeight),
    };
  }, [maxDailyRevenue, stats]);

  function applyQuickRange(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(end));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Admin</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Thống kê doanh thu</h2>
          <p className="mt-2 text-sm text-slate-500">Tính theo các đơn hàng không bị hủy trong khoảng ngày đã chọn.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(0,150px)_minmax(0,150px)_1fr]">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Từ ngày
              <input
                type="date"
                value={startDate}
                onChange={event => setStartDate(event.target.value)}
                className="mt-2 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Đến ngày
              <input
                type="date"
                value={endDate}
                onChange={event => setEndDate(event.target.value)}
                className="mt-2 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </label>
            <div className="flex flex-wrap items-end gap-2">
              {[7, 30, 90].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => applyQuickRange(days)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                >
                  {days} ngày
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox label="Doanh thu" value={stats ? formatCurrency(stats.totalRevenue) : '...'} icon="payments" />
        <StatBox label="Đơn tính doanh thu" value={stats ? stats.countedOrders.toLocaleString('vi-VN') : '...'} icon="receipt_long" />
        <StatBox label="Giá trị TB/đơn" value={stats ? formatCurrency(stats.averageOrderValue) : '...'} icon="monitoring" />
        <StatBox label="Sản phẩm đã bán" value={stats ? stats.soldItems.toLocaleString('vi-VN') : '...'} icon="inventory_2" />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Doanh thu theo ngày</h3>
              <p className="text-sm text-slate-500">
                {stats ? `${stats.startDate} đến ${stats.endDate}` : 'Đang tải dữ liệu'}
              </p>
            </div>
            {loading && <span className="text-sm font-semibold text-amber-700">Đang tải...</span>}
          </div>

          <div className="mt-5 pb-2">
            {stats?.dailyRevenue.length ? (
              <div className="relative min-w-0">
                <svg
                  viewBox={`0 0 ${lineChart.width} ${lineChart.height}`}
                  className="h-[360px] w-full"
                  role="img"
                  aria-label="Biểu đồ đường doanh thu theo ngày"
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <defs>
                    <linearGradient id="revenueLineArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgb(245 158 11)" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="rgb(245 158 11)" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {lineChart.gridLines.map(lineY => (
                    <line
                      key={lineY}
                      x1="24"
                      x2={lineChart.width - 24}
                      y1={lineY}
                      y2={lineY}
                      stroke="rgb(226 232 240)"
                      strokeDasharray="4 6"
                    />
                  ))}

                  {lineChart.areaPath && <path d={lineChart.areaPath} fill="url(#revenueLineArea)" />}
                  {lineChart.path && (
                    <path
                      d={lineChart.path}
                      fill="none"
                      stroke="rgb(217 119 6)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                    />
                  )}

                  {lineChart.points.map(point => (
                    <g
                      key={point.date}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseMove={() => setHoveredPoint(point)}
                    >
                      <circle cx={point.x} cy={point.y} r="4.5" fill="white" stroke="rgb(217 119 6)" strokeWidth="3" />
                      <circle cx={point.x} cy={point.y} r="18" fill="transparent" />
                    </g>
                  ))}

                  {hoveredPoint && (
                    <g pointerEvents="none">
                      <line
                        x1={hoveredPoint.x}
                        x2={hoveredPoint.x}
                        y1="40"
                        y2={lineChart.height - 40}
                        stroke="rgb(148 163 184)"
                        strokeDasharray="4 6"
                      />
                      <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="7" fill="rgb(217 119 6)" />
                      <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="12" fill="rgb(217 119 6)" opacity="0.15" />
                    </g>
                  )}
                </svg>

                {hoveredPoint && (
                  <div
                    className="pointer-events-none absolute z-10 w-56 rounded-lg bg-slate-950 px-4 py-3 text-white shadow-xl"
                    style={{
                      left: `${(hoveredPoint.x / lineChart.width) * 100}%`,
                      top: `${(hoveredPoint.y / lineChart.height) * 100}%`,
                      transform: hoveredPoint.x > lineChart.width * 0.72
                        ? 'translate(-105%, -70%)'
                        : 'translate(14px, -70%)',
                    }}
                  >
                    <p className="text-base font-bold leading-tight">{formatCurrency(hoveredPoint.revenue)}</p>
                    <p className="mt-1 text-sm font-medium text-slate-300">
                      {formatDate(hoveredPoint.date)} - {hoveredPoint.orders} đơn
                    </p>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <div className="flex h-[360px] w-full items-center justify-center text-sm text-slate-500">
                  Chưa có dữ liệu doanh thu.
                </div>
              )
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-950">Sản phẩm bán chạy</h3>
            <p className="text-sm text-slate-500">Xếp theo doanh thu dòng hàng.</p>
          </div>

          <div className="mt-5 space-y-4">
            {stats?.topProducts.map((product, index) => (
              <div key={product.productName} className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-700">#{index + 1}</p>
                    <p className="mt-1 truncate font-semibold text-slate-950">{product.productName}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-900">{product.quantity} sp</p>
                </div>
                <p className="mt-3 text-lg font-bold text-emerald-700">{formatCurrency(product.revenue)}</p>
              </div>
            ))}

            {!loading && stats?.topProducts.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                Chưa có sản phẩm nào trong khoảng ngày này.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatBox label="Doanh thu trước giảm" value={stats ? formatCurrency(stats.grossRevenue) : '...'} icon="sell" compact />
        <StatBox label="Tổng giảm giá" value={stats ? formatCurrency(stats.totalDiscount) : '...'} icon="local_offer" compact />
        <StatBox label="Đơn đã hủy" value={stats ? stats.cancelledOrders.toLocaleString('vi-VN') : '...'} icon="cancel" compact />
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, compact = false }: { label: string; value: string; icon: string; compact?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <span className="material-symbols-outlined text-[22px] text-amber-600">{icon}</span>
      </div>
      <p className={`mt-2 font-bold text-slate-950 ${compact ? 'text-2xl' : 'text-3xl'}`}>{value}</p>
    </div>
  );
}

export default RevenueDashboard;
