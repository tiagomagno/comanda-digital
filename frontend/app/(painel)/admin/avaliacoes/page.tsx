'use client';

import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface Avaliacao {
    id: string;
    notaAtendimento: number;
    notaComida: number;
    comentario: string | null;
    createdAt: string;
    usuario?: {
        nome: string;
    };
    comanda?: {
        codigo: string;
    };
}

export default function AvaliacoesPage() {
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarAvaliacoes();
    }, []);

    const carregarAvaliacoes = async () => {
        try {
            const data = await api.get<Avaliacao[]>('/gestor/avaliacoes');
            setAvaliacoes(data);
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
            toast.error('Erro ao carregar avaliações');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600">Carregando avaliações...</p>
                </div>
            </div>
        );
    }

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Avaliações de Clientes</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Acompanhe o feedback e a satisfação dos seus clientes.
                    </p>
                </div>
            </div>

            {avaliacoes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma avaliação ainda</h3>
                    <p className="text-gray-500 mt-1">Quando os clientes avaliarem o atendimento, elas aparecerão aqui.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {avaliacoes.map((avaliacao) => (
                        <div key={avaliacao.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4 gap-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {avaliacao.usuario?.nome || 'Cliente Anônimo'}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Comanda: {avaliacao.comanda?.codigo || 'N/A'} • {formatarData(avaliacao.createdAt)}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 mb-4 text-sm bg-gray-50 p-3 rounded-lg">
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Atendimento</div>
                                    <div className="flex gap-1 items-center font-semibold text-gray-900">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        {avaliacao.notaAtendimento}
                                    </div>
                                </div>
                                <div className="w-px bg-gray-200"></div>
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Comida/Bebida</div>
                                    <div className="flex gap-1 items-center font-semibold text-gray-900">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        {avaliacao.notaComida}
                                    </div>
                                </div>
                            </div>

                            {avaliacao.comentario && (
                                <div className="mt-auto relative">
                                    <MessageSquare className="w-4 h-4 text-gray-300 absolute -top-1 left-0" />
                                    <p className="text-sm text-gray-600 italic pl-6 pt-1 break-words">
                                        "{avaliacao.comentario}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
