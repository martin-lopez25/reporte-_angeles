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
import { Database, Layers3, Building2, Globe, ClipboardList } from 'lucide-react';
import type { DashboardStats, EntidadChart, InternetPieItem, TopFaltanteChart } from '../types';

interface ChartsProps {
  stats: DashboardStats;
  internetPie: InternetPieItem[];
  porEntidad: EntidadChart[];
  topFaltantes: TopFaltanteChart[];
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
  | 'cluesCapturadas'
  | 'entidadesCapturadas'
  | 'unidadesInternet'
  | 'consultoriosLevantados';

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
    icon: Layers3,
    label: 'COBERTURA CLUES',
    key: 'cluesCapturadas',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  {
    icon: Building2,
    label: 'COBERTURA ENTIDADES',
    key: 'entidadesCapturadas',
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
    icon: ClipboardList,
    label: 'CONSULTORIOS LEVANTADOS',
    key: 'consultoriosLevantados',
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    valueColor: 'text-teal-700',
    border: 'border-teal-200',
  },
];

function pctLabel(actual: number, expected: number): string {
  if (expected <= 0) return '0.0%';
  return `${((actual / expected) * 100).toFixed(1)}%`;
}

function StatCard({
  def,
  value,
  expected,
  helper,
}: {
  def: StatCardDef;
  value: number;
  expected?: number;
  helper?: string;
}) {
  const { icon: Icon, label, bg, iconBg, iconColor, valueColor, border } = def;
  const pct = typeof expected === 'number' ? pctLabel(value, expected) : null;
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
      <p className={`relative text-3xl font-black tabular-nums ${valueColor}`}>{pct ?? value.toLocaleString('es-MX')}</p>
      {typeof expected === 'number' ? (
        <p className="mt-1 text-xs font-medium text-gray-500">
          {value.toLocaleString('es-MX')} de {expected.toLocaleString('es-MX')}
        </p>
      ) : null}
      {helper ? <p className="mt-1 text-xs text-gray-500">{helper}</p> : null}
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
  const values: Record<StatKey, { value: number; expected?: number; helper?: string }> = {
    cluesCapturadas: {
      value: stats.cluesCapturadas,
      expected: stats.baseCluesEsperadas,
    },
    entidadesCapturadas: {
      value: stats.entidadesCapturadas,
      expected: stats.baseEntidadesEsperadas,
    },
    unidadesInternet: {
      value: stats.unidadesInternet,
      expected: stats.baseCluesEsperadas,
    },
    consultoriosLevantados: {
      value: stats.consultoriosLevantados,
      expected: stats.baseCluesEsperadas,
    },
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STAT_CARDS.map((def) => (
        <StatCard
          key={def.key}
          def={def}
          value={values[def.key].value}
          expected={values[def.key].expected}
          helper={values[def.key].helper}
        />
      ))}
    </div>
  );
}

export function Charts({
  internetPie,
  porEntidad,
  topFaltantes,
}: ChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Top 10 cosas mas frecuentes que no tienen" subtitle="Frecuencia de faltantes por pregunta en consultorios levantados">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topFaltantes} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis type="category" dataKey="item" tick={{ fontSize: 10, fill: '#6B7280' }} width={180} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v, name, item) => {
                  if (name === 'pct') return [`${formatTooltipNumber(v)}%`, '%'];
                  return [formatTooltipNumber(v), 'Faltantes'];
                }}
                cursor={{ fill: '#F9FAFB' }}
              />
              <Bar dataKey="faltantes" fill="#A57F2C" radius={[0, 4, 4, 0]} />
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
            <XAxis dataKey="entidad" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#9CA3AF' }} height={70} />
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
