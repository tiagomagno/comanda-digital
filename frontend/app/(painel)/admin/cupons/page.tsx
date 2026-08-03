'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Tag, Calendar, Users, Percent, DollarSign, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Cupom {
    id: string;
    codigo: string;
    descricao?: string;
    tipo: 'percentual' | 'fixo';
    valor: number;
    valorMinimo?: number;
    usoMaximo?: number;
    usoAtual: number;
    ativo: boolean;
    dataInicio?: string;
    dataFim?: string;
    createdAt: string;
}

const FORM_VAZIO = {
    codigo: '', descricao: '', tipo: 'percentual' as 'percentual' | 'fixo',
    valor: '', valorMinimo: '', usoMaximo: '', dataInicio: '', dataFim: '',
};

export default function CuponsPage() {
    const router = useRouter();
    const [cupons, setCupons] = useState<Cupom[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [form, setForm] = useState(FORM_VAZIO);

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');
    const headers = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
    });

    useEffect(() => { carregarCupons(); }, []);

    const carregarCupons = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/auth/login'); return; }
            const res = await fetch(`${apiUrl}/api/cupons`, { headers: headers() });
            if (res.status === 401) { router.push('/auth/login'); return; }
            if (res.ok) setCupons(await res.json());
        } catch { toast.error('Erro ao carregar cupons'); }
        finally { setLoading(false); }
    };

    const salvar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.codigo.trim() || !form.valor) { toast.error('Código e valor são obrigatórios'); return; }
        setSalvando(true);
        try {
            const payload = {
                codigo: form.codigo.trim().toUpperCase(),
                descricao: form.descricao || undefined,
                tipo: form.tipo,
                valor: parseFloat(form.valor),
                valorMinimo: form.valorMinimo ? parseFloat(form.valorMinimo) : undefined,
                usoMaximo: form.usoMaximo ? parseInt(form.usoMaximo) : undefined,
                dataInicio: form.dataInicio || undefined,
                dataFim: form.dataFim || undefined,
            };
            const res = await fetch(`${apiUrl}/api/cupons`, {
                method: 'POST', headers: headers(), body: JSON.stringify(payload),
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro'); }
            const novo = await res.json();
            setCupons(prev => [novo, ...prev]);
            setShowModal(false);
            setForm(FORM_VAZIO);
            toast.success('Cupom criado!');
        } catch (e: any) { toast.error(e.message || 'Erro ao criar cupom'); }
        finally { setSalvando(false); }
    };

    const toggleAtivo = async (cupom: Cupom) => {
        const res = await fetch(`${apiUrl}/api/cupons/${cupom.id}`, {
            method: 'PUT', headers: headers(), body: JSON.stringify({ ativo: !cupom.ativo }),
        });
        if (res.ok) {
            setCupons(prev => prev.map(c => c.id === cupom.id ? { ...c, ativo: !c.ativo } : c));
            toast.success(cupom.ativo ? 'Cupom desativado' : 'Cupom ativado');
        }
    };

    const deletar = async (id: string) => {
        if (!confirm('Remover este cupom?')) return;
        const res = await fetch(`${apiUrl}/api/cupons/${id}`, { method: 'DELETE', headers: headers() });
        if (res.ok) { setCupons(prev => prev.filter(c => c.id !== id)); toast.success('Cupom removido'); }
    };

    const formatData = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cupons de Desconto</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Crie e gerencie cupons para seus clientes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF5C01] text-white rounded-xl font-semibold hover:bg-[#e05101] transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cupom
                </button>
            </div>

            {cupons.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-600 mb-1">Nenhum cupom criado</h3>
                    <p className="text-gray-400 text-sm">Crie cupons para oferecer descontos aos seus clientes</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cupons.map(cupom => {
                        const expirado = cupom.dataFim && new Date(cupom.dataFim) < new Date();
                        const esgotado = cupom.usoMaximo !== null && cupom.usoAtual >= (cupom.usoMaximo ?? 0);
                        const status = !cupom.ativo ? 'inativo' : expirado ? 'expirado' : esgotado ? 'esgotado' : 'ativo';
                        const statusColor = { ativo: 'bg-green-100 text-green-700', inativo: 'bg-gray-100 text-gray-500', expirado: 'bg-red-100 text-red-600', esgotado: 'bg-amber-100 text-amber-700' }[status];

                        return (
                            <div key={cupom.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-lg text-gray-900 tracking-wider">{cupom.codigo}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{status}</span>
                                        </div>
                                        {cupom.descricao && <p className="text-sm text-gray-500 mt-0.5">{cupom.descricao}</p>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => toggleAtivo(cupom)} className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${cupom.ativo ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                            {cupom.ativo ? 'Ativo' : 'Inativo'}
                                        </button>
                                        <button onClick={() => deletar(cupom.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 bg-[#FF5C01]/10 text-[#FF5C01] px-3 py-1.5 rounded-lg">
                                        {cupom.tipo === 'percentual' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                        <span className="font-bold">
                                            {cupom.tipo === 'percentual' ? `${cupom.valor}%` : `R$ ${Number(cupom.valor).toFixed(2)}`}
                                        </span>
                                    </div>
                                    {cupom.valorMinimo && (
                                        <span className="text-xs text-gray-500">mín. R$ {Number(cupom.valorMinimo).toFixed(2)}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" />
                                        {cupom.usoAtual}{cupom.usoMaximo ? `/${cupom.usoMaximo}` : ''} usos
                                    </span>
                                    {(cupom.dataInicio || cupom.dataFim) && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatData(cupom.dataInicio)} → {formatData(cupom.dataFim)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal novo cupom */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-lg text-gray-900">Novo Cupom</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={salvar} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código <span className="text-red-500">*</span></label>
                                    <input
                                        value={form.codigo}
                                        onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))}
                                        placeholder="PROMO10"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição</label>
                                    <input
                                        value={form.descricao}
                                        onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                                        placeholder="Ex: 10% para novos clientes"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.tipo}
                                        onChange={e => setForm(p => ({ ...p, tipo: e.target.value as 'percentual' | 'fixo' }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none bg-white"
                                    >
                                        <option value="percentual">Percentual (%)</option>
                                        <option value="fixo">Valor fixo (R$)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            {form.tipo === 'percentual' ? '%' : 'R$'}
                                        </span>
                                        <input
                                            type="number" min="0" step="0.01"
                                            value={form.valor}
                                            onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
                                            placeholder="10"
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pedido mínimo (R$)</label>
                                    <input
                                        type="number" min="0" step="0.01"
                                        value={form.valorMinimo}
                                        onChange={e => setForm(p => ({ ...p, valorMinimo: e.target.value }))}
                                        placeholder="0,00"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Limite de usos</label>
                                    <input
                                        type="number" min="1"
                                        value={form.usoMaximo}
                                        onChange={e => setForm(p => ({ ...p, usoMaximo: e.target.value }))}
                                        placeholder="Ilimitado"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Válido de</label>
                                    <input
                                        type="date"
                                        value={form.dataInicio}
                                        onChange={e => setForm(p => ({ ...p, dataInicio: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Válido até</label>
                                    <input
                                        type="date"
                                        value={form.dataFim}
                                        onChange={e => setForm(p => ({ ...p, dataFim: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={salvando} className="flex-1 px-4 py-2.5 bg-[#FF5C01] text-white rounded-xl font-bold hover:bg-[#e05101] disabled:opacity-70 flex items-center justify-center gap-2">
                                    {salvando ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Criar Cupom'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
