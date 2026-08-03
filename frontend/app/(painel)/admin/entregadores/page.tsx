'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, RefreshCw, MapPin, Phone, Wifi, WifiOff, Package, CheckCircle, Navigation, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Localizacao { lat: string; lng: string; createdAt: string }
interface CorridaAtiva {
    id: string;
    status: string;
    comanda: { codigo: string; nomeCliente: string; enderecoEntrega?: { logradouro: string; numero: string; bairro: string } | null };
}
interface Entregador {
    id: string;
    nome: string;
    telefone?: string;
    statusEntregador: 'offline' | 'online' | 'pausado' | 'em_corrida' | null;
    corridasComoEntregador: CorridaAtiva[];
    localizacoes: Localizacao[];
}
interface Corrida {
    id: string;
    status: string;
    entregador: { id: string; nome: string };
    comanda: { codigo: string; nomeCliente: string; enderecoEntrega?: { logradouro: string; numero: string; bairro: string } | null };
    createdAt: string;
}
interface ComandaDelivery { id: string; codigo: string; nomeCliente: string; totalEstimado: number }

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
    offline:    { label: 'Offline',    cls: 'bg-gray-100 text-gray-500' },
    online:     { label: 'Disponível', cls: 'bg-green-100 text-green-700' },
    pausado:    { label: 'Pausado',    cls: 'bg-amber-100 text-amber-700' },
    em_corrida: { label: 'Em Corrida', cls: 'bg-blue-100 text-blue-700' },
};
const CORRIDA_LABEL: Record<string, string> = {
    oferecida: '🔔 Oferta enviada', aceita: '✅ Aceita', em_coleta: '🏪 A caminho do local',
    coletada: '📦 Coletada', em_entrega: '🚴 Em entrega', entregue: '✅ Entregue', cancelada: '❌ Cancelada',
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

export default function EntregadoresPage() {
    const router = useRouter();
    const [entregadores, setEntregadores] = useState<Entregador[]>([]);
    const [corridas, setCorridas] = useState<Corrida[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAtribuirModal, setShowAtribuirModal] = useState(false);
    const [comandasDelivery, setComandasDelivery] = useState<ComandaDelivery[]>([]);
    const [formAtribuir, setFormAtribuir] = useState({ entregadorId: '', comandaId: '' });
    const [atribuindo, setAtribuindo] = useState(false);

    const headers = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

    const carregar = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/login'); return; }

        const [entRes, corRes] = await Promise.allSettled([
            fetch(`${API_URL}/api/delivery/entregadores`, { headers: headers() }),
            fetch(`${API_URL}/api/delivery/corridas`, { headers: headers() }),
        ]);

        if (entRes.status === 'fulfilled' && entRes.value.ok)
            setEntregadores(await entRes.value.json());
        if (corRes.status === 'fulfilled' && corRes.value.ok)
            setCorridas(await corRes.value.json());

        setLoading(false);
    }, [router]);

    useEffect(() => {
        carregar();
        const interval = setInterval(carregar, 15000);
        return () => clearInterval(interval);
    }, [carregar]);

    const abrirAtribuir = async () => {
        try {
            const res = await fetch(`${API_URL}/api/garcom/comandas?status=ativa`, { headers: headers() });
            if (res.ok) {
                const data = await res.json();
                setComandasDelivery(data.filter((c: any) => c.tipoComanda === 'delivery'));
            }
        } catch { toast.error('Erro ao carregar comandas'); }
        setShowAtribuirModal(true);
    };

    const atribuirCorrida = async () => {
        if (!formAtribuir.entregadorId || !formAtribuir.comandaId) { toast.error('Selecione entregador e comanda'); return; }
        setAtribuindo(true);
        try {
            const res = await fetch(`${API_URL}/api/delivery/corridas`, {
                method: 'POST', headers: headers(),
                body: JSON.stringify({ comandaId: formAtribuir.comandaId, entregadorId: formAtribuir.entregadorId }),
            });
            if (res.ok) {
                toast.success('Corrida criada e oferta enviada!');
                setShowAtribuirModal(false);
                setFormAtribuir({ entregadorId: '', comandaId: '' });
                carregar();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Erro ao criar corrida');
            }
        } catch { toast.error('Erro de rede'); }
        finally { setAtribuindo(false); }
    };

    const atualizarCorrida = async (corridaId: string, status: string) => {
        const res = await fetch(`${API_URL}/api/delivery/corridas/${corridaId}/status`, {
            method: 'PATCH', headers: headers(), body: JSON.stringify({ status }),
        });
        if (res.ok) { toast.success(`Corrida → ${status}`); carregar(); }
        else toast.error('Erro ao atualizar corrida');
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

    const online = entregadores.filter(e => e.statusEntregador && e.statusEntregador !== 'offline');
    const corridasAtivas = corridas.filter(c => !['entregue', 'cancelada', 'recusada'].includes(c.status));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Truck className="w-7 h-7 text-[#FF5C01]" /> Entregadores
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">{online.length} online · {corridasAtivas.length} corridas ativas</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={carregar} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium">
                        <RefreshCw className="w-4 h-4" /> Atualizar
                    </button>
                    <button onClick={abrirAtribuir} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5C01] text-white font-semibold hover:bg-[#e05101] text-sm shadow-sm">
                        <Plus className="w-4 h-4" /> Atribuir Corrida
                    </button>
                </div>
            </div>

            {/* Grid: Entregadores + Corridas Ativas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Entregadores */}
                <div>
                    <h2 className="text-base font-semibold text-gray-700 mb-3">Entregadores ({entregadores.length})</h2>
                    {entregadores.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                            <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Nenhum entregador cadastrado</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entregadores.map(e => {
                                const badge = STATUS_LABEL[e.statusEntregador ?? 'offline'];
                                const corridaAtual = e.corridasComoEntregador[0];
                                const loc = e.localizacoes[0];
                                return (
                                    <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${e.statusEntregador === 'online' || e.statusEntregador === 'em_corrida' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <span className="font-semibold text-gray-900">{e.nome}</span>
                                            </div>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                                        </div>
                                        {e.telefone && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Phone className="w-3 h-3" />{e.telefone}</p>
                                        )}
                                        {loc && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <Navigation className="w-3 h-3" />
                                                Última loc: {new Date(loc.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                        {corridaAtual && (
                                            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-blue-600 font-medium">
                                                {CORRIDA_LABEL[corridaAtual.status] ?? corridaAtual.status} — {corridaAtual.comanda.nomeCliente}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Corridas Ativas */}
                <div>
                    <h2 className="text-base font-semibold text-gray-700 mb-3">Corridas Ativas ({corridasAtivas.length})</h2>
                    {corridasAtivas.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                            <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Sem corridas ativas no momento</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {corridasAtivas.map(c => (
                                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{c.comanda.nomeCliente}</p>
                                            {c.comanda.enderecoEntrega && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    {c.comanda.enderecoEntrega.logradouro}, {c.comanda.enderecoEntrega.numero} — {c.comanda.enderecoEntrega.bairro}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                            {CORRIDA_LABEL[c.status] ?? c.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-400">🚴 {c.entregador.nome}</p>
                                        {c.status === 'oferecida' && (
                                            <button
                                                onClick={() => atualizarCorrida(c.id, 'cancelada')}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Atribuir Corrida */}
            {showAtribuirModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-lg text-gray-900">Atribuir Corrida</h2>
                            <button onClick={() => setShowAtribuirModal(false)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Entregador disponível</label>
                                <select
                                    value={formAtribuir.entregadorId}
                                    onChange={e => setFormAtribuir(p => ({ ...p, entregadorId: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none bg-white"
                                >
                                    <option value="">Selecione...</option>
                                    {entregadores.filter(e => e.statusEntregador === 'online').map(e => (
                                        <option key={e.id} value={e.id}>{e.nome}</option>
                                    ))}
                                </select>
                                {entregadores.filter(e => e.statusEntregador === 'online').length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">⚠️ Nenhum entregador online no momento</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Pedido delivery</label>
                                <select
                                    value={formAtribuir.comandaId}
                                    onChange={e => setFormAtribuir(p => ({ ...p, comandaId: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none bg-white"
                                >
                                    <option value="">Selecione...</option>
                                    {comandasDelivery.map(c => (
                                        <option key={c.id} value={c.id}>{c.nomeCliente} — R$ {Number(c.totalEstimado).toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowAtribuirModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                                    Cancelar
                                </button>
                                <button
                                    onClick={atribuirCorrida}
                                    disabled={atribuindo}
                                    className="flex-1 py-2.5 bg-[#FF5C01] text-white rounded-xl font-bold hover:bg-[#e05101] disabled:opacity-70 transition-colors"
                                >
                                    {atribuindo ? 'Criando...' : 'Atribuir'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
