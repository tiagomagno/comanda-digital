/**
 * StatusBadge — Badge de status colorido e padronizado
 *
 * Uso:
 *   <StatusBadge status="em_preparo" />
 *   <StatusBadge status="ativo" variant="ativo" />
 *   <StatusBadge status="Entregue" customColor="bg-blue-100 text-blue-700" />
 */

// ─── Pedido ───────────────────────────────────────────────────────────────────

type StatusPedido = 'criado' | 'aguardando_pagamento' | 'pago' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado';

const PEDIDO_MAP: Record<StatusPedido, { label: string; classes: string }> = {
    criado: { label: 'Recebido', classes: 'bg-orange-100 text-orange-700' },
    aguardando_pagamento: { label: 'Ag. Pagamento', classes: 'bg-yellow-100 text-yellow-700' },
    pago: { label: 'Pago', classes: 'bg-green-100 text-green-700' },
    em_preparo: { label: 'Em Preparo', classes: 'bg-orange-100 text-[#FF6B00]' },
    pronto: { label: 'Pronto', classes: 'bg-green-100 text-green-700' },
    entregue: { label: 'Entregue', classes: 'bg-blue-100 text-blue-700' },
    cancelado: { label: 'Cancelado', classes: 'bg-red-100 text-red-600' },
};

// ─── Estabelecimento / genérico ───────────────────────────────────────────────

type StatusGenerico = 'ativo' | 'inativo' | 'pendente' | 'suspenso';

const GENERICO_MAP: Record<StatusGenerico, { label: string; classes: string }> = {
    ativo: { label: 'Ativo', classes: 'bg-green-100 text-green-700' },
    inativo: { label: 'Inativo', classes: 'bg-slate-100 text-slate-500' },
    pendente: { label: 'Pendente', classes: 'bg-yellow-100 text-yellow-700' },
    suspenso: { label: 'Suspenso', classes: 'bg-red-100 text-red-600' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
    status: StatusPedido | StatusGenerico | string;
    /** Override rótulo (exibe-se em vez do mapeamento) */
    label?: string;
    /** Tamanho do badge */
    size?: 'sm' | 'md';
    /** Classes Tailwind customizadas se o status não estiver mapeado */
    customColor?: string;
}

export function StatusBadge({ status, label, size = 'md', customColor }: StatusBadgeProps) {
    const pedidoInfo = PEDIDO_MAP[status as StatusPedido];
    const genericoInfo = GENERICO_MAP[status as StatusGenerico];
    const info = pedidoInfo || genericoInfo;

    const displayLabel = label || info?.label || status;
    const classes = customColor || info?.classes || 'bg-slate-100 text-slate-600';

    const sizeClasses = size === 'sm'
        ? 'px-2 py-0.5 text-[10px]'
        : 'px-3 py-1 text-xs';

    return (
        <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-tight ${sizeClasses} ${classes}`}>
            {displayLabel}
        </span>
    );
}
