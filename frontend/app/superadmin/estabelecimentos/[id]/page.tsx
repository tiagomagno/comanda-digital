'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { superAdminService } from '@/services/superadmin.service';
import { ArrowLeft, Edit3, Save, Store, Activity, Users, Settings2, ShieldCheck, Mail, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function DetalhesEstabelecimento() {
    const params = useParams();
    const router = useRouter();
    const [dados, setDados] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const fetchDetalhes = async () => {
        try {
            const data = await superAdminService.getEstabelecimento(params.id as string);
            setDados(data);
            setFormData({
                nome: data.nome,
                cnpj: data.cnpj || '',
                telefone: data.telefone || '',
                email: data.email || '',
                cidade: data.cidade || '',
                estado: data.estado || '',
                operaLocal: data.operaLocal,
                operaDelivery: data.operaDelivery,
                operaHospedado: data.operaHospedado,
            });
        } catch (error) {
            toast.error('Erro ao carregar detalhes');
            router.push('/superadmin/estabelecimentos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchDetalhes();
        }
    }, [params.id]);

    const handleSalvar = async () => {
        setSalvando(true);
        try {
            await superAdminService.atualizarEstabelecimento(params.id as string, formData);
            toast.success('Dados atualizados com sucesso!');
            setEditMode(false);
            fetchDetalhes();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar dados');
        } finally {
            setSalvando(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
    }

    if (!dados) return null;

    const admins = dados.usuarios || [];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/superadmin/estabelecimentos" className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{dados.nome}</h1>
                            {dados.ativo ? (
                                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-700 rounded-lg">Ativo</span>
                            ) : (
                                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase bg-rose-100 text-rose-700 rounded-lg">Inativo</span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm font-medium mt-1">ID: <span className="font-mono text-xs">{dados.id}</span></p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {editMode ? (
                        <>
                            <button onClick={() => setEditMode(false)} className="px-5 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                            <button onClick={handleSalvar} disabled={salvando} className="flex items-center gap-2 px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                                {salvando ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Alterações
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-5 py-2 sm:py-2.5 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-all">
                            <Edit3 className="w-4 h-4" /> Editar Perfil
                        </button>
                    )}
                </div>
            </div>

            {/* Métricas Top */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Receita Gerada</p>
                    <h3 className="text-2xl font-black text-indigo-900">{formatCurrency(dados.metricas.receitaTotal)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Pedidos</p>
                    <h3 className="text-2xl font-black text-indigo-900">{dados.metricas.totalPedidos}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Clientes Cadastrados</p>
                    <h3 className="text-2xl font-black text-indigo-900">{dados._count?.clientes || 0}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Cadastro em</p>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{format(new Date(dados.createdAt), "dd/MM/yyyy", { locale: ptBR })}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Principal: Dados de Cadastro */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        
                        <div className="flex items-center gap-3 mb-6 relative">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl justify-center flex items-center shrink-0">
                                <Store className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Informações Institucionais</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 relative">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Nome Fantasia</label>
                                {editMode ? (
                                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold text-gray-900" />
                                ) : (
                                    <p className="text-base text-gray-900 font-semibold bg-gray-50/50 px-4 py-2.5 rounded-xl border border-transparent">{dados.nome}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">CNPJ</label>
                                {editMode ? (
                                    <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold text-gray-900" />
                                ) : (
                                    <p className="text-base text-gray-900 font-semibold bg-gray-50/50 px-4 py-2.5 rounded-xl border border-transparent">{dados.cnpj || 'Não cadastrado'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Telefone</label>
                                {editMode ? (
                                    <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold text-gray-900" />
                                ) : (
                                    <p className="text-base text-gray-900 font-semibold bg-gray-50/50 px-4 py-2.5 rounded-xl border border-transparent">{dados.telefone || 'Não cadastrado'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">E-mail Comercial</label>
                                {editMode ? (
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold text-gray-900" />
                                ) : (
                                    <p className="text-base text-gray-900 font-semibold bg-gray-50/50 px-4 py-2.5 rounded-xl border border-transparent">{dados.email || 'Não cadastrado'}</p>
                                )}
                            </div>

                            <div className="md:col-span-2 flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Cidade</label>
                                    {editMode ? (
                                        <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold text-gray-900" />
                                    ) : (
                                        <p className="text-base text-gray-900 font-semibold bg-gray-50/50 px-4 py-2.5 rounded-xl border border-transparent">{dados.cidade || 'Não cadastrada'}</p>
                                    )}
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">UF</label>
                                    {editMode ? (
                                        <select name="estado" value={formData.estado} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold text-gray-900">
                                            <option value="">--</option>
                                            <option value="SP">SP</option><option value="RJ">RJ</option><option value="MG">MG</option><option value="PR">PR</option><option value="SC">SC</option><option value="RS">RS</option>
                                            {/* etc */}
                                        </select>
                                    ) : (
                                        <p className="text-base text-gray-900 font-semibold bg-gray-50/50 px-4 py-2.5 rounded-xl border border-transparent">{dados.estado || '--'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl justify-center flex items-center shrink-0">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Modalidades de Operação</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className={`flex items-start gap-3 p-4 border rounded-2xl transition-all ${editMode ? 'cursor-pointer hover:bg-gray-50' : ''} ${formData.operaLocal ? 'bg-indigo-50/50 border-indigo-200' : 'bg-gray-50/50 border-gray-100'}`}>
                                <input type="checkbox" name="operaLocal" checked={formData.operaLocal} onChange={handleChange} disabled={!editMode} className={`mt-1 w-4 h-4 text-indigo-600 rounded ${!editMode && 'opacity-70 cursor-not-allowed'}`} />
                                <div>
                                    <span className={`block font-bold text-sm ${formData.operaLocal ? 'text-indigo-900' : 'text-gray-500'}`}>Local</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Mesas</span>
                                </div>
                            </label>
                            
                            <label className={`flex items-start gap-3 p-4 border rounded-2xl transition-all ${editMode ? 'cursor-pointer hover:bg-gray-50' : ''} ${formData.operaDelivery ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50/50 border-gray-100'}`}>
                                <input type="checkbox" name="operaDelivery" checked={formData.operaDelivery} onChange={handleChange} disabled={!editMode} className={`mt-1 w-4 h-4 text-amber-600 rounded ${!editMode && 'opacity-70 cursor-not-allowed'}`} />
                                <div>
                                    <span className={`block font-bold text-sm ${formData.operaDelivery ? 'text-amber-900' : 'text-gray-500'}`}>Delivery</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Entregas</span>
                                </div>
                            </label>
                            
                            <label className={`flex items-start gap-3 p-4 border rounded-2xl transition-all ${editMode ? 'cursor-pointer hover:bg-gray-50' : ''} ${formData.operaHospedado ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50/50 border-gray-100'}`}>
                                <input type="checkbox" name="operaHospedado" checked={formData.operaHospedado} onChange={handleChange} disabled={!editMode} className={`mt-1 w-4 h-4 text-emerald-600 rounded ${!editMode && 'opacity-70 cursor-not-allowed'}`} />
                                <div>
                                    <span className={`block font-bold text-sm ${formData.operaHospedado ? 'text-emerald-900' : 'text-gray-500'}`}>Hospedado</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Quartos</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Coluna Sidebar: Gestores e etc */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-b from-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden h-max">
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
                        <div className="flex items-center gap-3 mb-6 relative">
                            <ShieldCheck className="w-6 h-6 text-indigo-300" />
                            <h2 className="text-lg font-bold">Gestores de Conta</h2>
                        </div>
                        
                        <div className="space-y-4 relative">
                            {admins.length === 0 ? (
                                <p className="text-sm text-indigo-300">Sem gestores atrelados.</p>
                            ) : (
                                admins.map((admin: any) => (
                                    <div key={admin.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm shadow-inner">
                                                {admin.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{admin.nome}</p>
                                                <p className="text-xs text-indigo-200 truncate">{admin.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
