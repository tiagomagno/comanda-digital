/**
 * PageHeader — Cabeçalho padrão para as páginas do painel interno
 *
 * Uso:
 *   <PageHeader
 *     title="Estabelecimentos"
 *     subtitle="Gerencie todos os estabelecimentos da plataforma"
 *     icon="store"
 *     action={{ label: "Novo", icon: "add", onClick: handleNovo }}
 *   />
 */

'use client';

import { useRouter } from 'next/navigation';

interface ActionButton {
    label: string;
    icon?: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    /** Nome do ícone Material Symbols */
    icon?: string;
    /** Botão de ação principal (ex: "Novo Estabelecimento") */
    action?: ActionButton;
    /** Botões secundários */
    actions?: ActionButton[];
    /** Se true, mostra botão voltar */
    showBack?: boolean;
}

const variantClasses = {
    primary: 'bg-[#FF6B00] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
};

export function PageHeader({
    title,
    subtitle,
    icon,
    action,
    actions = [],
    showBack = false,
}: PageHeaderProps) {
    const router = useRouter();
    const allActions = action ? [action, ...actions] : actions;

    return (
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
                {showBack && (
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
                        aria-label="Voltar"
                    >
                        <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                    </button>
                )}

                {icon && (
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#FF6B00]">{icon}</span>
                    </div>
                )}

                <div className="min-w-0">
                    <h1
                        className="text-2xl md:text-3xl font-bold text-slate-900 truncate"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>

            {allActions.length > 0 && (
                <div className="flex items-center gap-3 flex-shrink-0">
                    {allActions.map((btn, i) => (
                        <button
                            key={i}
                            onClick={btn.onClick}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${variantClasses[btn.variant || 'primary']}`}
                        >
                            {btn.icon && (
                                <span className="material-symbols-outlined text-lg">{btn.icon}</span>
                            )}
                            {btn.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
