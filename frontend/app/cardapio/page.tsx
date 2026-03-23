'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Helpers: horário e pedido mínimo ────────────────────────────────────────

function parseHorario(str: string): { open: number; close: number } | null {
    if (!str || typeof str !== 'string') return null;
    const m = str.trim().match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const open = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    let close = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
    if (close === 0) close = 24 * 60; // 00:00 = meia-noite
    return { open, close };
}

function formatHoraParaExibicao(h: number, m: number): string {
    if (h === 24 || (h === 0 && m === 0)) return 'meia-noite';
    return `${h}h${m.toString().padStart(2, '0')}`;
}

function obterStatusHorario(cfg: Record<string, unknown> | null): {
    aberto: boolean;
    texto: string;
    fechaEm?: string;
    fechandoEmBreve: boolean;
} {
    const segSex = (cfg?.horarioSegSex as string) || '10:00 - 23:00';
    const sabDom = (cfg?.horarioSabDom as string) || '11:00 - 00:00';
    const now = new Date();
    const day = now.getDay(); // 0=Dom, 6=Sab
    const schedule = day >= 1 && day <= 5 ? segSex : sabDom;
    const parsed = parseHorario(schedule);
    if (!parsed) return { aberto: true, texto: 'Horário não informado', fechandoEmBreve: false };

    const nowMins = now.getHours() * 60 + now.getMinutes();
    const { open, close } = parsed;
    const aberto = nowMins >= open && nowMins < close;
    const closeH = Math.floor(close / 60) % 24;
    const closeM = close % 60;
    const fechaEmStr = formatHoraParaExibicao(closeH, closeM);
    const minsParaFechar = close - nowMins;
    const fechandoEmBreve = aberto && minsParaFechar > 0 && minsParaFechar <= 60;

    if (aberto) {
        return {
            aberto: true,
            texto: `Aberto até ${fechaEmStr}`,
            fechaEm: fechaEmStr,
            fechandoEmBreve,
        };
    }
    const openH = Math.floor(open / 60);
    const openM = open % 60;
    return {
        aberto: false,
        texto: `Fechado • Abre às ${formatHoraParaExibicao(openH, openM)}`,
        fechandoEmBreve: false,
    };
}

function obterPedidoMinimoTexto(cfg: Record<string, unknown> | null): string {
    const v = cfg?.pedidoMinimo;
    if (v == null || v === '' || (typeof v === 'number' && v <= 0)) return 'Sem pedido mínimo';
    const num = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v);
    if (isNaN(num) || num <= 0) return 'Sem pedido mínimo';
    return `Pedido mínimo R$ ${num.toFixed(2).replace('.', ',')}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface Produto {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    precoPromocional?: number;
    imagemUrl?: string;
    videoUrl?: string;
    disponivel: boolean;
    categoria: { nome: string };
}

interface ItemCarrinho {
    produto: Produto;
    quantidade: number;
    observacoes?: string;
}

// ─── Componente de Card de Produto ───────────────────────────────────────────

function ProdutoCard({
    produto,
    quantidade,
    onAdicionar,
    onOpenModal,
}: {
    produto: Produto;
    quantidade: number;
    onAdicionar: () => void;
    onOpenModal: () => void;
}) {
    const preco = produto.precoPromocional ?? produto.preco;
    return (
        <div className="group cursor-pointer flex flex-col" onClick={onOpenModal}>
            {/* Imagem vertical */}
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md mb-3 bg-slate-100">
                {produto.imagemUrl ? (
                    <img
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-300 text-6xl">restaurant</span>
                    </div>
                )}
                {/* Badge de quantidade */}
                {quantidade > 0 && (
                    <div className="absolute top-3 left-3 bg-[#FF6B00] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        {quantidade}
                    </div>
                )}
            </div>

            {/* Info + botão */}
            <div className="flex justify-between items-start">
                <div className="pr-2 flex-1 min-w-0">
                    {produto.precoPromocional ? (
                        <div className="flex items-center gap-1 mb-0.5">
                            <p className="text-[#FF6B00] font-bold text-sm">
                                R$ {produto.precoPromocional.toFixed(2)}
                            </p>
                            <p className="text-slate-400 text-xs line-through">
                                R$ {produto.preco.toFixed(2)}
                            </p>
                        </div>
                    ) : (
                        <p className="text-[#FF6B00] font-bold text-sm mb-0.5">
                            R$ {preco.toFixed(2)}
                        </p>
                    )}
                    <h3 className="font-extrabold text-sm leading-tight uppercase tracking-tight mb-1 text-slate-900 line-clamp-2">
                        {produto.nome}
                    </h3>
                    <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                        {produto.descricao}
                    </p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onAdicionar(); }}
                    className="flex-shrink-0 w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined text-lg font-bold">add</span>
                </button>
            </div>
        </div>
    );
}

// ─── Modal de Produto ────────────────────────────────────────────────────────

function ProdutoModal({
    produto,
    quantidade,
    onClose,
    onAdicionar,
    onReduzir,
}: {
    produto: Produto;
    quantidade: number;
    onClose: () => void;
    onAdicionar: () => void;
    onReduzir: () => void;
}) {
    const preco = produto.precoPromocional ?? produto.preco;
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fechar */}
                <button
                    className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center hover:bg-black/20 transition-colors"
                    onClick={onClose}
                >
                    <span className="material-symbols-outlined text-slate-800">close</span>
                </button>

                {/* Imagem ou Vídeo (mesma proporção 9/16) */}
                <div className="w-full md:w-1/2 relative bg-slate-100 overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '80vh' }}>
                    {produto.videoUrl ? (
                        <iframe
                            src={produto.videoUrl}
                            title={produto.nome}
                            className="w-full h-full object-cover"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : produto.imagemUrl ? (
                        <img
                            src={produto.imagemUrl}
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-300 text-8xl">restaurant</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                {/* Detalhes */}
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col">
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase leading-tight mb-2 text-slate-900">
                            {produto.nome}
                        </h2>
                        {produto.precoPromocional ? (
                            <div className="flex items-center gap-2 mb-6">
                                <p className="text-2xl font-black text-[#FF6B00]">
                                    R$ {produto.precoPromocional.toFixed(2)}
                                </p>
                                <p className="text-slate-400 line-through text-sm">
                                    R$ {produto.preco.toFixed(2)}
                                </p>
                            </div>
                        ) : (
                            <p className="text-2xl font-black text-[#FF6B00] mb-6">
                                R$ {preco.toFixed(2)}
                            </p>
                        )}

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Descrição</h4>
                                <p className="text-slate-600 leading-relaxed text-sm">{produto.descricao}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Categoria</h4>
                                <span className="inline-block bg-orange-50 text-[#FF6B00] border border-orange-200 px-3 py-1 rounded-full text-xs font-bold">
                                    {produto.categoria?.nome || 'Geral'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center bg-slate-100 rounded-2xl p-1.5">
                            <button
                                onClick={onReduzir}
                                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white transition-all text-slate-500"
                            >
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                            <span className="w-10 text-center font-bold text-lg">{quantidade || 0}</span>
                            <button
                                onClick={onAdicionar}
                                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white transition-all text-slate-500"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                        <button
                            onClick={onAdicionar}
                            className="flex-1 w-full bg-[#FF6B00] hover:bg-orange-600 text-white h-14 rounded-2xl font-bold text-base shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">add_shopping_cart</span>
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Página Principal ────────────────────────────────────────────────────────

function CardapioPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const comandaCodigo = searchParams.get('comanda');
    const estabelecimentoId = searchParams.get('id');

    const [estabelecimento, setEstabelecimento] = useState<any>(null);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');
    const [busca, setBusca] = useState('');
    const [showCarrinho, setShowCarrinho] = useState(false);
    const [modalProduto, setModalProduto] = useState<Produto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!estabelecimentoId) {
            setLoading(false);
            return;
        }
        carregarDados();
    }, [estabelecimentoId]);

    const carregarDados = async () => {
        try {
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

            // 1. Fetch Estabelecimento
            const resEstab = await fetch(`${apiUrl}/api/cardapio/estabelecimento/${estabelecimentoId}`);
            if (!resEstab.ok) throw new Error('Estabelecimento não encontrado');
            const dataEstab = await resEstab.json();
            setEstabelecimento(dataEstab);

            // 2. Fetch Cardápio
            const resCardapio = await fetch(`${apiUrl}/api/cardapio?estabelecimentoId=${estabelecimentoId}`);
            if (!resCardapio.ok) throw new Error('Falha ao buscar produtos');
            const dataCardapio = await resCardapio.json();

            // Achata o retorno agrupado para manter a interface atual funcionando
            const produtosAchatados = dataCardapio.flatMap((cat: any) =>
                cat.produtos.map((p: any) => ({
                    ...p,
                    categoria: { nome: cat.nome },
                    preco: Number(p.preco),
                    precoPromocional: p.precoPromocional ? Number(p.precoPromocional) : undefined,
                }))
            );

            setProdutos(produtosAchatados);
        } catch {
            toast.error('Erro ao carregar cardápio');
        } finally {
            setLoading(false);
        }
    };

    const adicionarAoCarrinho = (produto: Produto) => {
        setCarrinho(prev => {
            const existe = prev.find(i => i.produto.id === produto.id);
            if (existe) return prev.map(i => i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i);
            return [...prev, { produto, quantidade: 1 }];
        });
        toast.success(`${produto.nome} adicionado!`);
    };

    const reduzirDoCarrinho = (produtoId: string) => {
        setCarrinho(prev =>
            prev.map(i => i.produto.id === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i)
                .filter(i => i.quantidade > 0)
        );
    };

    const removerDoCarrinho = (produtoId: string) => {
        setCarrinho(prev => prev.filter(i => i.produto.id !== produtoId));
    };

    const calcularTotal = () =>
        carrinho.reduce((t, i) => t + (i.produto.precoPromocional ?? i.produto.preco) * i.quantidade, 0);

    const finalizarPedido = () => {
        if (carrinho.length === 0) { toast.error('Adicione itens ao carrinho'); return; }
        localStorage.setItem('carrinho', JSON.stringify(
            carrinho.map(i => ({
                produtoId: i.produto.id,
                nome: i.produto.nome,
                preco: i.produto.precoPromocional ?? i.produto.preco,
                quantidade: i.quantidade,
                imagemUrl: i.produto.imagemUrl,
            }))
        ));
        // Detectar modo de negócio do estabelecimento
        const isDeliveryOnly = estabelecimento?.aceitaDelivery === true && estabelecimento?.aceitaConsumoLocal === false;
        if (isDeliveryOnly) {
            router.push(`/pedido/delivery?id=${estabelecimentoId}`);
        } else {
            router.push(`/pedido/confirmar?comanda=${comandaCodigo}`);
        }
    };

    const categorias = ['todas', ...Array.from(new Set(produtos.map(p => p.categoria?.nome || 'Geral')))];
    const produtosFiltrados = produtos.filter(p => {
        const cat = p.categoria?.nome || 'Geral';
        return (categoriaAtiva === 'todas' || cat === categoriaAtiva)
            && (p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.descricao || '').toLowerCase().includes(busca.toLowerCase()));
    });

    const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0);
    const getQtd = (id: string) => carrinho.find(i => i.produto.id === id)?.quantidade ?? 0;

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Carregando cardápio...</p>
                </div>
            </div>
        );
    }

    if (!estabelecimento) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
                <span className="material-symbols-outlined text-slate-300 text-7xl block mb-4">store_off</span>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Restaurante não encontrado</h1>
                <p className="text-slate-500">Por favor, verifique o QR Code ou pego no estabelecimento.</p>
            </div>
        );
    }

    const cfg = (estabelecimento?.configuracoes && typeof estabelecimento.configuracoes === 'object')
        ? (estabelecimento.configuracoes as Record<string, unknown>)
        : {};
    const nomeF = (cfg.nomeFantasia as string) || estabelecimento?.nome || 'Cardápio Digital';
    const logoUrl = cfg.logoUrl as string | undefined;
    const statusHorario = obterStatusHorario(cfg);
    const pedidoMinimoTexto = obterPedidoMinimoTexto(cfg);

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-32" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>

            {/* ── Header com capa ─────────────────────────────────────────── */}
            <header className="relative w-full overflow-hidden">
                <div className="h-48 w-full relative">
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8F9FA]" />
                    {/* Botões de nav no topo */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white"
                            aria-label="Voltar"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="flex items-center gap-2">
                            {/* Histórico de pedidos */}
                            {comandaCodigo && (
                                <button
                                    onClick={() => router.push(`/pedido/acompanhar?comanda=${comandaCodigo}`)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white"
                                    aria-label="Meus pedidos"
                                    title="Meus Pedidos"
                                >
                                    <span className="material-symbols-outlined">receipt_long</span>
                                </button>
                            )}
                            {/* Carrinho */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowCarrinho(true)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white"
                                    aria-label="Carrinho"
                                >
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                </button>
                                {totalItens > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                        {totalItens}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logo + Info do estabelecimento */}
                <div className="px-6 -mt-10 relative z-10 flex flex-col items-start">
                    <div className="w-20 h-20 rounded-full border-4 border-[#F8F9FA] overflow-hidden shadow-xl bg-white flex items-center justify-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt={nomeF} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-[#FF6B00] text-4xl">restaurant</span>
                        )}
                    </div>
                    <div className="mt-3 w-full flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 line-clamp-1">{nomeF}</h1>
                            {comandaCodigo ? (
                                <p className="text-sm text-slate-500 font-medium">Você está neste local</p>
                            ) : (
                                <p className="text-sm text-slate-500 font-medium">Seja bem vindo(a)!</p>
                            )}
                            {/* Horário + Pedido mínimo */}
                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                                <span className="font-medium">{statusHorario.texto}</span>
                                <span className="text-slate-300">•</span>
                                <span>{pedidoMinimoTexto}</span>
                            </div>
                        </div>
                        {comandaCodigo && (
                            <div className="bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 px-4 py-2 rounded-full text-xs font-bold tracking-wider">
                                COMANDA: {comandaCodigo}
                            </div>
                        )}
                    </div>
                    {/* Alerta: loja fechando em breve */}
                    {statusHorario.fechandoEmBreve && statusHorario.fechaEm && (
                        <div className="mt-3 w-full bg-amber-100 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm font-medium">
                            Loja fechando, peça até às {statusHorario.fechaEm}.
                        </div>
                    )}
                </div>
            </header>

            {/* ── Busca + Categorias ──────────────────────────────────────── */}
            <div className="mt-6 px-6">
                {/* Busca */}
                <div className="relative mb-5">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent shadow-sm"
                    />
                </div>

                {/* Pills de categoria */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {categorias.map((cat) => {
                        const isActive = categoriaAtiva === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategoriaAtiva(cat)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${isActive
                                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/30'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#FF6B00] hover:text-[#FF6B00]'
                                    }`}
                            >
                                {cat === 'todas' ? 'Todas' : cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Grid de Produtos ────────────────────────────────────────── */}
            <main className="px-6 mt-8">
                {produtosFiltrados.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-slate-300 text-7xl block mb-4">restaurant</span>
                        <p className="text-slate-500">Nenhum produto encontrado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
                        {produtosFiltrados.map((produto) => (
                            <ProdutoCard
                                key={produto.id}
                                produto={produto}
                                quantidade={getQtd(produto.id)}
                                onAdicionar={() => adicionarAoCarrinho(produto)}
                                onOpenModal={() => setModalProduto(produto)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ── Barra inferior do carrinho ──────────────────────────────── */}
            {carrinho.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative bg-slate-100 p-2.5 rounded-xl">
                                <span className="material-symbols-outlined text-slate-900 text-3xl">shopping_cart</span>
                                <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {totalItens}
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider leading-none mb-1">Seu Pedido</p>
                                <p className="text-slate-900 font-extrabold text-2xl leading-none">
                                    R$ {calcularTotal().toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCarrinho(true)}
                            className="bg-[#FF6B00] hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 text-base"
                        >
                            Ver Carrinho
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modal Carrinho ──────────────────────────────────────────── */}
            {showCarrinho && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowCarrinho(false)}>
                    <div
                        className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-extrabold text-slate-900">Seu Pedido</h2>
                            <button onClick={() => setShowCarrinho(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                            {carrinho.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 text-center">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-slate-300 text-5xl">shopping_cart</span>
                                    </div>
                                    <p className="font-bold text-slate-700 text-base mb-1">Carrinho vazio</p>
                                    <p className="text-sm text-slate-400">Adicione itens do cardápio para começar seu pedido.</p>
                                    <button
                                        onClick={() => setShowCarrinho(false)}
                                        className="mt-6 px-6 py-2.5 bg-[#FF6B00] text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all"
                                    >
                                        Explorar Cardápio
                                    </button>
                                </div>
                            ) : (
                                carrinho.map((item) => {
                                    const preco = item.produto.precoPromocional ?? item.produto.preco;
                                    return (
                                        <div key={item.produto.id} className="bg-slate-50 rounded-2xl p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm">{item.produto.nome}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">R$ {preco.toFixed(2)} × {item.quantidade}</p>
                                                </div>
                                                <button onClick={() => removerDoCarrinho(item.produto.id)} className="text-red-400 p-1 hover:text-red-600">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 bg-white rounded-xl p-1 border border-slate-200">
                                                    <button onClick={() => reduzirDoCarrinho(item.produto.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-bold min-w-[24px] text-center">{item.quantidade}</span>
                                                    <button onClick={() => adicionarAoCarrinho(item.produto)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="font-extrabold text-slate-900">R$ {(preco * item.quantidade).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {carrinho.length > 0 && (
                            <div className="px-6 py-5 border-t border-slate-100 bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-600 font-semibold">Total</span>
                                    <span className="text-2xl font-extrabold text-[#FF6B00]">R$ {calcularTotal().toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={finalizarPedido}
                                    className="w-full bg-[#FF6B00] hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Finalizar Pedido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal de Produto ────────────────────────────────────────── */}
            {modalProduto && (
                <ProdutoModal
                    produto={modalProduto}
                    quantidade={getQtd(modalProduto.id)}
                    onClose={() => setModalProduto(null)}
                    onAdicionar={() => adicionarAoCarrinho(modalProduto)}
                    onReduzir={() => reduzirDoCarrinho(modalProduto.id)}
                />
            )}
        </div>
    );
}

export default function CardapioPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center"><div className="w-14 h-14 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div></div>}>
            <CardapioPageContent />
        </Suspense>
    );
}
