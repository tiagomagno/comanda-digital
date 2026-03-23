'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Plus, RefreshCw, ArrowLeft, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Entregador {
    id: string;
    nome: string;
    telefone?: string;
    veiculo?: string;
    placa?: string;
    status: 'disponivel' | 'em_entrega' | 'offline';
}

export default function EntregadoresPage() {
    const router = useRouter();
    const [entregadores, setEntregadores] = useState<Entregador[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarEntregadores();
    }, []);

    const carregarEntregadores = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            // MOCK: Futuramente será consumido de uma API '/api/entregadores' ou filtrado de '/api/usuarios'.
            const mockEntregadores: Entregador[] = [
                {
                    id: '1',
                    nome: 'Carlos Eduardo',
                    telefone: '(11) 99999-1111',
                    veiculo: 'Moto (Honda CG 160)',
                    placa: 'ABC-1234',
                    status: 'disponivel',
                },
                {
                    id: '2',
                    nome: 'Lucas Mendes',
                    telefone: '(11) 98888-2222',
                    veiculo: 'Bicicleta',
                    status: 'em_entrega',
                }
            ];

            // Simula um loading
            setTimeout(() => {
                setEntregadores(mockEntregadores);
                setLoading(false);
            }, 600);
        } catch (error) {
            console.error('Erro ao listar entregadores:', error);
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'disponivel':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Disponível</span>;
            case 'em_entrega':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Em Entrega</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Offline</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent mx-auto mb-3" />
                    <p className="text-gray-600">Buscando entregadores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Dashboard
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Truck className="w-8 h-8 text-orange-500" />
                            Entregadores
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Gerenciamento de frota e entregadores cadastrados
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={carregarEntregadores}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Atualizar
                        </button>
                        <button
                            className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Novo Entregador
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nome</th>
                                <th className="px-6 py-4 font-semibold">Contato</th>
                                <th className="px-6 py-4 font-semibold">Veículo / Placa</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {entregadores.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum entregador cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                entregadores.map((entregador) => (
                                    <tr key={entregador.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900">{entregador.nome}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {entregador.telefone || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 font-medium">{entregador.veiculo || '-'}</div>
                                            {entregador.placa && <div className="text-xs text-gray-500">{entregador.placa}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(entregador.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Editar">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Remover">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
