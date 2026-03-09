'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UtensilsCrossed, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Produto {
    id: string;
    nome: string;
    descricao: string | null;
    preco: string;
    precoPromocional: string | null;
    imagemUrl: string | null;
    disponivel: boolean;
}

interface Categoria {
    id: string;
    nome: string;
    cor: string;
    produtos: Produto[];
}

function formatPrice(value: string) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

export default function CardapioEstabelecimentoPage() {
    const params = useParams();
    const id = params.id as string;
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [nomeEstabelecimento, setNomeEstabelecimento] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const carregar = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const [cardapioRes, estabsRes] = await Promise.all([
                    fetch(`${API_URL}/api/cardapio?estabelecimentoId=${id}`),
                    fetch(`${API_URL}/api/cardapio/estabelecimentos`),
                ]);
                if (!cardapioRes.ok) {
                    setError('Cardápio não encontrado.');
                    return;
                }
                const data = await cardapioRes.json();
                setCategorias(data);
                if (estabsRes.ok) {
                    const estabs = await estabsRes.json();
                    const estab = estabs.find((e: { id: string }) => e.id === id);
                    if (estab) setNomeEstabelecimento(estab.nome);
                }
            } catch (e) {
                setError('Erro ao carregar o cardápio.');
            } finally {
                setLoading(false);
            }
        };
        carregar();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-stone-500 text-sm">Carregando cardápio...</p>
                </div>
            </div>
        );
    }

    if (error || categorias.length === 0) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
                <p className="text-stone-600 mb-4 text-center">{error || 'Nenhum item no cardápio no momento.'}</p>
                <Link
                    href="/acesso"
                    className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
                >
                    ← Voltar aos links
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header / Hero - identidade do estabelecimento */}
            <header className="bg-gradient-to-b from-stone-900 to-stone-800 text-white">
                <div className="max-w-4xl mx-auto px-4 pt-8 pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link
                            href="/acesso"
                            className="text-stone-400 hover:text-white text-sm transition-colors"
                        >
                            ← Outros cardápios
                        </Link>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {nomeEstabelecimento || 'Cardápio'}
                    </h1>
                    <p className="text-stone-400 mt-1 text-sm md:text-base">
                        Cardápio digital · Visualização
                    </p>
                </div>
            </header>

            {/* Aviso: somente visualização / delivery em breve */}
            <div className="bg-amber-50 border-b border-amber-100">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-amber-800 text-sm">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Este cardápio é apenas para visualização. Pedidos e delivery em breve.</span>
                </div>
            </div>

            {/* Navegação por categorias (sticky em desktop) */}
            <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-stone-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {categorias.map((cat) => (
                            <a
                                key={cat.id}
                                href={`#cat-${cat.id}`}
                                className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: `${cat.cor || '#d97706'}20`,
                                    color: cat.cor || '#b45309',
                                }}
                            >
                                {cat.nome}
                            </a>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Conteúdo: seções por categoria */}
            <main className="max-w-4xl mx-auto px-4 py-8 md:py-10">
                {categorias.map((cat) => (
                    <section
                        key={cat.id}
                        id={`cat-${cat.id}`}
                        className="scroll-mt-24 mb-12 last:mb-0"
                    >
                        <h2
                            className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3"
                            style={{ borderLeftColor: cat.cor || '#d97706' }}
                        >
                            <span
                                className="w-1.5 h-8 rounded-full shrink-0"
                                style={{ backgroundColor: cat.cor || '#d97706' }}
                            />
                            {cat.nome}
                        </h2>

                        <ul className="space-y-4">
                            {cat.produtos.map((prod) => (
                                <li
                                    key={prod.id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        {prod.imagemUrl ? (
                                            <div className="sm:w-36 sm:min-w-[9rem] h-36 sm:h-auto sm:min-h-[7rem] bg-stone-100">
                                                <img
                                                    src={prod.imagemUrl}
                                                    alt={prod.nome}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="sm:w-36 sm:min-w-[9rem] h-24 sm:h-auto sm:min-h-[7rem] bg-stone-100 flex items-center justify-center">
                                                <UtensilsCrossed className="w-10 h-10 text-stone-300" />
                                            </div>
                                        )}
                                        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center min-w-0">
                                            <h3 className="font-semibold text-stone-900 text-lg">
                                                {prod.nome}
                                            </h3>
                                            {prod.descricao && (
                                                <p className="text-stone-500 text-sm mt-1 line-clamp-2">
                                                    {prod.descricao}
                                                </p>
                                            )}
                                            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                                                <span className="font-bold text-stone-900 text-lg">
                                                    {formatPrice(prod.precoPromocional || prod.preco)}
                                                </span>
                                                {prod.precoPromocional && (
                                                    <span className="text-stone-400 text-sm line-through">
                                                        {formatPrice(prod.preco)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </main>

            {/* Footer - branding e link */}
            <footer className="border-t border-stone-200 bg-white mt-12">
                <div className="max-w-4xl mx-auto px-4 py-6 text-center text-stone-500 text-sm">
                    <p>Cardápio digital · {nomeEstabelecimento || 'Estabelecimento'}</p>
                    <Link href="/acesso" className="text-amber-600 hover:underline mt-1 inline-block">
                        Ver outros cardápios
                    </Link>
                </div>
            </footer>
        </div>
    );
}
