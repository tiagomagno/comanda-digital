'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { superAdminService } from '@/services/superadmin.service';
import { ArrowLeft, Save, Building2, UserCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NovoEstabelecimento() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        cidade: '',
        estado: '',
        operaLocal: true,
        operaDelivery: false,
        operaHospedado: false,
        adminNome: '',
        adminEmail: '',
        adminSenha: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await superAdminService.criarEstabelecimento(formData);
            toast.success('Estabelecimento criado com sucesso!');
            router.push('/superadmin/estabelecimentos');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao criar estabelecimento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/superadmin/estabelecimentos" className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Novo Estabelecimento</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Crie um novo cliente e já provisione o acesso admin.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Dados da Empresa */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Building2 className="w-5 h-5" /></div>
                        <h2 className="text-lg font-bold text-gray-900">Dados do Negócio</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nome Fantasia / Razão Social *</label>
                            <input type="text" name="nome" required value={formData.nome} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="Ex: Kizan Sushi" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">CNPJ</label>
                            <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="00.000.000/0000-00" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Telefone / WhatsApp</label>
                            <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="(00) 00000-0000" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Cidade *</label>
                            <input type="text" name="cidade" required value={formData.cidade} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="Cidade" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Estado (UF) *</label>
                            <select name="estado" required value={formData.estado} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none">
                                <option value="">Selecione...</option>
                                <option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option>
                                <option value="AM">Amazonas</option><option value="BA">Bahia</option><option value="CE">Ceará</option>
                                <option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option><option value="GO">Goiás</option>
                                <option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option>
                                <option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option>
                                <option value="PR">Paraná</option><option value="PE">Pernambuco</option><option value="PI">Piauí</option>
                                <option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option><option value="RS">Rio Grande do Sul</option>
                                <option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option>
                                <option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Modalidades de Operação suportadas</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.operaLocal ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <input type="checkbox" name="operaLocal" checked={formData.operaLocal} onChange={handleChange} className="mt-1 w-4 h-4 text-indigo-600 rounded" />
                                <div>
                                    <span className={`block font-bold text-sm ${formData.operaLocal ? 'text-indigo-900' : 'text-gray-700'}`}>Consumo no Local</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Mesas, comandas individuais.</span>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.operaDelivery ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <input type="checkbox" name="operaDelivery" checked={formData.operaDelivery} onChange={handleChange} className="mt-1 w-4 h-4 text-indigo-600 rounded" />
                                <div>
                                    <span className={`block font-bold text-sm ${formData.operaDelivery ? 'text-indigo-900' : 'text-gray-700'}`}>Delivery</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Entrega, taxas, endereço.</span>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.operaHospedado ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <input type="checkbox" name="operaHospedado" checked={formData.operaHospedado} onChange={handleChange} className="mt-1 w-4 h-4 text-indigo-600 rounded" />
                                <div>
                                    <span className={`block font-bold text-sm ${formData.operaHospedado ? 'text-indigo-900' : 'text-gray-700'}`}>Hospedagem</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Quartos de hotel / pousada.</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Usuário Admin */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><UserCircle className="w-5 h-5" /></div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-none">Usuário Administrador Local</h2>
                            <p className="text-sm font-medium text-gray-500 mt-1">Este será o acesso inicial do dono do estabelecimento</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-purple-50/30 p-6 rounded-2xl border border-purple-100/50">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo *</label>
                            <input type="text" name="adminNome" required value={formData.adminNome} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none shadow-sm" placeholder="Nome do Dono/Gerente" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">E-mail de Acesso *</label>
                            <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none shadow-sm" placeholder="acesso@email.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Senha Inicial *</label>
                            <input type="text" name="adminSenha" required value={formData.adminSenha} onChange={handleChange} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none shadow-sm" placeholder="Defina uma senha" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Registrar Estabelecimento
                    </button>
                </div>
            </form>
        </div>
    );
}
