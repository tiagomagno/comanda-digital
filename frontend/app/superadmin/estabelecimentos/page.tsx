'use client';

import { useState, useEffect } from 'react';
import { superAdminService } from '@/services/superadmin.service';
import { Search, Plus, Store, CheckCircle2, XCircle, MoreVertical, Building2, MapPin, UserSquare2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function EstabelecimentosList() {
    const [estabelecimentos, setEstabelecimentos] = useState<any[]>([]);
    const [paginacao, setPaginacao] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativos' | 'inativos'>('todos');

    const fetchEstabelecimentos = async () => {
        setLoading(true);
        try {
            const params: any = { limit: 12 };
            if (busca) params.busca = busca;
            if (filtroAtivo === 'ativos') params.ativo = true;
            if (filtroAtivo === 'inativos') params.ativo = false;

            const data = await superAdminService.listarEstabelecimentos(params);
            setEstabelecimentos(data.dados);
            setPaginacao(data.paginacao);
        } catch (error) {
            toast.error('Erro ao buscar estabelecimentos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchEstabelecimentos();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [busca, filtroAtivo]);

    const handleToggleAtivo = async (id: string, nome: string) => {
        if (!confirm(`Tem certeza que deseja alterar o status de ${nome}?`)) return;
        
        try {
            await superAdminService.toggleAtivo(id);
            toast.success('Status atualizado com sucesso!');
            fetchEstabelecimentos();
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, CNPJ, cidade ou email..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                    />
                </div>
                
                <div className="flex w-full sm:w-auto items-center gap-3">
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setFiltroAtivo('todos')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filtroAtivo === 'todos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Todos
                        </button>
                        <button 
                            onClick={() => setFiltroAtivo('ativos')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filtroAtivo === 'ativos' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-emerald-600'}`}
                        >
                            Ativos
                        </button>
                        <button 
                            onClick={() => setFiltroAtivo('inativos')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filtroAtivo === 'inativos' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-rose-600'}`}
                        >
                            Inativos
                        </button>
                    </div>

                    <Link href="/superadmin/estabelecimentos/novo" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        <Plus className="w-5 h-5" /> Novo Cliente
                    </Link>
                </div>
            </div>

            {/* Content Loading */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse h-48"></div>
                    ))}
                </div>
            ) : estabelecimentos.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum estabelecimento encontrado</h3>
                    <p className="text-gray-500">Tente ajustar a sua busca ou filtros.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {estabelecimentos.map((est) => (
                        <div key={est.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                            
                            {/* Status Badge */}
                            <div className="absolute top-6 right-6 flex items-center gap-2">
                                <button
                                    onClick={() => handleToggleAtivo(est.id, est.nome)}
                                    title={est.ativo ? "Desativar" : "Ativar"}
                                    className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${
                                        est.ativo 
                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                    }`}
                                >
                                    {est.ativo ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </button>
                                <button className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Info Principal */}
                            <div className="flex items-start gap-4 mb-5">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-center justify-center shrink-0">
                                    <Store className="w-7 h-7 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0 pr-16">
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight truncate group-hover:text-indigo-600 transition-colors">
                                        {est.nome}
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 truncate">
                                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                                        {est.cnpj || 'Sem CNPJ'}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        {est.cidade ? `${est.cidade} - ${est.estado}` : 'Sem endereço'}
                                    </p>
                                </div>
                            </div>

                            {/* Tags de Operação */}
                            <div className="flex flex-wrap gap-2 mb-5">
                                {est.operaLocal && <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 rounded-md">Local</span>}
                                {est.operaDelivery && <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 rounded-md">Delivery</span>}
                                {est.operaHospedado && <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 rounded-md">Hospedagem</span>}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100 w-full mb-5"></div>

                            {/* Métricas Bottom */}
                            <div className="flex justify-between items-center text-sm">
                                <div className="space-y-1">
                                    <p className="text-gray-500 font-medium text-xs">Abertura</p>
                                    <p className="font-semibold text-gray-900">{format(new Date(est.createdAt), "dd MMM, yyyy", { locale: ptBR })}</p>
                                </div>
                                
                                <div className="flex gap-4">
                                    <div className="text-center" title="Usuários Cadastrados">
                                        <p className="text-gray-400 mb-0.5"><UserSquare2 className="w-4 h-4 mx-auto" /></p>
                                        <p className="font-bold text-indigo-900">{est._count.usuarios}</p>
                                    </div>
                                    <div className="text-center" title="Categorias do Cardápio">
                                        <p className="text-gray-400 mb-0.5"><RefreshCw className="w-4 h-4 mx-auto" /></p>
                                        <p className="font-bold text-indigo-900">{est._count.categorias}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Overlay CTA no hover */}
                            <Link href={`/superadmin/estabelecimentos/${est.id}`} className="absolute inset-0 z-10 rounded-2xl cursor-pointer">
                                <span className="sr-only">Ver detalhes de {est.nome}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
