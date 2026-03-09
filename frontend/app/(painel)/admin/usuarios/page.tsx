'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit, Trash2, RefreshCw, ArrowLeft, Key, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Usuario {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
    codigoAcesso?: string;
    tipo: 'admin' | 'garcom' | 'cozinha' | 'bar';
    ativo: boolean;
    ultimoAcesso?: string;
}

export default function UsuariosPage() {
    const router = useRouter();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        tipo: 'garcom' as 'admin' | 'garcom' | 'cozinha' | 'bar',
    });

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const carregarUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            // Simulação - você pode substituir por chamada real à API
            const mockUsuarios: Usuario[] = [];

            setUsuarios(mockUsuarios);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const gerarCodigoAcesso = () => {
        const prefixos = {
            admin: 'ADMIN',
            garcom: 'GARCOM',
            cozinha: 'COZINHA',
            bar: 'BAR',
        };
        const numero = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `${prefixos[formData.tipo]}${numero}`;
    };

    const criarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();

        const codigo = gerarCodigoAcesso();

        toast.success(`Usuário criado! Código de acesso: ${codigo}`);
        setShowModal(false);
        setFormData({
            nome: '',
            email: '',
            telefone: '',
            senha: '',
            tipo: 'garcom',
        });

        // Adicionar à lista (simulação)
        const novoUsuario: Usuario = {
            id: Date.now().toString(),
            nome: formData.nome,
            email: formData.email || undefined,
            telefone: formData.telefone || undefined,
            codigoAcesso: codigo,
            tipo: formData.tipo,
            ativo: true,
        };
        setUsuarios([...usuarios, novoUsuario]);
    };

    const toggleAtivo = (usuarioId: string) => {
        setUsuarios(usuarios.map(u =>
            u.id === usuarioId ? { ...u, ativo: !u.ativo } : u
        ));
        toast.success('Status atualizado!');
    };

    const deletarUsuario = (usuarioId: string) => {
        if (!confirm('Deseja realmente deletar este usuário?')) return;

        setUsuarios(usuarios.filter(u => u.id !== usuarioId));
        toast.success('Usuário deletado!');
    };

    const getTipoBadge = (tipo: string) => {
        const badges = {
            admin: 'bg-purple-100 text-purple-700',
            garcom: 'bg-green-100 text-green-700',
            cozinha: 'bg-orange-100 text-orange-700',
            bar: 'bg-pink-100 text-pink-700',
        };
        return badges[tipo as keyof typeof badges] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando usuários...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar ao Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                                <Users className="w-10 h-10 text-gray-900" />
                                Gestão de Usuários
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Gerencie funcionários e permissões
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={carregarUsuarios}
                                className="bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Atualizar
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Novo Usuário
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-gray-600 text-sm">Total de Usuários</p>
                        <p className="text-3xl font-bold text-gray-900">{usuarios.length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-gray-600 text-sm">Garçons</p>
                        <p className="text-3xl font-bold text-green-600">
                            {usuarios.filter(u => u.tipo === 'garcom').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-gray-600 text-sm">Cozinha</p>
                        <p className="text-3xl font-bold text-orange-600">
                            {usuarios.filter(u => u.tipo === 'cozinha').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-gray-600 text-sm">Bar</p>
                        <p className="text-3xl font-bold text-pink-600">
                            {usuarios.filter(u => u.tipo === 'bar').length}
                        </p>
                    </div>
                </div>

                {/* Lista de Usuários */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Nome
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Contato
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Código de Acesso
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900">
                                            {usuario.nome}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-700">
                                            {usuario.email && <div>{usuario.email}</div>}
                                            {usuario.telefone && <div>{usuario.telefone}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoBadge(usuario.tipo)}`}>
                                            {usuario.tipo.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4 text-gray-400" />
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                                {usuario.codigoAcesso}
                                            </code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleAtivo(usuario.id)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${usuario.ativo
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deletarUsuario(usuario.id)}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Deletar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal de Novo Usuário */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Novo Usuário
                            </h2>

                            <form onSubmit={criarUsuario} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Ex: João Silva"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Usuário *
                                    </label>
                                    <select
                                        required
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="garcom">Garçom</option>
                                        <option value="cozinha">Cozinha</option>
                                        <option value="bar">Bar</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha (opcional)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.senha}
                                            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                                            placeholder="Senha para login com email"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Um código de acesso será gerado automaticamente
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setFormData({
                                                nome: '',
                                                email: '',
                                                telefone: '',
                                                senha: '',
                                                tipo: 'garcom',
                                            });
                                        }}
                                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                    >
                                        Criar Usuário
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
