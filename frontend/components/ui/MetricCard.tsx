/**
 * MetricCard — Card de métrica para dashboards
 *
 * Uso:
 *   <MetricCard
 *     title="Comandas Ativas"
 *     value={42}
 *     icon="receipt_long"
 *     trend={{ value: 12, positive: true }}
 *     color="orange"
 *   />
 */

interface MetricCardProps {
    title: string;
    value: string | number;
    /** Nome do ícone do Material Symbols */
    icon?: string;
    /** Subtítulo/descrição abaixo do valor */
    subtitle?: string;
    /** Indicador de tendência */
    trend?: {
        value: number;
        positive: boolean;
        label?: string;
    };
    /** Cor de destaque do card */
    color?: 'orange' | 'green' | 'blue' | 'purple' | 'red' | 'slate';
    /** Mostra skeleton loader */
    loading?: boolean;
    /** Ação ao clicar no card */
    onClick?: () => void;
}

const colorMap = {
    orange: {
        bg: 'bg-orange-50',
        icon: 'bg-orange-100 text-orange-600',
        value: 'text-orange-600',
        border: 'border-orange-100',
    },
    green: {
        bg: 'bg-green-50',
        icon: 'bg-green-100 text-green-600',
        value: 'text-green-600',
        border: 'border-green-100',
    },
    blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        value: 'text-blue-600',
        border: 'border-blue-100',
    },
    purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        value: 'text-purple-600',
        border: 'border-purple-100',
    },
    red: {
        bg: 'bg-red-50',
        icon: 'bg-red-100 text-red-600',
        value: 'text-red-600',
        border: 'border-red-100',
    },
    slate: {
        bg: 'bg-slate-50',
        icon: 'bg-slate-100 text-slate-600',
        value: 'text-slate-700',
        border: 'border-slate-100',
    },
};

export function MetricCard({
    title,
    value,
    icon,
    subtitle,
    trend,
    color = 'slate',
    loading = false,
    onClick,
}: MetricCardProps) {
    const colors = colorMap[color];
    const isClickable = !!onClick;

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                    <div className="h-4 bg-slate-100 rounded w-24" />
                    <div className="w-11 h-11 bg-slate-100 rounded-xl" />
                </div>
                <div className="h-8 bg-slate-100 rounded w-20" />
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl border ${colors.border} p-6 shadow-sm transition-all
                ${isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
            `}
        >
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {title}
                </p>
                {icon && (
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.icon}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                )}
            </div>

            <p className={`text-3xl font-black mb-1 ${colors.value}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </p>

            {subtitle && (
                <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
            )}

            {trend && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="material-symbols-outlined text-sm">
                        {trend.positive ? 'trending_up' : 'trending_down'}
                    </span>
                    {trend.value}% {trend.label || (trend.positive ? 'de aumento' : 'de redução')}
                </div>
            )}
        </div>
    );
}
