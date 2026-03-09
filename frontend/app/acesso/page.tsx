'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, LayoutDashboard, ExternalLink, Copy, Check, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Estabelecimento {
    id: string;
    nome: string;
}

// Credenciais dos usuários criados pelo seed (POST /api/seed-personas)
const CREDENCIAIS_PAINEL = [
    { email: 'carlos@bar.com', senha: '123456', nome: 'Bar do Carlos' },
    { email: 'mariana@rest.com', senha: '123456', nome: 'Restaurante Sabor' },
    { email: 'ricardo@mix.com', senha: '123456', nome: 'Mix Gastrobar' },
];

export default function AcessoPage() {
    const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/api/cardapio/estabelecimentos`)
            .then((r) => r.ok ? r.json() : [])
            .then(setEstabelecimentos)
            .catch(() => setEstabelecimentos([]))
            .finally(() => setLoading(false));
    }, []);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Links de acesso</h1>
                    <p className="text-gray-600">Cardápio dos estabelecimentos e Painel de Gestão</p>
                </div>

                {/* Cardápio */}
                <section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <UtensilsCrossed className="w-5 h-5 text-primary-600" />
                        Cardápio do estabelecimento
                    </h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                        </div>
                    ) : estabelecimentos.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            Nenhum estabelecimento cadastrado. Execute o seed da API (POST /api/seed-personas) para criar dados de teste.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {estabelecimentos.map((e) => {
                                const link = `${baseUrl}/cardapio/estabelecimento/${e.id}`;
                                return (
                                    <li key={e.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 truncate">{e.nome}</p>
                                            <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary-600 hover:underline truncate block"
                                            >
                                                {link}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(link, `card-${e.id}`)}
                                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                                title="Copiar link"
                                            >
                                                {copied === `card-${e.id}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                            <Link
                                                href={`/cardapio/estabelecimento/${e.id}`}
                                                target="_blank"
                                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Abrir cardápio"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* Painel de Gestão */}
                <section className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <LayoutDashboard className="w-5 h-5 text-primary-600" />
                        Painel de Gestão
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                        Acesso para gestores e donos (cardápio, mesas, usuários, operação).
                    </p>
                    <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-1">Link do painel</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm truncate">
                                {baseUrl}/admin/dashboard
                            </code>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(`${baseUrl}/admin/dashboard`, 'painel-link')}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
                            >
                                {copied === 'painel-link' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <Link
                                href="/admin/dashboard"
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                                title="Abrir painel"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Dados para acessar (após rodar o seed)</p>
                    <ul className="space-y-3">
                        {CREDENCIAIS_PAINEL.map((c, i) => {
                            const cred = `E-mail: ${c.email} | Senha: ${c.senha}`;
                            return (
                                <li key={c.email} className="p-3 bg-gray-50 rounded-xl">
                                    <p className="font-medium text-gray-900 text-sm">{c.nome}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="text-sm text-gray-700 flex-1 break-all">{cred}</code>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(cred, `cred-${i}`)}
                                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                        >
                                            {copied === `cred-${i}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="text-xs text-gray-400 mt-3">
                        Use e-mail e senha na tela de login (modo Admin). Se não tiver usuários, chame POST /api/seed-personas no backend.
                    </p>
                </section>

                <div className="text-center mt-8">
                    <Link href="/" className="text-primary-600 hover:underline text-sm">
                        ← Voltar à página inicial
                    </Link>
                </div>
            </div>
        </div>
    );
}
