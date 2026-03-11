'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    UtensilsCrossed, Plus, Edit, Trash2, RefreshCw, Tag, Star, X, Play,
    Search, ChevronLeft, ChevronRight, GripVertical, Pencil, MoreHorizontal, Upload, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Categoria {
    id: string;
    nome: string;
}

interface Produto {
    id: string;
    codigo: string;
    nome: string;
    descricao?: string;
    preco: number;
    precoPromocional?: number;
    categoria: Categoria;
    disponivel: boolean;
    destaque: boolean;
    imagemUrl?: string;
    videoUrl?: string;
    unidades?: number;
}

const ITEMS_PER_PAGE = 12;

// Ícones de categoria por nome (fallback para Tag)
const CATEGORY_ICONS: Record<string, string> = {
    pizza: '🍕', burger: '🍔', hamburguer: '🍔', arroz: '🍚',
    sushi: '🍣', sobremesa: '🍰', bebida: '🥤', drink: '🍸',
    massa: '🍝', petisco: '🍟', salada: '🥗', promoção: '🏷️',
    combo: '📦', adicional: '➕', temaki: '🌯', harumaki: '🥟',
    gyoza: '🥟', sunomono: '🥗', niguiri: '🍱', hossomaki: '🍙',
};

function getCategoryIcon(nome: string): string {
    const lower = nome.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return '🍽️';
}

export default function ProdutosPage() {
    const router = useRouter();
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [produtoToDelete, setProdutoToDelete] = useState<Produto | null>(null);
    const [produtoParaVideo, setProdutoParaVideo] = useState<Produto | null>(null);
    const [produtoDetalhes, setProdutoDetalhes] = useState<Produto | null>(null);

    // Filtros e paginação
    const [filter, setFilter] = useState<string>('todos');
    const [searchProduto, setSearchProduto] = useState('');
    const [page, setPage] = useState(1);
    const [estabelecimentoId, setEstabelecimentoId] = useState<string>('');

    // Abas — navegação com setas
    const [tabStart, setTabStart] = useState(0);
    const TABS_VISIBLE = 8;

    // Busca expandível
    const [searchExpanded, setSearchExpanded] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Categorias modal
    const [buscaCategoria, setBuscaCategoria] = useState('');
    const [categoriaForm, setCategoriaForm] = useState({ nome: '' });

    // Estado para modo edição no modal
    const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null);

    // Produto form
    const [formData, setFormData] = useState({
        codigo: '', nome: '', descricao: '', preco: '',
        precoPromocional: '', categoriaId: '', destaque: false, videoUrl: '', imagemUrl: ''
    });


    const abrirEdicao = (produto: Produto) => {
        setEditandoProduto(produto);
        setFormData({
            codigo: produto.codigo || '',
            nome: produto.nome,
            descricao: produto.descricao || '',
            preco: String(produto.preco),
            precoPromocional: produto.precoPromocional ? String(produto.precoPromocional) : '',
            categoriaId: produto.categoria.id,
            destaque: produto.destaque,
            videoUrl: produto.videoUrl || '',
            imagemUrl: produto.imagemUrl || '',
        });
        setShowModal(true);
    };

    const calcDesconto = (preco: number, precoPromo: number) =>
        Math.round(((preco - precoPromo) / preco) * 100);


    const getImagemProduto = (p: Produto) => {
        if (p.imagemUrl) return p.imagemUrl;
        const seed = encodeURIComponent(p.id + p.nome);
        return `https://picsum.photos/seed/${seed}/400/400`;
    };

    useEffect(() => { carregarDados(); }, []);

    const carregarDados = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/auth/login'); return; }

            let estabelecimentoIdFromJwt = '';
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                estabelecimentoIdFromJwt = payload?.estabelecimentoId || '';
                if (estabelecimentoIdFromJwt) setEstabelecimentoId(estabelecimentoIdFromJwt);
            } catch (e) {
                console.error('Erro ao decodificar token', e);
            }

            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [catRes, prodRes] = await Promise.allSettled([
                fetch(`${apiUrl}/api/categorias`, { headers }),
                fetch(`${apiUrl}/api/produtos`, { headers }),
            ]);

            if (catRes.status === 'fulfilled' && catRes.value.ok) {
                const data = await catRes.value.json();
                setCategorias(Array.isArray(data) ? data : data.categorias || []);
            }
            if (prodRes.status === 'fulfilled') {
                if (prodRes.value.ok) {
                    const data = await prodRes.value.json();
                    setProdutos(Array.isArray(data) ? data : data.produtos || []);
                } else if (prodRes.value.status === 401) {
                    toast.error('Sessão expirada. Faça login novamente.');
                    router.push('/auth/login');
                    return;
                } else {
                    toast.error('Erro ao carregar produtos do servidor');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const criarProduto = async (e: React.FormEvent) => {
        e.preventDefault();
        const categoriaSelecionada = categorias.find(c => c.id === formData.categoriaId);
        if (!categoriaSelecionada) { toast.error('Selecione uma categoria'); return; }

        let videoUrl = formData.videoUrl.trim() || undefined;
        if (videoUrl?.includes('youtube.com/watch')) {
            const match = videoUrl.match(/[?&]v=([^&]+)/);
            if (match) videoUrl = `https://www.youtube.com/embed/${match[1]}`;
        }
        
        let imagemUrl = formData.imagemUrl.trim() || undefined;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');
            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const payload = {
                codigo: formData.codigo,
                nome: formData.nome,
                descricao: formData.descricao || undefined,
                preco: parseFloat(formData.preco),
                precoPromocional: formData.precoPromocional ? parseFloat(formData.precoPromocional) : undefined,
                categoriaId: categoriaSelecionada.id,
                destaque: formData.destaque,
                videoUrl,
                imagemUrl,
            };

            if (editandoProduto) {
                // Modo edição — atualiza produto via API
                const res = await fetch(`${apiUrl}/api/produtos/${editandoProduto.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload)
                });
                
                if (!res.ok) throw new Error('Erro ao atualizar produto');
                const produtoAtualizado = await res.json();
                
                setProdutos(prev => prev.map(p => p.id === editandoProduto.id ? { ...produtoAtualizado, categoria: categoriaSelecionada } : p));
                toast.success('Produto atualizado!');
            } else {
                // Modo criação — cria produto via API
                const res = await fetch(`${apiUrl}/api/produtos`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
                
                if (!res.ok) throw new Error('Erro ao criar produto');
                const novoProduto = await res.json();
                
                setProdutos(prev => [...prev, { ...novoProduto, categoria: categoriaSelecionada }]);
                toast.success('Produto criado com sucesso!');
            }
            
            setShowModal(false);
            setEditandoProduto(null);
            setFormData({ codigo: '', nome: '', descricao: '', preco: '', precoPromocional: '', categoriaId: '', destaque: false, videoUrl: '', imagemUrl: '' });
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            toast.error('Erro ao salvar produto. Verifique sua conexão e tente novamente.');
        }
    };

    const criarCategoria = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoriaForm.nome.trim()) return;
        const nova: Categoria = { id: Date.now().toString(), nome: categoriaForm.nome.trim() };
        setCategorias(prev => [...prev, nova]);
        toast.success('Categoria criada!');
        setCategoriaForm({ nome: '' });
    };

    const deletarCategoria = (id: string) => {
        const emUso = produtos.filter(p => p.categoria.id === id);
        if (emUso.length > 0) {
            toast.error(`${emUso.length} produto(s) usam esta categoria.`);
            return;
        }
        setCategorias(prev => prev.filter(c => c.id !== id));
        toast.success('Categoria excluída!');
    };

    const toggleDisponivel = (id: string) => {
        setProdutos(prev => prev.map(p => p.id === id ? { ...p, disponivel: !p.disponivel } : p));
        toast.success('Status atualizado!');
    };

    const toggleDestaque = (id: string) => {
        setProdutos(prev => prev.map(p => p.id === id ? { ...p, destaque: !p.destaque } : p));
    };

    const confirmarExclusao = () => {
        if (!produtoToDelete) return;
        setProdutos(prev => prev.filter(p => p.id !== produtoToDelete.id));
        toast.success('Produto excluído!');
        setShowDeleteModal(false);
        setProdutoToDelete(null);
    };

    // Produtos filtrados + busca
    const produtosFiltrados = useMemo(() => {
        return produtos.filter(p => {
            const porCategoria = filter === 'todos' || p.categoria.id === filter;
            const porBusca = !searchProduto || p.nome.toLowerCase().includes(searchProduto.toLowerCase());
            return porCategoria && porBusca;
        });
    }, [produtos, filter, searchProduto]);

    const totalPages = Math.ceil(produtosFiltrados.length / ITEMS_PER_PAGE);
    const produtosPagina = produtosFiltrados.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Categorias do modal filtradas por busca
    const categoriasFiltradas = useMemo(() => {
        if (!buscaCategoria.trim()) return categorias;
        return categorias.filter(c => c.nome.toLowerCase().includes(buscaCategoria.toLowerCase()));
    }, [categorias, buscaCategoria]);

    // Label da categoria ativa
    const categoriaAtiva = categorias.find(c => c.id === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#FF5C01] mx-auto mb-3" />
                    <p className="text-gray-500">Carregando produtos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UtensilsCrossed className="w-7 h-7 text-[#FF5C01]" />
                        Gestão de Produtos
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Gerencie seu cardápio e categorias de forma eficiente</p>
                </div>
                <div className="flex items-center gap-0">

                    {/* Busca colapsável — só ícone, expande ao clicar */}
                    <div className="relative flex items-center pr-2">
                        <button
                            onClick={() => {
                                setSearchExpanded(v => !v);
                                if (!searchExpanded) setTimeout(() => searchInputRef.current?.focus(), 50);
                            }}
                            className={`p-2 rounded-xl transition-colors ${searchExpanded ? 'text-[#FF5C01]' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="Buscar produto"
                        >
                            <Search className="w-[18px] h-[18px]" />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${searchExpanded ? 'w-52 opacity-100' : 'w-0 opacity-0'
                            }`}>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Buscar produto..."
                                value={searchProduto}
                                onChange={e => { setSearchProduto(e.target.value); setPage(1); }}
                                onKeyDown={e => e.key === 'Escape' && setSearchExpanded(false)}
                                className="w-full pl-2 pr-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#FF5C01]/30"
                            />
                        </div>
                    </div>

                    {/* Separador */}
                    <span className="w-px h-5 bg-gray-200 mx-2" />

                    {/* Importar — link simples */}
                    <Link
                        href="/admin/produtos/importar"
                        className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
                    >
                        <Upload className="w-[15px] h-[15px]" />
                        Importar
                    </Link>

                    {/* Separador */}
                    <span className="w-px h-5 bg-gray-200 mx-2" />

                    {/* Novo Produto */}
                    <button
                        onClick={() => { setEditandoProduto(null); setFormData({ codigo: '', nome: '', descricao: '', preco: '', precoPromocional: '', categoriaId: '', destaque: false, videoUrl: '', imagemUrl: '' }); setShowModal(true); }}
                        className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5C01] text-white font-semibold hover:bg-[#e05101] transition-colors shadow-sm text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Produto
                    </button>
                </div>
            </div>

            {/* ── Estatísticas ── */}
            <div className="grid grid-cols-4 gap-4">
                {/* Total de Produtos */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-gray-500 text-sm">Total de Produtos</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{produtos.length}</p>
                </div>

                {/* Categorias — com ações */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Categorias</p>
                        <p className="text-3xl font-bold mt-1 text-[#FF5C01]">{categorias.length}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        {/* Adicionar categoria */}
                        <button
                            onClick={() => {
                                setShowCategoriaModal(true);
                                setTimeout(() => document.querySelector<HTMLInputElement>('[placeholder="Ex: Sobremesas, Bebidas..."]')?.focus(), 100);
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-[#FF5C01] hover:text-[#e05101] transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Adicionar
                        </button>
                        {/* Listar categorias */}
                        <button
                            onClick={() => setShowCategoriaModal(true)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Tag className="w-3.5 h-3.5" />
                            Ver lista
                        </button>
                    </div>
                </div>

                {/* Em Destaque */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-gray-500 text-sm">Em Destaque</p>
                    <p className="text-3xl font-bold mt-1 text-yellow-500">{produtos.filter(p => p.destaque).length}</p>
                </div>

                {/* Visualizar Cardápio */}
                <Link
                    href={estabelecimentoId ? `/cardapio?id=${estabelecimentoId}` : '/cardapio'}
                    target="_blank"
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between group hover:border-[#FF5C01]/30 hover:shadow-md transition-all"
                >
                    <div>
                        <p className="text-gray-500 text-sm">Visualizar Cardápio</p>
                        <p className="text-sm font-medium text-[#FF5C01] mt-1 group-hover:underline">Ver preview →</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FF5C01]/10 text-[#FF5C01] group-hover:bg-[#FF5C01]/20 transition-colors">
                        <Eye className="w-5 h-5" />
                    </div>
                </Link>
            </div>

            {/* ── Abas de Categoria com setas ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
                <div className="flex items-center gap-2">
                    {/* Seta esquerda */}
                    <button
                        onClick={() => setTabStart(Math.max(0, tabStart - 1))}
                        disabled={tabStart === 0}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors shrink-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Tabs visíveis */}
                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                        {/* Sempre mostra "Todos" */}
                        {tabStart === 0 && (
                            <button
                                onClick={() => { setFilter('todos'); setPage(1); }}
                                className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors whitespace-nowrap shrink-0 ${filter === 'todos'
                                    ? 'bg-[#FF5C01] text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Todos
                            </button>
                        )}

                        {categorias.slice(tabStart === 0 ? 0 : tabStart - 1, tabStart === 0 ? TABS_VISIBLE - 1 : tabStart + TABS_VISIBLE - 1).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { setFilter(cat.id); setPage(1); }}
                                className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors whitespace-nowrap shrink-0 ${filter === cat.id
                                    ? 'bg-[#FF5C01] text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {cat.nome}
                            </button>
                        ))}

                        {/* "Mais" dropdown indicativo */}
                        {categorias.length > TABS_VISIBLE && (
                            <button
                                onClick={() => setShowCategoriaModal(true)}
                                className="px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-100 text-sm font-medium whitespace-nowrap flex items-center gap-1 shrink-0"
                            >
                                Mais <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Seta direita */}
                    <button
                        onClick={() => setTabStart(Math.min(categorias.length - TABS_VISIBLE + 1, tabStart + 1))}
                        disabled={tabStart >= categorias.length - TABS_VISIBLE + 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors shrink-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Label de resultados ── */}
            {
                produtosFiltrados.length > 0 && (
                    <p className="text-sm text-gray-500 text-right -mt-2">
                        Exibindo <span className="text-[#FF5C01] font-semibold">{produtosFiltrados.length}</span> resultado(s)
                        {categoriaAtiva && <> em <span className="text-[#FF5C01] font-semibold">{categoriaAtiva.nome}</span></>}
                    </p>
                )
            }

            {/* ── Grid de Produtos ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                {/* Card "Novo Prato" */}
                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-orange-50 hover:border-[#FF5C01]/40 flex flex-col items-center justify-center min-h-[260px] p-6 transition-all group"
                >
                    <div className="w-12 h-12 rounded-full bg-[#FF5C01]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF5C01]/20 transition-colors">
                        <Plus className="w-6 h-6 text-[#FF5C01]" />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">Novo Prato</span>
                    <span className="text-xs text-gray-400 mt-1 text-center">Adicione um novo item a esta categoria</span>
                </button>

                {/* Cards de produto */}
                {produtosPagina.map(produto => (
                    <div
                        key={produto.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                    >
                        {/* Imagem full-width */}
                        <div className="relative overflow-hidden group" style={{ height: '220px' }}>
                            <img
                                src={getImagemProduto(produto)}
                                alt={produto.nome}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay vídeo */}
                            <button
                                type="button"
                                onClick={() => setProdutoParaVideo(produto)}
                                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="w-10 h-10 rounded-full bg-[#FF5C01] flex items-center justify-center shadow">
                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                </span>
                            </button>
                            {/* Botão destaque */}
                            <button
                                onClick={() => toggleDestaque(produto.id)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow text-gray-400 hover:text-yellow-500 transition-colors"
                            >
                                <Star className="w-3.5 h-3.5" fill={produto.destaque ? '#EAB308' : 'none'} />
                            </button>
                            {produto.destaque && (
                                <span className="absolute top-2 left-2 bg-[#FF5C01] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Destaque
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-1">{produto.nome}</h3>

                            {/* Descrição breve */}
                            <p className="text-gray-400 text-xs line-clamp-2 mb-2 min-h-[2rem]">
                                {produto.descricao || <span className="italic text-gray-300">Sem descrição — clique em Editar para adicionar</span>}
                            </p>

                            {/* Preço */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[#FF5C01] font-bold text-base">
                                    R$ {Number(produto.precoPromocional ?? produto.preco).toFixed(2).replace('.', ',')}
                                </p>
                                {produto.precoPromocional && produto.precoPromocional < produto.preco && (
                                    <>
                                        <p className="text-gray-300 text-xs line-through">
                                            R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                                        </p>
                                        <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                            -{calcDesconto(produto.preco, produto.precoPromocional)}%
                                        </span>
                                    </>
                                )}
                            </div>

                            <p className="text-gray-400 text-xs mt-0.5">
                                {produto.disponivel
                                    ? `${produto.unidades ?? '—'} Unidades Disponíveis`
                                    : <span className="text-red-500 font-medium">Esgotado</span>
                                }
                            </p>

                            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                                <button
                                    onClick={() => setProdutoDetalhes(produto)}
                                    className="text-xs font-medium text-[#FF5C01] hover:underline"
                                >
                                    Visualizar Detalhes
                                </button>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => abrirEdicao(produto)}
                                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                        title="Editar produto"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => { setProdutoToDelete(produto); setShowDeleteModal(true); }}
                                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Estado vazio */}
            {
                produtosFiltrados.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <UtensilsCrossed className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400">Nenhum produto encontrado</p>
                    </div>
                )
            }

            {/* ── Paginação ── */}
            {
                totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => setPage(n)}
                                className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${n === page
                                    ? 'bg-[#FF5C01] text-white shadow-sm'
                                    : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )
            }

            {/* ── Modal de Detalhes do Produto ── */}
            {
                produtoDetalhes && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setProdutoDetalhes(null)}>
                        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                            {/* Imagem */}
                            <div className="relative" style={{ height: '220px' }}>
                                <img
                                    src={getImagemProduto(produtoDetalhes)}
                                    alt={produtoDetalhes.nome}
                                    className="w-full h-full object-cover"
                                />
                                {/* Botão fechar */}
                                <button
                                    onClick={() => setProdutoDetalhes(null)}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                {/* Badge destaque */}
                                {produtoDetalhes.destaque && (
                                    <span className="absolute top-3 left-3 bg-[#FF5C01] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        ⭐ Destaque
                                    </span>
                                )}
                                {/* Badge promoção */}
                                {produtoDetalhes.precoPromocional && produtoDetalhes.precoPromocional < produtoDetalhes.preco && (
                                    <span className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        -{calcDesconto(produtoDetalhes.preco, produtoDetalhes.precoPromocional)}% OFF
                                    </span>
                                )}
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {/* Categoria */}
                                <span className="inline-block text-xs font-semibold text-[#FF5C01] bg-[#FF5C01]/10 px-3 py-1 rounded-full">
                                    {produtoDetalhes.categoria.nome}
                                </span>

                                {/* Nome */}
                                <h2 className="text-xl font-bold text-gray-900 leading-snug">{produtoDetalhes.nome}</h2>

                                {/* Descrição */}
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {produtoDetalhes.descricao || <span className="italic text-gray-400">Sem descrição cadastrada.</span>}
                                </p>

                                {/* Preços */}
                                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">Preço</p>
                                        {produtoDetalhes.precoPromocional && produtoDetalhes.precoPromocional < produtoDetalhes.preco ? (
                                            <div className="flex items-center gap-2">
                                                <p className="text-2xl font-bold text-[#FF5C01]">
                                                    R$ {Number(produtoDetalhes.precoPromocional).toFixed(2).replace('.', ',')}
                                                </p>
                                                <p className="text-sm text-gray-300 line-through">
                                                    R$ {Number(produtoDetalhes.preco).toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-2xl font-bold text-[#FF5C01]">
                                                R$ {Number(produtoDetalhes.preco).toFixed(2).replace('.', ',')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 mb-0.5">Estoque</p>
                                        {produtoDetalhes.disponivel ? (
                                            <p className="text-sm font-semibold text-green-600">
                                                {produtoDetalhes.unidades ?? '—'} un. disponíveis
                                            </p>
                                        ) : (
                                            <p className="text-sm font-semibold text-red-500">Esgotado</p>
                                        )}
                                    </div>
                                </div>

                                {/* Código */}
                                {produtoDetalhes.codigo && (
                                    <p className="text-xs text-gray-400">
                                        Código: <span className="font-mono font-semibold text-gray-600">{produtoDetalhes.codigo}</span>
                                    </p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => {
                                        setProdutoDetalhes(null);
                                        abrirEdicao(produtoDetalhes);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Pencil className="w-4 h-4" /> Editar
                                </button>
                                <button
                                    onClick={() => {
                                        setProdutoToDelete(produtoDetalhes);
                                        setShowDeleteModal(true);
                                        setProdutoDetalhes(null);
                                    }}
                                    className="px-4 py-2.5 rounded-xl border border-red-100 text-red-500 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setProdutoParaVideo(produtoDetalhes);
                                        setProdutoDetalhes(null);
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-[#FF5C01] text-white font-medium hover:bg-[#e05101] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Play className="w-4 h-4 fill-white" /> Ver Vídeo
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── Modal de Vídeo ── */}
            {
                produtoParaVideo && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setProdutoParaVideo(null)}>
                        <div className="flex flex-col items-center max-h-[90vh]" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between w-full max-w-[280px] mb-2">
                                <h2 className="text-base font-semibold text-white truncate flex-1 mr-2">{produtoParaVideo.nome}</h2>
                                <button onClick={() => setProdutoParaVideo(null)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white shrink-0">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {produtoParaVideo.videoUrl ? (
                                <div className="w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl">
                                    <iframe src={produtoParaVideo.videoUrl} title={produtoParaVideo.nome} className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                </div>
                            ) : (
                                <div className="w-full max-w-[280px] aspect-[9/16] flex items-center justify-center bg-gray-800 rounded-2xl text-gray-400 text-sm text-center px-4">
                                    Vídeo não cadastrado para este produto.
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* ── Modal de Exclusão ── */}
            {
                showDeleteModal && produtoToDelete && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Confirmar Exclusão</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Tem certeza que deseja excluir <strong>{produtoToDelete.nome}</strong>? Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowDeleteModal(false); setProdutoToDelete(null); }}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button onClick={confirmarExclusao}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── Modal de Categorias ── */}
            {
                showCategoriaModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Gerenciar Categorias</h2>
                                    <p className="text-gray-400 text-sm mt-0.5">Organize e reordene as seções do seu menu</p>
                                </div>
                                <button onClick={() => setShowCategoriaModal(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Busca */}
                            <div className="px-6 pt-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar categoria..."
                                        value={buscaCategoria}
                                        onChange={e => setBuscaCategoria(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#FF5C01]/30 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Nova categoria */}
                            <div className="px-6 pt-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nova Categoria</p>
                                <form onSubmit={criarCategoria} className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={categoriaForm.nome}
                                        onChange={e => setCategoriaForm({ nome: e.target.value })}
                                        placeholder="Ex: Sobremesas, Bebidas..."
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="w-10 h-10 rounded-full bg-[#FF5C01] text-white flex items-center justify-center hover:bg-[#e05101] transition-colors shadow-sm shrink-0"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>

                            {/* Counter */}
                            <div className="px-6 pt-4 pb-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Visualizando {categoriasFiltradas.length} de {categorias.length} categorias
                                </p>
                            </div>

                            {/* Lista com scroll */}
                            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-1 min-h-0">
                                {categoriasFiltradas.length === 0 ? (
                                    <p className="text-gray-400 text-sm italic py-4 text-center">Nenhuma categoria encontrada.</p>
                                ) : (
                                    categoriasFiltradas.map(cat => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            {/* Drag handle */}
                                            <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab" />
                                            {/* Ícone */}
                                            <div className="w-9 h-9 rounded-xl bg-[#FF5C01]/10 flex items-center justify-center text-lg shrink-0">
                                                {getCategoryIcon(cat.nome)}
                                            </div>
                                            {/* Nome */}
                                            <p className="flex-1 font-medium text-gray-900 text-sm truncate">{cat.nome}</p>
                                            {/* Ações */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => deletarCategoria(cat.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowCategoriaModal(false)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => { toast.success('Categorias salvas!'); setShowCategoriaModal(false); }}
                                    className="px-6 py-2.5 rounded-xl bg-[#FF5C01] text-white font-semibold hover:bg-[#e05101] transition-colors shadow-sm"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── Modal de Novo Produto ── */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">

                            <div className="p-6 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editandoProduto ? 'Editar Produto' : 'Novo Produto'}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {editandoProduto ? `Editando: ${editandoProduto.nome}` : 'Preencha as informações do produto'}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <form id="form-produto" onSubmit={criarProduto} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Código *</label>
                                            <input type="text" required value={formData.codigo}
                                                onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all"
                                                placeholder="Ex: BEB001" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Produto *</label>
                                            <input type="text" required value={formData.nome}
                                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all"
                                                placeholder="Ex: Cerveja Heineken" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria *</label>
                                        <select required value={formData.categoriaId}
                                            onChange={e => setFormData({ ...formData, categoriaId: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all bg-white">
                                            <option value="">Selecione uma categoria</option>
                                            {categorias.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                                        <textarea value={formData.descricao}
                                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all resize-none"
                                            rows={3} placeholder="Descrição do produto..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço *</label>
                                            <input type="number" step="0.01" required value={formData.preco}
                                                onChange={e => setFormData({ ...formData, preco: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all"
                                                placeholder="0.00" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço Promocional</label>
                                            <input type="number" step="0.01" value={formData.precoPromocional}
                                                onChange={e => setFormData({ ...formData, precoPromocional: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all"
                                                placeholder="0.00" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link da Imagem</label>
                                            <input type="url" value={formData.imagemUrl}
                                                onChange={e => setFormData({ ...formData, imagemUrl: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all"
                                                placeholder="https://exemplo.com/imagem.jpg" />
                                            <p className="text-xs text-gray-400 mt-1">Insira a URL de uma foto para exibição do produto.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link do Vídeo</label>
                                            <input type="url" value={formData.videoUrl}
                                                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all"
                                                placeholder="https://www.youtube.com/embed/..." />
                                            <p className="text-xs text-gray-400 mt-1">Ao clicar na imagem, o vídeo será exibido em Reels.</p>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.destaque}
                                            onChange={e => setFormData({ ...formData, destaque: e.target.checked })}
                                            className="w-4 h-4 accent-[#FF5C01] rounded" />
                                        <span className="text-sm font-medium text-gray-700">⭐ Destacar produto</span>
                                    </label>
                                </form>
                            </div>

                            <div className="p-6 pt-4 border-t border-gray-100 flex gap-3">
                                <button type="button"
                                    onClick={() => { setShowModal(false); setEditandoProduto(null); setFormData({ codigo: '', nome: '', descricao: '', preco: '', precoPromocional: '', categoriaId: '', destaque: false, videoUrl: '', imagemUrl: '' }); }}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" form="form-produto"
                                    className="flex-1 py-2.5 rounded-xl bg-[#FF5C01] text-white font-semibold hover:bg-[#e05101] transition-colors shadow-sm">
                                    {editandoProduto ? 'Salvar Alterações' : 'Criar Produto'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
