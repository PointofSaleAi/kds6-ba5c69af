import { ArrowLeft, TrendingUp, Clock, Zap, AlertTriangle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// TODO: Replace with API data
const hourlyOrders = [
  { hour: '9AM', orders: 4 },
  { hour: '10AM', orders: 8 },
  { hour: '11AM', orders: 15 },
  { hour: '12PM', orders: 22 },
  { hour: '1PM', orders: 18 },
  { hour: '2PM', orders: 12 },
  { hour: '3PM', orders: 6 },
];

const hourlyAvgTime = [
  { hour: '9AM', avgMin: 12 },
  { hour: '10AM', avgMin: 14 },
  { hour: '11AM', avgMin: 18 },
  { hour: '12PM', avgMin: 22 },
  { hour: '1PM', avgMin: 16 },
  { hour: '2PM', avgMin: 13 },
  { hour: '3PM', avgMin: 11 },
];

interface PerformanceDashboardProps {
  onBack: () => void;
}

export default function PerformanceDashboard({ onBack }: PerformanceDashboardProps) {
  const stats = [
    { label: 'Total orders served', value: '48', icon: TrendingUp, color: 'text-success' },
    { label: 'Avg ticket time', value: '18 min', sub: 'target 15 min', icon: Clock, color: 'text-warning' },
    { label: 'Fastest ticket', value: '6 min', icon: Zap, color: 'text-brand-primary' },
    { label: 'Slowest ticket', value: '32 min', icon: AlertTriangle, color: 'text-destructive' },
  ];

  const slowItems = [
    { name: 'Wagyu Steak', avgTime: '24 min' },
    { name: 'Lobster Tail', avgTime: '22 min' },
    { name: 'Banquet Platter', avgTime: '20 min' },
  ];

  const categories = [
    { name: 'Appetizers', orders: 18, avgTime: '8 min' },
    { name: 'Entrees', orders: 24, avgTime: '18 min' },
    { name: 'Desserts', orders: 12, avgTime: '10 min' },
    { name: 'Beverages', orders: 15, avgTime: '3 min' },
  ];

  return (
    <div className="fixed inset-0 bg-surface-bg flex flex-col overflow-auto">
      <div className="bg-surface-card border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Go Back">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-xl font-bold text-text-primary">Kitchen performance - today</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-muted text-text-primary rounded-lg text-sm font-medium hover:bg-muted/70 transition-colors min-h-[44px]">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={18} className={stat.color} />
                <span className="text-xs text-text-muted uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-text-primary">{stat.value}</div>
              {stat.sub && <div className="text-xs text-text-muted mt-1">{stat.sub}</div>}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-surface-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Orders per hour</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 87%)" />
                <XAxis dataKey="hour" fontSize={12} tick={{ fill: 'hsl(210 10% 45%)' }} />
                <YAxis fontSize={12} tick={{ fill: 'hsl(210 10% 45%)' }} />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(4 76% 57%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Avg ticket time by hour</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyAvgTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 87%)" />
                <XAxis dataKey="hour" fontSize={12} tick={{ fill: 'hsl(210 10% 45%)' }} />
                <YAxis fontSize={12} tick={{ fill: 'hsl(210 10% 45%)' }} unit=" min" />
                <Tooltip />
                <Line type="monotone" dataKey="avgMin" stroke="hsl(24 80% 52%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Category breakdown */}
          <div className="bg-surface-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Category breakdown</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase tracking-wider">
                  <th className="text-left py-2">Category</th>
                  <th className="text-right py-2">Orders</th>
                  <th className="text-right py-2">Avg time</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.name} className="border-t border-border">
                    <td className="py-2 text-text-primary font-medium">{cat.name}</td>
                    <td className="py-2 text-right text-text-secondary">{cat.orders}</td>
                    <td className="py-2 text-right text-text-secondary">{cat.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Slowest items */}
          <div className="bg-surface-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Top 3 Slowest Products</h3>
            <div className="space-y-3">
              {slowItems.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="flex-1 text-text-primary font-medium">{item.name}</span>
                  <span className="text-destructive font-bold">{item.avgTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
