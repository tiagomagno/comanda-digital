/**
 * LoadingSpinner — Spinner de carregamento padronizado
 *
 * Uso:
 *   <LoadingSpinner />                        // tamanho e cor padrão
 *   <LoadingSpinner size="lg" color="primary" />
 *   <LoadingSpinner fullScreen />             // cobre toda a tela
 */

interface LoadingSpinnerProps {
    /** Tamanho do spinner */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Cor do spinner */
    color?: 'primary' | 'white' | 'slate';
    /** Se true, centraliza na tela inteira */
    fullScreen?: boolean;
    /** Texto exibido abaixo do spinner */
    label?: string;
}

const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
};

const colorClasses = {
    primary: 'border-orange-200 border-t-orange-500',
    white: 'border-white/30 border-t-white',
    slate: 'border-slate-200 border-t-slate-600',
};

export function LoadingSpinner({
    size = 'md',
    color = 'primary',
    fullScreen = false,
    label,
}: LoadingSpinnerProps) {
    const spinner = (
        <div className="flex flex-col items-center gap-3">
            <div
                className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
                role="status"
                aria-label={label || 'Carregando...'}
            />
            {label && (
                <p className={`text-sm font-medium ${color === 'white' ? 'text-white/80' : 'text-slate-500'}`}>
                    {label}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                {spinner}
            </div>
        );
    }

    return spinner;
}
