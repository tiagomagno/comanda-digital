'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    TrendingUp,
    TrendingDown,
    Receipt,
    ShoppingBag,
    UtensilsCrossed,
    Coffee,
    BarChart3,
    PieChart,
    ArrowRight,
    RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
    receitaTotal: number;
    totalPedidos: number;
    salao: number;
    paraLevar: number;
    ticketMedio: number;
    comandasAtivas: number;
    produtosEmAlta: Array<{ nome: string; pedidos: number }>;
    estoqueEsgotado: Array<{ nome: string; disponivelEm: string }>;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState<'diario' | 'semanal' | 'mensal'>('diario');

    useEffect(() => {
        carregarDashboard();
        const interval = setInterval(carregarDashboard, 60000);
        return () => clearInterval(interval);
    }, []);

    const carregarDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }
            const mock: DashboardStats = {
                receitaTotal: 0,
                totalPedidos: 0,
                salao: 0,
                paraLevar: 0,
                ticketMedio: 0,
                comandasAtivas: 0,
                produtosEmAlta: [],
                estoqueEsgotado: [],
            };
            setStats(mock);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            toast.error('Erro ao carregar dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto mb-3" />
                    <p className="text-gray-600">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={carregarDashboard}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {/* KPIs - estilo Stitch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Receita Total</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                R$ {stats?.receitaTotal.toLocaleString('pt-BR')}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                                <TrendingUp className="w-4 h-4" />
                                <span>10%</span>
                                <span className="text-gray-400">Comparado a ontem</span>
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-orange-100">
                            <BarChart3 className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Comandas Ativas</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.comandasAtivas}</p>
                            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                                <TrendingUp className="w-4 h-4" />
                                <span>5%</span>
                                <span className="text-gray-400">Em tempo real</span>
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Receipt className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalPedidos}</p>
                            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                                <TrendingUp className="w-4 h-4" />
                                <span>20%</span>
                                <span className="text-gray-400">Comparado a ontem</span>
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-green-100">
                            <ShoppingBag className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                R$ {stats?.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                <TrendingDown className="w-4 h-4" />
                                <span>2%</span>
                                <span className="text-gray-400">Comparado a ontem</span>
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-100">
                            <Receipt className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos - linha única */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Vendas Diárias</h3>
                    <div className="flex gap-2 mb-4">
                        {(['diario', 'semanal', 'mensal'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setChartPeriod(p)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartPeriod === p
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {p === 'diario' ? 'Diário' : p === 'semanal' ? 'Semanal' : 'Mensal'}
                            </button>
                        ))}
                    </div>
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Gráfico de área (11h–19h)
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Receita por Categoria</h3>
                        <button type="button" className="p-1 rounded hover:bg-gray-100 text-gray-400">
                            <span className="sr-only">Mais opções</span>
                            ⋮
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-32 h-32 rounded-full border-8 border-gray-200 border-t-green-500 border-r-orange-500 border-b-red-400 flex items-center justify-center shrink-0">
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">R$ 200K</p>
                                <p className="text-xs text-gray-500">Receita Total</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Comida</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500" />
                                <span>Bebida</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-500" />
                                <span>Outros</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Produtos em Alta + Estoque Esgotado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Produtos em Alta</h3>
                        <Link
                            href="/admin/produtos"
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium inline-flex items-center gap-1"
                        >
                            Ver todos
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <ul className="space-y-3">
                        {stats?.produtosEmAlta.map((item, i) => (
                            <li key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <UtensilsCrossed className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <span className="font-medium text-gray-900">{item.nome}</span>
                                </div>
                                <span className="text-gray-500 text-sm">Pedidos: {item.pedidos}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Estoque Esgotado</h3>
                        <Link
                            href="/admin/produtos"
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium inline-flex items-center gap-1"
                        >
                            Ver todos
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <ul className="space-y-3">
                        {stats?.estoqueEsgotado.map((item, i) => (
                            <li key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Coffee className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span className="font-medium text-gray-700">{item.nome}</span>
                                </div>
                                <span className="text-gray-500 text-sm">Disponível: {item.disponivelEm}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
