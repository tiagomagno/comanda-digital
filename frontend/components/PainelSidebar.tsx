'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UtensilsCrossed,
    QrCode,
    Users,
    UserCircle,
    ChefHat,
    Wine,
    DollarSign,
    TrendingUp,
    Settings,
    Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menu = [
    {
        title: 'Visão geral',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        section: 'Cardápio',
        items: [
            { title: 'Produtos', href: '/admin/produtos', icon: UtensilsCrossed },
        ],
    },
    {
        section: 'Estabelecimento',
        items: [
            { title: 'Mesas e QR Code', href: '/admin/mesas', icon: QrCode },
            { title: 'Usuários e Garçons', href: '/admin/usuarios', icon: Users },
        ],
    },
    {
        section: 'Operação',
        items: [
            { title: 'Garçom', href: '/garcom', icon: UserCircle },
            { title: 'Cozinha', href: '/cozinha', icon: ChefHat },
            { title: 'Bar', href: '/bar', icon: Wine },
            { title: 'Caixa', href: '/caixa', icon: DollarSign },
        ],
    },
    {
        section: 'Sistema',
        items: [
            { title: 'Relatórios', href: '/admin/relatorios', icon: TrendingUp },
            { title: 'Configurações', href: '/admin/configuracoes', icon: Settings },
        ],
    },
];

export default function PainelSidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/admin/dashboard') return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <Store className="w-8 h-8 text-primary-600" />
                    <span className="font-bold text-gray-900">Painel de Gestão</span>
                </Link>
            </div>

            <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
                <Link
                    href="/admin/dashboard"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive('/admin/dashboard')
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                >
                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                    Visão geral
                </Link>

                {menu.filter((m): m is { section: string; items: Array<{ title: string; href: string; icon: typeof LayoutDashboard }> } => 'section' in m && !!m.section).map((block) => (
                    <div key={block.section}>
                        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {block.section}
                        </p>
                        <ul className="space-y-0.5">
                            {block.items.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                            isActive(item.href)
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        <item.icon className="w-5 h-5 shrink-0" />
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
