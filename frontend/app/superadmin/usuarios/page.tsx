'use client';

import { useState, useEffect } from 'react';
import { superAdminService } from '@/services/superadmin.service';
import { Search, Users, ShieldAlert, Mail, UserSquare2, Shield, Store } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function UsuariosList() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const data = await superAdminService.listarUsuarios({ limit: 50, busca });
            setUsuarios(data.dados);
        } catch (error) {
            toast.error('Erro ao buscar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchUsuarios();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [busca]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="w-6 h-6 text-indigo-600" /> Gestão de Acessos
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Controle de clientes e operadores globais.</p>
                </div>

                <div className="w-full sm:w-80 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Perfil Privilégio</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vinculado Ao Rest.</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data Cadastro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                                    </td>
                                </tr>
                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum usuário encontrado na plataforma.
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 border border-indigo-200/50">
                                                    <UserSquare2 className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{user.nome}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-5">
                                            {user.tipo === 'superadmin' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wide uppercase bg-purple-100 text-purple-700 rounded-lg">
                                                    <ShieldAlert className="w-3.5 h-3.5" /> Global
                                                </span>
                                            )}
                                            {user.tipo === 'admin' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wide uppercase bg-emerald-100 text-emerald-700 rounded-lg">
                                                    <Shield className="w-3.5 h-3.5" /> Gestor
                                                </span>
                                            )}
                                            {user.tipo === 'funcionario' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wide uppercase bg-blue-100 text-blue-700 rounded-lg">
                                                    Operador
                                                </span>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-5">
                                            {user.estabelecimento ? (
                                                <div className="flex items-center gap-2 max-w-[200px]">
                                                    <div className="p-1.5 bg-gray-100 rounded-md shrink-0"><Store className="w-4 h-4 text-gray-500" /></div>
                                                    <span className="text-sm font-semibold text-gray-700 truncate">{user.estabelecimento.nome}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">Não Vinculado</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5">
                                            <p className="text-sm font-medium text-gray-500">
                                                {format(new Date(user.createdAt), "dd MMM, yy", { locale: ptBR })}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
