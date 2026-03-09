'use client';

interface PaymentChoiceProps {
    onSelect: (formaPagamento: 'imediato' | 'final') => void;
    loading?: boolean;
}

export default function PaymentChoice({ onSelect, loading = false }: PaymentChoiceProps) {
    return (
        <div>
            {/* Título */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    Como deseja pagar?
                </h2>
                <p className="text-gray-400 mt-1 text-base">
                    Escolha o fluxo ideal para sua experiência.
                </p>
            </div>

            {/* Cards */}
            <div className="grid gap-5">

                {/* Pagar Agora */}
                <button
                    onClick={() => onSelect('imediato')}
                    disabled={loading}
                    className="
                        group w-full text-left
                        border border-gray-200 bg-white
                        rounded-3xl p-7
                        flex items-start gap-5
                        transition-all duration-300 ease-in-out cursor-pointer
                        hover:border-[#FF5C00] hover:ring-1 hover:ring-[#FF5C00]/10 hover:bg-[#FFF7F2]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        shadow-sm hover:shadow-md
                    "
                >
                    {/* Ícone */}
                    <div className="
                        flex-shrink-0 w-14 h-14 rounded-2xl
                        bg-gray-50 border border-gray-100
                        flex items-center justify-center
                        transition-colors duration-300
                        group-hover:text-[#FF5C00]
                    ">
                        <span className="material-symbols-outlined text-3xl font-light text-gray-400 group-hover:text-[#FF5C00] transition-colors">
                            credit_card
                        </span>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <h3 className="text-xl font-bold text-gray-900">Pagar Agora</h3>
                            <span className="
                                flex-shrink-0
                                bg-gray-100 text-gray-500
                                px-3 py-1 rounded-full
                                text-[10px] font-bold uppercase tracking-widest
                                group-hover:bg-[#FF5C00]/10 group-hover:text-[#FF5C00]
                                transition-colors
                            ">
                                Fluxo Imediato
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-3 max-w-md">
                            O pagamento é realizado diretamente com o garçom logo após a confirmação do seu pedido.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                Pedido liberado após pagamento
                            </span>
                        </div>
                    </div>
                </button>

                {/* Pagar no Final */}
                <button
                    onClick={() => onSelect('final')}
                    disabled={loading}
                    className="
                        group w-full text-left
                        border border-gray-200 bg-white
                        rounded-3xl p-7
                        flex items-start gap-5
                        transition-all duration-300 ease-in-out cursor-pointer
                        hover:border-[#FF5C00] hover:ring-1 hover:ring-[#FF5C00]/10 hover:bg-[#FFF7F2]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        shadow-sm hover:shadow-md
                    "
                >
                    {/* Ícone */}
                    <div className="
                        flex-shrink-0 w-14 h-14 rounded-2xl
                        bg-gray-50 border border-gray-100
                        flex items-center justify-center
                        transition-colors duration-300
                    ">
                        <span className="material-symbols-outlined text-3xl font-light text-gray-400 group-hover:text-[#FF5C00] transition-colors">
                            receipt_long
                        </span>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <h3 className="text-xl font-bold text-gray-900">Pagar no Final</h3>
                            <span className="
                                flex-shrink-0
                                bg-gray-100 text-gray-500
                                px-3 py-1 rounded-full
                                text-[10px] font-bold uppercase tracking-widest
                                group-hover:bg-[#FF5C00]/10 group-hover:text-[#FF5C00]
                                transition-colors
                            ">
                                Fluxo Padrão
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-3 max-w-md">
                            Consuma à vontade e feche sua conta quando desejar sair, no caixa ou com o garçom.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                Pedido liberado imediatamente
                            </span>
                        </div>
                    </div>
                </button>
            </div>

            {/* Dica */}
            <div className="mt-10 pt-7 border-t border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#FF5C00] text-xl font-light">lightbulb</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                    <span className="font-bold text-gray-900">Dica:</span>{' '}
                    Você pode alterar a forma de pagamento nas configurações do seu pedido antes de finalizá-lo.
                </p>
            </div>
        </div>
    );
}
