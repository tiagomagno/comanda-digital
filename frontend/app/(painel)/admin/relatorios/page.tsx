'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    TrendingUp,
    DollarSign,
    Users,
    UtensilsCrossed,
    Calendar,
    ArrowLeft,
    RefreshCw,
    Download
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RelatorioVendas {
    totalVendas: number;
    totalComandas: number;
    ticketMedio: number;
    vendasPorMetodo: Array<{
        metodo: string;
        total: number;
        quantidade: number;
    }>;
    produtosMaisVendidos: Array<{
        produto: string;
        quantidade: number;
        total: number;
    }>;
    vendasPorHora: Array<{
        hora: string;
        vendas: number;
    }>;
}

export default function RelatoriosPage() {
    const router = useRouter();
    const [relatorio, setRelatorio] = useState<RelatorioVendas | null>(null);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje');

    useEffect(() => {
        carregarRelatorio();
    }, [periodo]);

    const carregarRelatorio = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            // Dados simulados - você pode substituir por chamada real à API
            const mockRelatorio: RelatorioVendas = {
                totalVendas: 0,
                totalComandas: 0,
                ticketMedio: 0,
                vendasPorMetodo: [],
                produtosMaisVendidos: [],
                vendasPorHora: [],
            };

            setRelatorio(mockRelatorio);
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
            toast.error('Erro ao carregar relatório');
        } finally {
            setLoading(false);
        }
    };

    const exportarRelatorio = () => {
        toast.success('Relatório exportado! (funcionalidade em desenvolvimento)');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando relatório...</p>
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
                                <TrendingUp className="w-10 h-10 text-gray-900" />
                                Relatórios
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Análise de vendas e desempenho
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={carregarRelatorio}
                                className="bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Atualizar
                            </button>
                            <button
                                onClick={exportarRelatorio}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Exportar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtro de Período */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700 font-medium">Período:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPeriodo('hoje')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${periodo === 'hoje'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Hoje
                            </button>
                            <button
                                onClick={() => setPeriodo('semana')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${periodo === 'semana'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Esta Semana
                            </button>
                            <button
                                onClick={() => setPeriodo('mes')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${periodo === 'mes'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Este Mês
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estatísticas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-medium">Total de Vendas</p>
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            R$ {relatorio?.totalVendas.toFixed(2)}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                            {periodo === 'hoje' ? 'Hoje' : periodo === 'semana' ? 'Esta semana' : 'Este mês'}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-medium">Total de Comandas</p>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {relatorio?.totalComandas}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                            Comandas atendidas
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-medium">Ticket Médio</p>
                            <TrendingUp className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            R$ {relatorio?.ticketMedio.toFixed(2)}
                        </p>
                        <p className="text-sm text-purple-600 mt-1">
                            Por comanda
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Vendas por Método de Pagamento */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Vendas por Método de Pagamento
                        </h2>
                        <div className="space-y-4">
                            {relatorio?.vendasPorMetodo.map((metodo, index) => {
                                const porcentagem = (metodo.total / (relatorio?.totalVendas || 1)) * 100;
                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-700">
                                                {metodo.metodo === 'Dinheiro' && '💵'}
                                                {metodo.metodo === 'Cartão' && '💳'}
                                                {metodo.metodo === 'PIX' && '📱'}
                                                {' '}{metodo.metodo}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {metodo.quantidade} vendas
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full ${metodo.metodo === 'Dinheiro' ? 'bg-green-500' :
                                                        metodo.metodo === 'Cartão' ? 'bg-blue-500' :
                                                            'bg-purple-500'
                                                        }`}
                                                    style={{ width: `${porcentagem}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                                                R$ {metodo.total.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {porcentagem.toFixed(1)}% do total
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Vendas por Hora */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Vendas por Horário
                        </h2>
                        <div className="space-y-3">
                            {relatorio?.vendasPorHora.map((hora, index) => {
                                const maxVendas = Math.max(...(relatorio?.vendasPorHora.map(h => h.vendas) || [0]));
                                const porcentagem = (hora.vendas / maxVendas) * 100;
                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-700 w-12">
                                            {hora.hora}
                                        </span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-8">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full flex items-center justify-end pr-3"
                                                style={{ width: `${porcentagem}%` }}
                                            >
                                                <span className="text-xs font-semibold text-white">
                                                    R$ {hora.vendas}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Produtos Mais Vendidos */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <UtensilsCrossed className="w-6 h-6" />
                        Top 5 Produtos Mais Vendidos
                    </h2>
                    <div className="space-y-4">
                        {relatorio?.produtosMaisVendidos.map((produto, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl font-bold text-gray-300">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {produto.produto}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {produto.quantidade} unidades vendidas
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-green-600">
                                        R$ {produto.total.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        R$ {(produto.total / produto.quantidade).toFixed(2)} / un
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
