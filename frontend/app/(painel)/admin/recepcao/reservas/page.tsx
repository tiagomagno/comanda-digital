'use client';

import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useState, useEffect } from 'react';
import { CalendarDays, Plus, Phone, Users, CheckCircle2, XCircle, Trash2, Clock, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Reserva {
    id: string;
    nomeCliente: string;
    telefone: string;
    quantidadePessoas: number;
    dataHora: string;
    observacoes: string | null;
    status: 'pendente' | 'confirmada' | 'cancelada' | 'concluida';
    createdAt: string;
}

export default function ReservasPage() {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [nomeCliente, setNomeCliente] = useState('');
    const [telefone, setTelefone] = useState('');
    const [quantidadePessoas, setQuantidadePessoas] = useState('2');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [observacoes, setObservacoes] = useState('');

    useEffect(() => {
        carregarReservas();
    }, []);

    const carregarReservas = async () => {
        try {
            const res = await api.get<Reserva[]>('/gestor/recepcao/reservas');
            setReservas(res);
        } catch (error) {
            console.error('Erro ao carregar reservas:', error);
            toast.error('Erro ao carregar reservas');
        } finally {
            setLoading(false);
        }
    };

    const adicionarReserva = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!data || !hora) {
                toast.error('Selecione data e hora da reserva');
                return;
            }

            const dataHoraObj = new Date(`${data}T${hora}`);

            setIsSubmitting(true);
            await api.post('/gestor/recepcao/reservas', {
                nomeCliente,
                telefone,
                quantidadePessoas: Number(quantidadePessoas),
                dataHora: dataHoraObj.toISOString(),
                observacoes
            });
            toast.success('Reserva cadastrada!');
            
            // Limpa form
            setNomeCliente('');
            setTelefone('');
            setQuantidadePessoas('2');
            setData('');
            setHora('');
            setObservacoes('');
            
            // Recarrega
            carregarReservas();
        } catch (error) {
            console.error('Erro ao adicionar reserva', error);
            toast.error('Erro ao cadastrar reserva');
        } finally {
            setIsSubmitting(false);
        }
    };

    const atualizarStatus = async (id: string, novoStatus: string) => {
        try {
            await api.patch(`/gestor/recepcao/reservas/${id}/status`, { status: novoStatus });
            toast.success('Status atualizado');
            carregarReservas();
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    const removerReserva = async (id: string) => {
        if (!confirm('Deseja realmente apagar esta reserva do sistema?')) return;
        try {
            await api.delete(`/gestor/recepcao/reservas/${id}`);
            toast.success('Reserva apagada');
            carregarReservas();
        } catch (error) {
            toast.error('Erro ao apagar reserva');
        }
    };

    const formatarData = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatarHora = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600">Carregando reservas...</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmada': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'concluida': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const StatusLabel = ({ status }: { status: string }) => {
        const labels: Record<string, string> = {
            'pendente': 'Pendente',
            'confirmada': 'Confirmada',
            'concluida': 'Concluída',
            'cancelada': 'Cancelada'
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
                    <h1 className="text-2xl font-bold text-gray-900">Reservas de Mesas</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Agende e gerencie as reservas antecipadas do seu estabelecimento.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Col */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Plus className="w-5 h-5 text-primary-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Nova Reserva</h2>
                        </div>
                        <form onSubmit={adicionarReserva} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente *</label>
                                <input
                                    type="text"
                                    required
                                    value={nomeCliente}
                                    onChange={e => setNomeCliente(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Ex: Ana Souza"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={telefone}
                                        onChange={e => setTelefone(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pessoas *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={quantidadePessoas}
                                        onChange={e => setQuantidadePessoas(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                                    <input
                                        type="date"
                                        required
                                        value={data}
                                        onChange={e => setData(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                                    <input
                                        type="time"
                                        required
                                        value={hora}
                                        onChange={e => setHora(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                <textarea
                                    value={observacoes}
                                    onChange={e => setObservacoes(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                                    placeholder="Preferência de mesa, cadeirinha..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 mt-2"
                            >
                                {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Col */}
                <div className="lg:col-span-2">
                    {reservas.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <CalendarDays className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Nenhuma Reserva</h3>
                            <p className="text-gray-500 mt-1">Você não possui agendamentos no sistema no momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reservas.map((reserva) => (
                                <div key={reserva.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md flex flex-col h-full">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1" title={reserva.nomeCliente}>
                                                {reserva.nomeCliente}
                                            </h3>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                                                <Phone className="w-3.5 h-3.5" />
                                                {reserva.telefone}
                                            </div>
                                        </div>
                                        <StatusLabel status={reserva.status} />
                                    </div>
                                    
                                    <div className="flex gap-2 mb-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex-1">
                                            <div className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                                                <CalendarDays className="w-3 h-3" /> Data
                                            </div>
                                            <div className="font-semibold text-gray-800 capitalize">
                                                {formatarData(reserva.dataHora)}
                                            </div>
                                        </div>
                                        <div className="w-px bg-gray-200"></div>
                                        <div className="flex-1 pl-2">
                                            <div className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Horário
                                            </div>
                                            <div className="font-semibold text-gray-800">
                                                {formatarHora(reserva.dataHora)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600 mb-4 font-medium">
                                        <Users className="w-4 h-4 mr-2" />
                                        Mesa para {reserva.quantidadePessoas} {(reserva.quantidadePessoas === 1) ? 'pessoa' : 'pessoas'}
                                    </div>
                                    
                                    {reserva.observacoes && (
                                        <p className="text-sm text-gray-600 italic bg-gray-50/50 p-2 rounded mb-4 line-clamp-2" title={reserva.observacoes}>
                                            "{reserva.observacoes}"
                                        </p>
                                    )}

                                    <div className="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {reserva.status === 'pendente' && (
                                                <button 
                                                    onClick={() => atualizarStatus(reserva.id, 'confirmada')}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Confirmar Reserva"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            {(reserva.status === 'pendente' || reserva.status === 'confirmada') && (
                                                <button 
                                                    onClick={() => atualizarStatus(reserva.id, 'concluida')}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                    title="Marcar como Compareceu (Concluída)"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                            )}
                                            {(reserva.status === 'pendente' || reserva.status === 'confirmada') && (
                                                <button 
                                                    onClick={() => atualizarStatus(reserva.id, 'cancelada')}
                                                    className="p-1.5 text-orange-500 hover:bg-orange-50 rounded transition-colors"
                                                    title="Cancelar Reserva"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <button 
                                            onClick={() => removerReserva(reserva.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors ml-auto flex items-center gap-1 text-sm font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
