'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Plus, Trash2, Copy, CheckCircle, X, Loader2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Canal {
    id: string;
    nome: string;
    tipo: string;
    ativo: boolean;
    webhookSecret?: string;
    _count: { pedidosExternos: number };
    createdAt: string;
}

interface PedidoExterno {
    id: string;
    externalId?: string;
    status: string;
    erroMensagem?: string;
    createdAt: string;
    payload: any;
}

const TIPOS_CANAL = [
    { val: 'whatsapp',    label: '📱 WhatsApp',    desc: 'Via Evolution API ou Twilio' },
    { val: 'ifood',       label: '🛵 iFood',        desc: 'Integração via webhook iFood' },
    { val: 'rappi',       label: '🛵 Rappi',        desc: 'Integração via webhook Rappi' },
    { val: 'instagram',   label: '📸 Instagram',    desc: 'DMs ou links de pedido' },
    { val: 'site_proprio',label: '🌐 Site Próprio', desc: 'API do seu e-commerce' },
    { val: 'telefone',    label: '📞 Telefone',     desc: 'Pedidos recebidos por telefone' },
    { val: 'generico',    label: '🔗 Genérico',     desc: 'Qualquer outro canal via webhook' },
];

const STATUS_BADGE: Record<string, string> = {
    recebido:   'bg-blue-100 text-blue-700',
    processado: 'bg-green-100 text-green-700',
    erro:       'bg-red-100 text-red-600',
    ignorado:   'bg-gray-100 text-gray-500',
};

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

export default function CanaisPage() {
    const router = useRouter();
    const [canais, setCanais] = useState<Canal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [form, setForm] = useState({ nome: '', tipo: 'whatsapp', webhookSecret: '' });
    const [canalDetalhe, setCanalDetalhe] = useState<Canal | null>(null);
    const [pedidosExternos, setPedidosExternos] = useState<PedidoExterno[]>([]);
    const [carregandoPedidos, setCarregandoPedidos] = useState(false);

    const h = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

    useEffect(() => { carregar(); }, []);

    const carregar = async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/login'); return; }
        const res = await fetch(`${API}/api/omnichannel/canais`, { headers: h() });
        if (res.ok) setCanais(await res.json());
        setLoading(false);
    };

    const salvar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
        setSalvando(true);
        const res = await fetch(`${API}/api/omnichannel/canais`, {
            method: 'POST', headers: h(),
            body: JSON.stringify({ nome: form.nome, tipo: form.tipo, webhookSecret: form.webhookSecret || undefined }),
        });
        if (res.ok) {
            const novo = await res.json();
            setCanais(prev => [{ ...novo, _count: { pedidosExternos: 0 } }, ...prev]);
            setShowModal(false);
            setForm({ nome: '', tipo: 'whatsapp', webhookSecret: '' });
            toast.success('Canal criado!');
        } else toast.error('Erro ao criar canal');
        setSalvando(false);
    };

    const toggleAtivo = async (canal: Canal) => {
        const res = await fetch(`${API}/api/omnichannel/canais/${canal.id}`, {
            method: 'PUT', headers: h(), body: JSON.stringify({ ativo: !canal.ativo }),
        });
        if (res.ok) setCanais(prev => prev.map(c => c.id === canal.id ? { ...c, ativo: !c.ativo } : c));
    };

    const deletar = async (id: string) => {
        if (!confirm('Remover este canal?')) return;
        await fetch(`${API}/api/omnichannel/canais/${id}`, { method: 'DELETE', headers: h() });
        setCanais(prev => prev.filter(c => c.id !== id));
        toast.success('Canal removido');
    };

    const verPedidos = async (canal: Canal) => {
        setCanalDetalhe(canal);
        setCarregandoPedidos(true);
        const res = await fetch(`${API}/api/omnichannel/canais/${canal.id}/pedidos`, { headers: h() });
        if (res.ok) setPedidosExternos(await res.json());
        setCarregandoPedidos(false);
    };

    const copiarWebhookUrl = (canalId: string) => {
        const url = `${API}/api/omnichannel/webhook/${canalId}`;
        navigator.clipboard.writeText(url);
        toast.success('URL copiada!');
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Globe className="w-7 h-7 text-[#FF5C01]" /> Canais de Venda</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Receba pedidos de WhatsApp, iFood, site próprio e outros canais</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={carregar} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5C01] text-white font-semibold hover:bg-[#e05101] text-sm shadow-sm">
                        <Plus className="w-4 h-4" /> Novo Canal
                    </button>
                </div>
            </div>

            {/* Como funciona */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-800 font-semibold mb-1">🔗 Como funciona</p>
                <p className="text-sm text-blue-700">
                    Cada canal gera uma URL de webhook única. Configure essa URL no seu sistema de pedidos externo (WhatsApp Bot, iFood Partners, etc.).
                    Quando um pedido chegar, o Dine cria automaticamente a comanda e notifica a cozinha.
                </p>
            </div>

            {canais.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-600 mb-1">Nenhum canal configurado</h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                        Crie canais para receber pedidos de WhatsApp, iFood, seu site e outros
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {canais.map(canal => {
                        const tipoInfo = TIPOS_CANAL.find(t => t.val === canal.tipo);
                        const webhookUrl = `${API}/api/omnichannel/webhook/${canal.id}`;
                        return (
                            <div key={canal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{canal.nome}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${canal.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {canal.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">{tipoInfo?.label ?? canal.tipo}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => toggleAtivo(canal)} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${canal.ativo ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                            {canal.ativo ? 'Ativo' : 'Inativo'}
                                        </button>
                                        <button onClick={() => deletar(canal.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Webhook URL */}
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-1.5">WEBHOOK URL</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs text-gray-700 flex-1 truncate font-mono">{webhookUrl}</code>
                                        <button onClick={() => copiarWebhookUrl(canal.id)} className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-[#FF5C01] hover:border-[#FF5C01] transition-colors flex-shrink-0">
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        {canal._count.pedidosExternos} pedido{canal._count.pedidosExternos !== 1 ? 's' : ''} recebido{canal._count.pedidosExternos !== 1 ? 's' : ''}
                                    </span>
                                    <button onClick={() => verPedidos(canal)} className="text-sm text-[#FF5C01] hover:underline font-medium">
                                        Ver histórico
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal novo canal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-lg text-gray-900">Novo Canal de Venda</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={salvar} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do canal *</label>
                                <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                                    placeholder="Ex: WhatsApp Loja Centro, iFood Principal"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de canal *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TIPOS_CANAL.map(t => (
                                        <button type="button" key={t.val}
                                            onClick={() => setForm(p => ({ ...p, tipo: t.val }))}
                                            className={`p-3 rounded-xl border-2 text-left transition-colors ${form.tipo === t.val ? 'border-[#FF5C01] bg-[#FF5C01]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <p className="font-semibold text-sm text-gray-800">{t.label}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Secret do Webhook (opcional)</label>
                                <input value={form.webhookSecret} onChange={e => setForm(p => ({ ...p, webhookSecret: e.target.value }))}
                                    placeholder="Para validação de assinatura do webhook"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none font-mono text-sm" />
                                <p className="text-xs text-gray-400 mt-1">Se configurado, o sistema valida a assinatura HMAC dos payloads recebidos</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Cancelar</button>
                                <button type="submit" disabled={salvando} className="flex-1 py-2.5 bg-[#FF5C01] text-white rounded-xl font-bold hover:bg-[#e05101] disabled:opacity-70 flex items-center justify-center gap-2">
                                    {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Criando...</> : 'Criar Canal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal histórico de pedidos externos */}
            {canalDetalhe && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900">Pedidos Externos</h2>
                                <p className="text-sm text-gray-500">{canalDetalhe.nome}</p>
                            </div>
                            <button onClick={() => setCanalDetalhe(null)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-5 space-y-3">
                            {carregandoPedidos ? (
                                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[#FF5C01] border-t-transparent rounded-full animate-spin" /></div>
                            ) : pedidosExternos.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Globe className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Nenhum pedido recebido ainda</p>
                                </div>
                            ) : (
                                pedidosExternos.map(p => (
                                    <div key={p.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[p.status] ?? 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                                                {p.externalId && <span className="text-xs text-gray-400 font-mono">#{p.externalId.slice(0, 10)}</span>}
                                            </div>
                                            {p.erroMensagem && (
                                                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3" /> {p.erroMensagem.slice(0, 80)}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                            {new Date(p.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
