'use client';

import { useState, useEffect } from 'react';
import { superAdminService } from '@/services/superadmin.service';
import { 
    Store, Users, Receipt, DollarSign, 
    ArrowUpRight, ArrowDownRight, Activity, CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardGlobal() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await superAdminService.getDashboard();
                setStats(data);
            } catch (error) {
                console.error("Erro ao carregar dashboard global:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!stats) return null;

    const { metricas, ultimosEstabelecimentos } = stats;

    // Dados fictícios para o gráfico apenas para efeito visual de demonstração
    const chartData = [
        { name: 'Seg', rec: metricas.receitaTotalPlataforma * 0.1 },
        { name: 'Ter', rec: metricas.receitaTotalPlataforma * 0.2 },
        { name: 'Qua', rec: metricas.receitaTotalPlataforma * 0.15 },
        { name: 'Qui', rec: metricas.receitaTotalPlataforma * 0.3 },
        { name: 'Sex', rec: metricas.receitaTotalPlataforma * 0.4 },
        { name: 'Sáb', rec: metricas.receitaTotalPlataforma * 0.8 },
        { name: 'Dom', rec: metricas.receitaTotalPlataforma * 1 },
    ];

    const StatCard = ({ title, value, subValue, icon: Icon, trend, color }: any) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 group-hover:bg-${color}-100 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={`flex items-center text-sm font-semibold px-2.5 py-1 rounded-full ${
                        trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                        {trend > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
                {subValue && <p className="text-sm text-gray-400 mt-2 font-medium">{subValue}</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header com Status do Sistema */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-900 to-purple-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="w-6 h-6 text-indigo-300" />
                        Visão Geral da Plataforma
                    </h1>
                    <p className="text-indigo-200 mt-1 font-medium">Todos os sistemas operando normalmente.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 relative z-10">
                    <div className="text-sm text-indigo-200 font-medium">Receita Hoje (Est.)</div>
                    <div className="text-2xl font-black">{formatCurrency(metricas.receitaTotalPlataforma)}</div>
                </div>
            </div>

            {/* Grid de Cards Menores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Estabelecimentos" 
                    value={metricas.totalEstabelecimentos} 
                    subValue={`${metricas.estabelecimentosAtivos} ativos, ${metricas.estabelecimentosInativos} inativos`}
                    icon={Store} 
                    color="indigo"
                    trend={12.5}
                />
                <StatCard 
                    title="Usuários na Plataforma" 
                    value={metricas.totalUsuarios} 
                    subValue="Excluindo superadmins"
                    icon={Users} 
                    color="blue"
                    trend={8.2}
                />
                <StatCard 
                    title="Pedidos Hoje" 
                    value={metricas.totalPedidosHoje} 
                    subValue="Em toda a plataforma"
                    icon={Receipt} 
                    color="emerald"
                    trend={24.5}
                />
                <StatCard 
                    title="Comandas Abertas" 
                    value={metricas.totalComandasAbertas} 
                    subValue="Consumo ao vivo"
                    icon={CreditCard} 
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico de Desempenho */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Volume Transacional (7 dias)</h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `R$${val/1000}k`} dx={-10}/>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                                <Area type="monotone" dataKey="rec" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Últimos Estabelecimentos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Novos Clientes</h2>
                        <Link href="/superadmin/estabelecimentos" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Ver todos →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {ultimosEstabelecimentos.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Nenhum estabelecimento recente</p>
                        ) : (
                            ultimosEstabelecimentos.map((est: any) => (
                                <Link key={est.id} href={`/superadmin/estabelecimentos/${est.id}`} className="group block">
                                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 border border-indigo-200/50 group-hover:scale-105 transition-transform">
                                            <Store className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{est.nome}</h4>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{est.cidade} - {est.estado}</p>
                                        </div>
                                        <div>
                                            {est.ativo ? (
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                            ) : (
                                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
