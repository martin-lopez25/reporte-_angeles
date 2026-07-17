import type { ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Database, Layers3, Building2, Globe, MapPinned } from 'lucide-react';
import type { DashboardStats, EntidadChart, InternetPieItem, TopUnidadChart } from '../types';

interface ChartsProps {
  stats: DashboardStats;
  topUnidades: TopUnidadChart[];
  internetPie: InternetPieItem[];
  porEntidad: EntidadChart[];
}

const PIE_COLORS = ['#1A6B5E', '#A57F2C'];

const tooltipStyle = {
  borderRadius: '10px',
  border: '1px solid #E5E7EB',
  background: '#FFFFFF',
  fontSize: '13px',
  color: '#111827',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
};

function formatTooltipNumber(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('es-MX');
}

type StatKey =
  | 'registrosBase'
  | 'filasResultado'
  | 'unidadesResumen'
  | 'unidadesInternet'
  | 'entidades';

interface StatCardDef {
  icon: typeof Database;
  label: string;
  key: StatKey;
  bg: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  border: string;
}

const STAT_CARDS: StatCardDef[] = [
  {
    icon: Database,
    label: 'BASE CRUDA (FILAS)',
    key: 'registrosBase',
    bg: 'bg-gradient-to-br from-imss-green to-imss-green-mid',
    iconBg: 'bg-white/15',
    iconColor: 'text-white',
    valueColor: 'text-white',
    border: 'border-imss-green',
  },
  {
    icon: Layers3,
    label: 'POR CLUES (FILAS)',
    key: 'filasResultado',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  {
    icon: Building2,
    label: 'POR ESTADO (UNIDADES)',
    key: 'unidadesResumen',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-700',
    border: 'border-amber-200',
  },
  {
    icon: Globe,
    label: 'UNIDADES CON INTERNET',
    key: 'unidadesInternet',
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    valueColor: 'text-rose-700',
    border: 'border-rose-200',
  },
  {
    icon: MapPinned,
    label: 'ENTIDADES',
    key: 'entidades',
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    valueColor: 'text-teal-700',
    border: 'border-teal-200',
  },
];

function StatCard({ def, value }: { def: StatCardDef; value: number }) {
  const { icon: Icon, label, bg, iconBg, iconColor, valueColor, border } = def;
  return (
    <div
      className={`group relative cursor-default overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${border} ${bg}`}
    >
      <div className="absolute -right-4 -top-4 opacity-10 transition-transform duration-500 group-hover:scale-125 group-hover:opacity-20">
        <Icon className="h-20 w-20" />
      </div>
      <div className="relative mb-3 flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110 ${iconBg} ${iconColor}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
      </div>
      <p className="relative mb-1 text-[10px] font-bold uppercase tracking-widest opacity-70" style={{ color: valueColor === 'text-white' ? '#fff' : undefined }}>
        <span className={valueColor === 'text-white' ? 'text-white/70' : 'text-gray-500'}>{label}</span>
      </p>
      <p className={`relative text-3xl font-black tabular-nums ${valueColor}`}>{value.toLocaleString('es-MX')}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="mb-5">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export function StatCards({
  stats,
}: ChartsProps) {
  const values: Record<StatKey, number> = {
    registrosBase: stats.registrosBase,
    filasResultado: stats.filasResultado,
    unidadesResumen: stats.unidadesResumen,
    unidadesInternet: stats.unidadesInternet,
    entidades: stats.entidades,
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {STAT_CARDS.map((def) => (
        <StatCard key={def.key} def={def} value={values[def.key]} />
      ))}
    </div>
  );
}

export function Charts({
  topUnidades,
  internetPie,
  porEntidad,
}: ChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Top 10 CLUES por preguntas acumuladas" subtitle="Suma de columnas numericas en resumen por unidad">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topUnidades} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis type="category" dataKey="clues" tick={{ fontSize: 10, fill: '#6B7280' }} width={80} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [formatTooltipNumber(v), 'Total']}
                cursor={{ fill: '#F9FAFB' }}
              />
              <Bar dataKey="total" fill="#A57F2C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Unidades con y sin internet" subtitle="Distribucion desde columna internet en resumen">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={internetPie} cx="50%" cy="45%" outerRadius={100} innerRadius={55} dataKey="value" paddingAngle={2} stroke="none">
                {internetPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatTooltipNumber(v), 'Unidades']} />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#6B7280' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Resumen por entidad" subtitle="Unidades, consultorios habilitados y consultorios levantados">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={porEntidad} margin={{ top: 0, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="estado" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#9CA3AF' }} height={70} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatTooltipNumber(v)} cursor={{ fill: '#F9FAFB' }} />
            <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px', color: '#6B7280' }} />
            <Bar dataKey="unidades" name="Unidades" fill="#002F2A" />
            <Bar dataKey="consultoriosHabilitados" name="Consultorios Habilitados" fill="#A57F2C" />
            <Bar dataKey="consultoriosLevantados" name="Consultorios Levantados" fill="#1A6B5E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
