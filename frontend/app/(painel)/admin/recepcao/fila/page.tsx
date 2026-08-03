'use client';

import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useState, useEffect } from 'react';
import { Users, Plus, Phone, Clock, UserCheck, Trash2, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClienteFila {
    id: string;
    nomeCliente: string;
    telefone: string | null;
    quantidadePessoas: number;
    status: 'aguardando' | 'chamado' | 'sentado' | 'cancelado';
    createdAt: string;
}

export default function FilaEsperaPage() {
    const [fila, setFila] = useState<ClienteFila[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [nomeCliente, setNomeCliente] = useState('');
    const [telefone, setTelefone] = useState('');
    const [quantidadePessoas, setQuantidadePessoas] = useState('2');

    useEffect(() => {
        carregarFila();
    }, []);

    const carregarFila = async () => {
        try {
            const data = await api.get<ClienteFila[]>('/gestor/recepcao/fila');
            setFila(data);
        } catch (error) {
            console.error('Erro ao carregar fila:', error);
            toast.error('Erro ao carregar fila de espera');
        } finally {
            setLoading(false);
        }
    };

    const adicionarFila = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post('/gestor/recepcao/fila', {
                nomeCliente,
                telefone,
                quantidadePessoas: Number(quantidadePessoas)
            });
            toast.success('Cliente adicionado à fila!');
            // Limpa form
            setNomeCliente('');
            setTelefone('');
            setQuantidadePessoas('2');
            
            // Recarrega
            carregarFila();
        } catch (error) {
            console.error('Erro ao adicionar à fila', error);
            toast.error('Erro ao adicionar à fila');
        } finally {
            setIsSubmitting(false);
        }
    };

    const atualizarStatus = async (id: string, novoStatus: string) => {
        try {
            await api.patch(`/gestor/recepcao/fila/${id}/status`, { status: novoStatus });
            toast.success('Status atualizado');
            carregarFila();
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    const removerFila = async (id: string) => {
        if (!confirm('Deseja realmente remover este cliente da fila?')) return;
        try {
            await api.delete(`/gestor/recepcao/fila/${id}`);
            toast.success('Removido da fila');
            carregarFila();
        } catch (error) {
            toast.error('Erro ao remover da fila');
        }
    };

    const formatarDataTime = (data: string) => {
        return new Date(data).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600">Carregando fila...</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aguardando': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'chamado': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'sentado': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const StatusLabel = ({ status }: { status: string }) => {
        const labels: Record<string, string> = {
            'aguardando': 'Aguardando',
            'chamado': 'Chamado',
            'sentado': 'Sentado',
            'cancelado': 'Cancelado'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fila de Espera</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Gerencie os clientes aguardando por uma mesa.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Col */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Plus className="w-5 h-5 text-primary-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Novo na Fila</h2>
                        </div>
                        <form onSubmit={adicionarFila} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente *</label>
                                <input
                                    type="text"
                                    required
                                    value={nomeCliente}
                                    onChange={e => setNomeCliente(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (opcional)</label>
                                <input
                                    type="tel"
                                    value={telefone}
                                    onChange={e => setTelefone(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Pessoas *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={quantidadePessoas}
                                    onChange={e => setQuantidadePessoas(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 mt-2"
                            >
                                {isSubmitting ? 'Adicionando...' : 'Adicionar à Fila'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Col */}
                <div className="lg:col-span-2">
                    {fila.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Fila Vazia</h3>
                            <p className="text-gray-500 mt-1">Nenhum cliente aguardando mesa no momento.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {fila.map((cliente, index) => (
                                <div key={cliente.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-gray-50 text-gray-500 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                                            {index + 1}º
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 text-lg">{cliente.nomeCliente}</h3>
                                                <StatusLabel status={cliente.status} />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" /> {cliente.quantidadePessoas} pessoas
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" /> Chegou às {formatarDataTime(cliente.createdAt)}
                                                </span>
                                                {cliente.telefone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-4 h-4" /> {cliente.telefone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4">
                                        {cliente.status === 'aguardando' && (
                                            <button 
                                                onClick={() => atualizarStatus(cliente.id, 'chamado')}
                                                className="p-2 text-blue-600 hover:bg-blue-50 bg-blue-50/50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                                title="Chamar Cliente"
                                            >
                                                <Bell className="w-4 h-4" />
                                                <span className="hidden sm:inline">Chamar</span>
                                            </button>
                                        )}
                                        {(cliente.status === 'aguardando' || cliente.status === 'chamado') && (
                                            <button 
                                                onClick={() => atualizarStatus(cliente.id, 'sentado')}
                                                className="p-2 text-green-600 hover:bg-green-50 bg-green-50/50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                                title="Marcar como Sentado"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                <span className="hidden sm:inline">Sentou</span>
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => removerFila(cliente.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remover da Fila"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
