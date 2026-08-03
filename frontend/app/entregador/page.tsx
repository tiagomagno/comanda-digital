'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Package, CheckCircle, Phone, Wifi, WifiOff, Loader2, RefreshCw, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

const STATUS_CORRIDA_LABEL: Record<string, { label: string; proximo?: string; botao?: string; cor: string }> = {
    oferecida:  { label: '🔔 Nova corrida disponível!', proximo: 'aceita',     botao: 'Aceitar Corrida',        cor: 'bg-blue-500' },
    aceita:     { label: '✅ Corrida aceita — vá até o estabelecimento', proximo: 'em_coleta',  botao: 'Estou a caminho',      cor: 'bg-amber-500' },
    em_coleta:  { label: '🏪 A caminho do estabelecimento', proximo: 'coletada',  botao: 'Coletei o Pedido',     cor: 'bg-orange-500' },
    coletada:   { label: '📦 Pedido coletado — entregue ao cliente!', proximo: 'em_entrega', botao: 'Saí para Entrega',     cor: 'bg-purple-500' },
    em_entrega: { label: '🚴 Em rota de entrega', proximo: 'entregue',  botao: '✅ Pedido Entregue!',    cor: 'bg-green-500' },
    entregue:   { label: '✅ Entregue com sucesso!', cor: 'bg-gray-400' },
    cancelada:  { label: '❌ Corrida cancelada', cor: 'bg-gray-400' },
    recusada:   { label: '❌ Corrida recusada', cor: 'bg-gray-400' },
};

interface Corrida {
    id: string;
    status: string;
    comanda: {
        codigo: string;
        nomeCliente: string;
        telefoneCliente: string;
        totalEstimado: number;
        pedidos: Array<{ itens: Array<{ quantidade: number; produto: { nome: string } }> }>;
        enderecoEntrega?: {
            logradouro: string; numero: string; complemento?: string;
            bairro: string; cidade: string; estado: string; referencia?: string;
        } | null;
    };
}

export default function EntregadorPage() {
    const [corridas, setCorridas] = useState<Corrida[]>([]);
    const [statusOnline, setStatusOnline] = useState<'offline' | 'online' | 'pausado' | 'em_corrida'>('offline');
    const [loading, setLoading] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [compartilhandoGPS, setCompartilhandoGPS] = useState(false);
    const [gpsInterval, setGpsInterval] = useState<ReturnType<typeof setInterval> | null>(null);

    const headers = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
    });

    const carregarCorridas = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/delivery/minhas-corridas`, { headers: headers() });
            if (res.ok) setCorridas(await res.json());
        } catch { /* silencioso */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        carregarCorridas();
        const interval = setInterval(carregarCorridas, 10000);
        return () => clearInterval(interval);
    }, [carregarCorridas]);

    useEffect(() => {
        return () => { if (gpsInterval) clearInterval(gpsInterval); };
    }, [gpsInterval]);

    const atualizarMeuStatus = async (novoStatus: typeof statusOnline) => {
        setAtualizando(true);
        try {
            const res = await fetch(`${API_URL}/api/delivery/meu-status`, {
                method: 'PATCH', headers: headers(), body: JSON.stringify({ status: novoStatus }),
            });
            if (res.ok) {
                setStatusOnline(novoStatus);
                toast.success(novoStatus === 'online' ? '🟢 Você está online!' : '⭕ Você está offline');
            }
        } catch { toast.error('Erro ao atualizar status'); }
        finally { setAtualizando(false); }
    };

    const atualizarStatusCorrida = async (corridaId: string, novoStatus: string) => {
        setAtualizando(true);
        try {
            const res = await fetch(`${API_URL}/api/delivery/corridas/${corridaId}/acao`, {
                method: 'PATCH', headers: headers(), body: JSON.stringify({ status: novoStatus }),
            });
            if (res.ok) {
                toast.success(STATUS_CORRIDA_LABEL[novoStatus]?.label ?? 'Atualizado!');
                carregarCorridas();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Erro ao atualizar');
            }
        } catch { toast.error('Erro de rede'); }
        finally { setAtualizando(false); }
    };

    const recusarCorrida = async (corridaId: string) => {
        await atualizarStatusCorrida(corridaId, 'recusada');
    };

    const toggleGPS = () => {
        if (compartilhandoGPS) {
            if (gpsInterval) clearInterval(gpsInterval);
            setGpsInterval(null);
            setCompartilhandoGPS(false);
            toast('📍 GPS desativado');
            return;
        }

        if (!navigator.geolocation) { toast.error('Geolocalização não suportada'); return; }

        const enviarLocalizacao = () => {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    await fetch(`${API_URL}/api/delivery/localizacao`, {
                        method: 'POST', headers: headers(),
                        body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    });
                },
                (err) => console.warn('GPS:', err.message)
            );
        };

        enviarLocalizacao();
        const interval = setInterval(enviarLocalizacao, 30000);
        setGpsInterval(interval);
        setCompartilhandoGPS(true);
        toast.success('📍 Compartilhando localização (a cada 30s)');
    };

    const corridasAtivas = corridas.filter(c => !['entregue', 'cancelada', 'recusada'].includes(c.status));

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center"><Loader2 className="w-10 h-10 text-[#FF5C01] animate-spin mx-auto mb-3" /><p className="text-gray-500">Carregando...</p></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Truck className="w-7 h-7 text-[#FF5C01]" />
                    <h1 className="text-xl font-bold text-gray-900">Dine — Entregador</h1>
                </div>
                <button onClick={carregarCorridas} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            <div className="px-4 space-y-4 mt-4">
                {/* Status + GPS */}
                <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                    {/* Toggle Online/Offline */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900">Meu Status</p>
                            <p className="text-sm text-gray-500">
                                {statusOnline === 'online' ? 'Visível para novas corridas' :
                                 statusOnline === 'em_corrida' ? 'Em corrida ativa' :
                                 statusOnline === 'pausado' ? 'Em pausa' : 'Fora de serviço'}
                            </p>
                        </div>
                        <button
                            onClick={() => atualizarMeuStatus(statusOnline === 'online' ? 'offline' : 'online')}
                            disabled={atualizando || statusOnline === 'em_corrida'}
                            className={`relative w-16 h-8 rounded-full transition-colors duration-200 ${statusOnline === 'online' || statusOnline === 'em_corrida' ? 'bg-green-500' : 'bg-gray-300'} disabled:opacity-60`}
                        >
                            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${statusOnline === 'online' || statusOnline === 'em_corrida' ? 'translate-x-9' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* GPS Sharing */}
                    <button
                        onClick={toggleGPS}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                            compartilhandoGPS
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <Navigation className="w-4 h-4" />
                        {compartilhandoGPS ? '📍 Compartilhando localização — Desativar' : '📍 Ativar GPS'}
                    </button>
                </div>

                {/* Corridas Ativas */}
                {corridasAtivas.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-600 mb-1">Nenhuma corrida pendente</h3>
                        <p className="text-sm text-gray-400">Fique online para receber corridas</p>
                    </div>
                ) : (
                    corridasAtivas.map(corrida => {
                        const statusInfo = STATUS_CORRIDA_LABEL[corrida.status];
                        const itensPedido = corrida.comanda.pedidos?.[0]?.itens ?? [];

                        return (
                            <div key={corrida.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {/* Status Banner */}
                                <div className={`${statusInfo.cor} px-4 py-3`}>
                                    <p className="text-white font-bold text-sm">{statusInfo.label}</p>
                                </div>

                                <div className="p-4 space-y-3">
                                    {/* Cliente */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-900">{corrida.comanda.nomeCliente}</p>
                                            <p className="text-sm text-gray-500 font-mono">{corrida.comanda.telefoneCliente}</p>
                                        </div>
                                        <a
                                            href={`tel:${corrida.comanda.telefoneCliente}`}
                                            className="p-2.5 bg-green-50 rounded-xl text-green-600 hover:bg-green-100"
                                        >
                                            <Phone className="w-5 h-5" />
                                        </a>
                                    </div>

                                    {/* Endereço */}
                                    {corrida.comanda.enderecoEntrega && (
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> ENDEREÇO DE ENTREGA
                                            </p>
                                            <p className="font-medium text-gray-800 text-sm">
                                                {corrida.comanda.enderecoEntrega.logradouro}, {corrida.comanda.enderecoEntrega.numero}
                                                {corrida.comanda.enderecoEntrega.complemento && ` — ${corrida.comanda.enderecoEntrega.complemento}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {corrida.comanda.enderecoEntrega.bairro}, {corrida.comanda.enderecoEntrega.cidade} — {corrida.comanda.enderecoEntrega.estado}
                                            </p>
                                            {corrida.comanda.enderecoEntrega.referencia && (
                                                <p className="text-xs text-amber-600 mt-0.5">📌 {corrida.comanda.enderecoEntrega.referencia}</p>
                                            )}
                                            <a
                                                href={`https://maps.google.com?q=${encodeURIComponent(
                                                    `${corrida.comanda.enderecoEntrega.logradouro} ${corrida.comanda.enderecoEntrega.numero}, ${corrida.comanda.enderecoEntrega.bairro}, ${corrida.comanda.enderecoEntrega.cidade}`
                                                )}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                                            >
                                                <Navigation className="w-3 h-3" /> Abrir no Maps
                                            </a>
                                        </div>
                                    )}

                                    {/* Itens do pedido */}
                                    {itensPedido.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-1">ITENS DO PEDIDO</p>
                                            <div className="space-y-1">
                                                {itensPedido.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.quantidade}x</span>
                                                        <span className="text-gray-700">{item.produto.nome}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Valor */}
                                    <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                        <span className="text-sm text-gray-500 font-medium">Valor do pedido</span>
                                        <span className="font-bold text-gray-900">R$ {Number(corrida.comanda.totalEstimado).toFixed(2)}</span>
                                    </div>

                                    {/* Botões de ação */}
                                    <div className="space-y-2 pt-1">
                                        {statusInfo.proximo && statusInfo.botao && (
                                            <button
                                                onClick={() => atualizarStatusCorrida(corrida.id, statusInfo.proximo!)}
                                                disabled={atualizando}
                                                className={`w-full py-4 rounded-xl text-white font-bold text-base ${statusInfo.cor} hover:opacity-90 disabled:opacity-60 transition-all active:scale-95 flex items-center justify-center gap-2`}
                                            >
                                                {atualizando ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                                {statusInfo.botao}
                                            </button>
                                        )}
                                        {corrida.status === 'oferecida' && (
                                            <button
                                                onClick={() => recusarCorrida(corrida.id)}
                                                disabled={atualizando}
                                                className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
                                            >
                                                Recusar Corrida
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
