/**
 * EmptyState — Estado vazio padronizado para listagens
 *
 * Uso:
 *   <EmptyState
 *     icon="receipt_long"
 *     title="Nenhum pedido encontrado"
 *     description="Quando houver pedidos, eles aparecerão aqui."
 *     action={{ label: "Fazer Pedido", onClick: handlePedido }}
 *   />
 */

interface EmptyStateAction {
    label: string;
    icon?: string;
    onClick: () => void;
}

interface EmptyStateProps {
    /** Nome do ícone Material Symbols */
    icon: string;
    title: string;
    description?: string;
    /** Botão de ação (ex: "Criar primeiro item") */
    action?: EmptyStateAction;
    /** Tamanho do ícone e do container */
    size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
    sm: { wrapper: 'py-8', iconContainer: 'w-14 h-14', icon: 'text-4xl', title: 'text-base', desc: 'text-xs' },
    md: { wrapper: 'py-16', iconContainer: 'w-20 h-20', icon: 'text-5xl', title: 'text-lg', desc: 'text-sm' },
    lg: { wrapper: 'py-24', iconContainer: 'w-28 h-28', icon: 'text-7xl', title: 'text-2xl', desc: 'text-base' },
};

export function EmptyState({ icon, title, description, action, size = 'md' }: EmptyStateProps) {
    const s = sizeMap[size];

    return (
        <div className={`flex flex-col items-center justify-center text-center ${s.wrapper} px-4`}>
            <div className={`${s.iconContainer} bg-slate-100 rounded-3xl flex items-center justify-center mb-5`}>
                <span className={`material-symbols-outlined text-slate-300 ${s.icon}`}>{icon}</span>
            </div>

            <h3
                className={`font-bold text-slate-700 mb-2 ${s.title}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
            >
                {title}
            </h3>

            {description && (
                <p className={`text-slate-400 font-medium max-w-sm ${s.desc}`}>
                    {description}
                </p>
            )}

            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-6 flex items-center gap-2 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20"
                >
                    {action.icon && (
                        <span className="material-symbols-outlined text-lg">{action.icon}</span>
                    )}
                    {action.label}
                </button>
            )}
        </div>
    );
}
