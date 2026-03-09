'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Plus, Download, RefreshCw, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

type StatusMesa = 'livre' | 'reservada' | 'ocupada';

interface Mesa {
    id: string;
    numero: string;
    capacidade: number;
    qrCodeUrl: string;
    ativo: boolean;
    status?: StatusMesa; // opcional: livre | reservada | ocupada (mock se API não tiver)
}

export default function MesasPage() {
    const router = useRouter();
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        numero: '',
        capacidade: 4,
    });

    useEffect(() => {
        carregarMesas();
    }, []);

    const carregarMesas = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch('http://localhost:3001/api/gestor/mesas', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMesas(data);
            } else if (response.status === 401) {
                toast.error('Sessão expirada');
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('Erro ao carregar mesas:', error);
            toast.error('Erro ao carregar mesas');
        } finally {
            setLoading(false);
        }
    };

    const criarMesa = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/gestor/mesas', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Mesa criada com sucesso!');
                setShowModal(false);
                setFormData({ numero: '', capacidade: 4 });
                carregarMesas();
            } else {
                toast.error('Erro ao criar mesa');
            }
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao criar mesa');
        }
    };

    const downloadQRCode = async (mesaId: string, numero: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/gestor/mesas/${mesaId}/qrcode`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mesa-${numero}-qrcode.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('QR Code baixado!');
            }
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao baixar QR Code');
        }
    };

    const deletarMesa = async (mesaId: string) => {
        if (!confirm('Deseja realmente deletar esta mesa?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/gestor/mesas/${mesaId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success('Mesa deletada!');
                carregarMesas();
            } else {
                toast.error('Erro ao deletar mesa');
            }
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao deletar mesa');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando mesas...</p>
                </div>
            </div>
        );
    }

    const statusMesa = (m: Mesa): StatusMesa => (m.status ?? (m.ativo ? 'livre' : 'ocupada'));
    const livres = mesas.filter(m => statusMesa(m) === 'livre').length;
    const reservadas = mesas.filter(m => statusMesa(m) === 'reservada').length;
    const ocupadas = mesas.filter(m => statusMesa(m) === 'ocupada').length;

    return (
        <div className="space-y-6">
            {/* Header estilo Stitch */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Mesas e QR Codes</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button type="button" className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600">
                        Interno
                    </button>
                    <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">
                        Externo
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="search" placeholder="Buscar" className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm w-40 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                    </div>
                    <button onClick={carregarMesas} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => setShowModal(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-orange-600 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nova Mesa
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Grid de mesas estilo Stitch */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {mesas.map((mesa) => {
                            const status = statusMesa(mesa);
                            const isLivre = status === 'livre';
                            const isReservada = status === 'reservada';
                            return (
                                <div
                                    key={mesa.id}
                                    className={`rounded-xl border-2 p-4 text-center transition-shadow hover:shadow-md ${
                                        isLivre ? 'border-green-500 bg-green-50/50' : isReservada ? 'border-orange-400 bg-orange-50/50' : 'border-orange-600 bg-orange-100/30'
                                    }`}
                                >
                                    <p className="font-bold text-gray-900 text-lg">T{mesa.numero}</p>
                                    <p className="text-sm mt-1 text-gray-600">
                                        {isLivre && 'Livre'}
                                        {isReservada && 'Reservada'}
                                        {status === 'ocupada' && 'Ocupada'}
                                    </p>
                                    <div className="mt-3 flex justify-center gap-2">
                                        <button onClick={() => downloadQRCode(mesa.id, mesa.numero)} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600" title="Baixar QR">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600" title="Editar">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deletarMesa(mesa.id)} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-red-50 text-red-600" title="Excluir">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {mesas.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="font-medium">Status da Mesa:</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Livre: {livres}</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Reservada: {reservadas}</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600" /> Ocupada: {ocupadas}</span>
                        </div>
                    )}
                    {mesas.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                            <QrCode className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Nenhuma mesa cadastrada</p>
                            <button onClick={() => setShowModal(true)} className="mt-3 text-orange-600 font-medium hover:underline">Criar primeira mesa</button>
                        </div>
                    )}
                </div>
                {/* Sidebar Reservas Ativas - estilo Stitch */}
                <div className="w-full lg:w-80 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <div className="flex border-b border-gray-100">
                            <button type="button" className="flex-1 py-3 px-4 text-sm font-medium text-orange-600 bg-orange-50 border-b-2 border-orange-500">Reservas Ativas (0)</button>
                            <button type="button" className="flex-1 py-3 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50">Chegadas (0)</button>
                        </div>
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            <p className="text-gray-500 text-sm text-center py-6">Nenhuma reserva ativa no momento.</p>
                            <div className="flex gap-2 mt-4">
                                <button type="button" className="flex-1 py-2 rounded-lg border border-orange-500 text-orange-600 text-sm font-medium hover:bg-orange-50">Cancelar</button>
                                <button type="button" className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600">Check-in</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Universal - compacto */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-sm p-5 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <QrCode className="w-8 h-8 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">QR Code Universal</h3>
                            <p className="text-purple-100 text-sm">Comanda individual (sem mesa).</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const qrCodeUrl = `${window.location.origin}/comanda/nova?tipo=individual`;
                                window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrCodeUrl)}`, '_blank');
                                toast.success('QR Code aberto em nova aba!');
                            }}
                            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-purple-50 flex items-center gap-2"
                        >
                            <QrCode className="w-4 h-4" />
                            Visualizar
                        </button>
                        <button
                            onClick={() => {
                                const qrCodeUrl = `${window.location.origin}/comanda/nova?tipo=individual`;
                                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrCodeUrl)}`;
                                const a = document.createElement('a');
                                a.href = qrImageUrl;
                                a.download = 'qrcode-comanda-individual.png';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                toast.success('QR Code baixado!');
                            }}
                            className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-purple-400 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Baixar
                        </button>
                    </div>
                </div>
            </div>

                {/* Modal de Nova Mesa */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Nova Mesa
                            </h2>

                            <form onSubmit={criarMesa} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Número da Mesa *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: 1, 2, 3..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Capacidade *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.capacidade}
                                        onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Número de pessoas"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setFormData({ numero: '', capacidade: 4 });
                                        }}
                                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Criar Mesa
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
}
