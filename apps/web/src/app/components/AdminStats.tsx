type Props = {
  stats: { totalRevenue: number; totalOrders: number; pendingOrders: number; completedOrders: number };
  loading?: boolean;
};

const cards = [
  { key: 'totalRevenue', label: 'Total revenue', detail: 'All completed checkout value', icon: '₹' },
  { key: 'totalOrders', label: 'Total orders', detail: 'Customer purchases recorded', icon: '↗' },
  { key: 'pendingOrders', label: 'Pending orders', detail: 'Awaiting your next step', icon: '◷' },
  { key: 'completedOrders', label: 'Completed orders', detail: 'Successfully fulfilled', icon: '✓' },
] as const;

export default function AdminStats({ stats, loading = false }: Props) {
  return (
    <section className="admin-stats" aria-label="Dashboard statistics">
      {cards.map((card) => {
        const rawValue = stats[card.key];
        const value = card.key === 'totalRevenue'
          ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(rawValue)}`
          : new Intl.NumberFormat('en-IN').format(rawValue);
        return (
          <article className="stat-card" key={card.key}>
            <div className="stat-card-top"><span>{card.label}</span><b>{card.icon}</b></div>
            <h3 className={loading ? 'stat-value loading' : 'stat-value'}>{loading ? '—' : value}</h3>
            <p>{card.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
