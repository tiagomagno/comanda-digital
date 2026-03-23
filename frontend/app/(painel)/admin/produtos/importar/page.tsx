'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Upload, Link2, FileText, CheckCircle2, AlertCircle,
    ChevronRight, Download, X, Loader2, Tag, UtensilsCrossed,
    ArrowLeft, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface CategoriaPreview { nome: string; destino: 'BAR' | 'COZINHA'; }
interface ProdutoPreview {
    nome: string; descricao?: string; preco: number;
    precoPromocional?: number; categoria: string; destaque?: boolean;
}
interface PreviewData {
    categorias: CategoriaPreview[];
    produtos: ProdutoPreview[];
    totais: { categorias: number; produtos: number };
}

type Step = 'metodo' | 'configurar' | 'preview' | 'resultado';
type Metodo = 'url' | 'csv' | 'manual';

const PLATAFORMAS = [
    { id: 'anotaai', nome: 'Anota.ai', logo: '🟠', placeholder: 'https://pedido.anota.ai/loja/sua-loja' },
    { id: 'ifood', nome: 'iFood', logo: '🔴', placeholder: 'https://www.ifood.com.br/delivery/...' },
    { id: 'rappi', nome: 'Rappi', logo: '🟡', placeholder: 'https://www.rappi.com.br/restaurantes/...' },
];

export default function ImportarPage() {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);

    // ── Redirecionamento provisório (Módulo bloqueado) ──
    useEffect(() => {
        router.replace('/admin/produtos');
    }, [router]);

    const [step, setStep] = useState<Step>('metodo');
    const [metodo, setMetodo] = useState<Metodo>('url');
    const [url, setUrl] = useState('');
    const [csvText, setCsvText] = useState('');
    const [csvNome, setCsvNome] = useState('');
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<{ categoriasCriadas: number; produtosCriados: number; produtosAtualizados?: number; erros: string[] } | null>(null);
    const [buscarCategoria, setBuscarCategoria] = useState('');

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');
    const headers = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    });

    // ── Carregar CSV ──────────────────────────────────────────────────────────
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCsvNome(file.name);
        const reader = new FileReader();
        reader.onload = ev => setCsvText(ev.target?.result as string || '');
        reader.readAsText(file, 'utf-8');
    };

    // ── Preview ───────────────────────────────────────────────────────────────
    const fazerPreview = async () => {
        setLoading(true);
        try {
            const body: any = {};
            if (metodo === 'url') body.url = url;
            else if (metodo === 'csv') body.csv = csvText;

            const res = await fetch(`${apiUrl}/api/importar/preview`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.erro || 'Erro ao processar dados');
                return;
            }
            setPreview(data);
            setStep('preview');
        } catch (e) {
            toast.error('Erro de conexão com o servidor');
        } finally {
            setLoading(false);
        }
    };

    // ── Executar importação ───────────────────────────────────────────────────
    const executar = async () => {
        if (!preview) return;
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/importar/executar`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({
                    categorias: preview.categorias,
                    produtos: preview.produtos,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.erro || 'Erro ao importar');
                return;
            }
            setResultado(data);
            setStep('resultado');
        } catch (e) {
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    // ── Download template ─────────────────────────────────────────────────────
    const downloadTemplate = async () => {
        const res = await fetch(`${apiUrl}/api/importar/template-csv`, { headers: headers() });
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'template-importacao.csv';
        a.click();
    };

    const categoriasFiltradas = preview?.categorias.filter(c =>
        !buscarCategoria || c.nome.toLowerCase().includes(buscarCategoria.toLowerCase())
    ) || [];

    return (
        <div className="p-6 space-y-6">

            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => step === 'metodo' ? router.back() : setStep(step === 'preview' ? 'configurar' : step === 'resultado' ? 'preview' : 'metodo')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-4 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {step === 'metodo' ? 'Voltar para Produtos' : 'Voltar'}
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5C01]/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#FF5C01]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Importar Cardápio</h1>
                        <p className="text-gray-500 text-sm">Importe produtos e categorias em segundos</p>
                    </div>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center gap-2 mt-6">
                    {(['metodo', 'configurar', 'preview', 'resultado'] as Step[]).map((s, i) => {
                        const labels = ['Método', 'Configurar', 'Revisar', 'Concluído'];
                        const idx = ['metodo', 'configurar', 'preview', 'resultado'].indexOf(step);
                        const active = s === step;
                        const done = i < idx;
                        return (
                            <div key={s} className="flex items-center">
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${active ? 'bg-[#FF5C01] text-white' : done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {done && <CheckCircle2 className="w-3 h-3" />}
                                    {labels[i]}
                                </div>
                                {i < 3 && <ChevronRight className="w-3 h-3 text-gray-300 mx-1" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── STEP 1: Método ── */}
            {step === 'metodo' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Como deseja importar?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* URL */}
                        <button
                            onClick={() => { setMetodo('url'); setStep('configurar'); }}
                            className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#FF5C01] p-6 text-left transition-all group hover:shadow-md"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#FF5C01]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF5C01]/20 transition-colors">
                                <Link2 className="w-6 h-6 text-[#FF5C01]" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">URL da loja</h3>
                            <p className="text-gray-500 text-sm">Cole o link da sua loja no Anota.ai, iFood ou Rappi e importamos tudo automaticamente.</p>
                            <div className="mt-4 flex flex-wrap gap-1">
                                {PLATAFORMAS.map(p => (
                                    <span key={p.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.logo} {p.nome}</span>
                                ))}
                            </div>
                        </button>

                        {/* CSV */}
                        <button
                            onClick={() => { setMetodo('csv'); setStep('configurar'); }}
                            className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#FF5C01] p-6 text-left transition-all group hover:shadow-md"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Arquivo CSV / Excel</h3>
                            <p className="text-gray-500 text-sm">Prepare uma planilha com seus produtos e faça o upload. Baixe nosso template para começar.</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                                <Download className="w-3 h-3" /> Baixar template
                            </span>
                        </button>

                        {/* Manual */}
                        <button
                            onClick={() => router.push('/admin/produtos')}
                            className="bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-300 p-6 text-left transition-all group hover:shadow-md"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                                <UtensilsCrossed className="w-6 h-6 text-gray-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Adicionar manualmente</h3>
                            <p className="text-gray-500 text-sm">Cadastre produtos e categorias um por um diretamente no painel de gestão.</p>
                        </button>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                            <strong>Dica:</strong> A importação por URL funciona melhor com lojas do Anota.ai. Para iFood e Rappi, recomendamos usar o CSV exportado da própria plataforma.
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Configurar ── */}
            {step === 'configurar' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    {metodo === 'url' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Cole o link da sua loja</h2>
                                <p className="text-gray-500 text-sm">Vamos buscar automaticamente todas as categorias e produtos.</p>
                            </div>

                            {/* Plataformas */}
                            <div className="flex flex-wrap gap-2">
                                {PLATAFORMAS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setUrl(p.placeholder)}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                                    >
                                        {p.logo} {p.nome}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL da loja *</label>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder="https://pedido.anota.ai/loja/nome-da-loja"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                                ⚠️ Se a extração automática falhar, você pode baixar o cardápio da sua plataforma como CSV e usar a opção de importação por arquivo.
                            </div>
                        </div>
                    )}

                    {metodo === 'csv' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Importar via CSV / Excel</h2>
                                <p className="text-gray-500 text-sm">Faça upload da sua planilha ou cole o conteúdo diretamente.</p>
                            </div>

                            {/* Template */}
                            <button
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Baixar template CSV de exemplo
                            </button>

                            {/* Upload */}
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#FF5C01]/50 hover:bg-orange-50/30 transition-all"
                            >
                                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={onFileChange} />
                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                {csvNome ? (
                                    <div>
                                        <p className="font-semibold text-gray-800">{csvNome}</p>
                                        <p className="text-gray-400 text-sm mt-0.5">{csvText.split('\n').length - 1} linhas detectadas</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-600 font-medium">Clique para selecionar um arquivo</p>
                                        <p className="text-gray-400 text-sm mt-0.5">CSV ou TXT — separado por vírgula ou ponto-e-vírgula</p>
                                    </>
                                )}
                            </div>

                            {/* Ou cole */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ou cole o conteúdo CSV aqui</label>
                                <textarea
                                    value={csvText}
                                    onChange={e => setCsvText(e.target.value)}
                                    rows={8}
                                    placeholder={'categoria;nome;descricao;preco;preco_promocional;destaque\nBebidas;Coca-Cola lata;Gelada;7,00;;nao\nPratos;Filé grelhado;Com fritas;45,00;39,90;sim'}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono resize-y outline-none focus:ring-2 focus:ring-[#FF5C01]/30 focus:border-[#FF5C01] transition-all"
                                />
                            </div>

                            {/* Colunas aceitas */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colunas aceitas no CSV</p>
                                <div className="flex flex-wrap gap-2">
                                    {['categoria', 'nome *', 'descricao', 'preco *', 'preco_promocional', 'destaque (sim/não)'].map(c => (
                                        <span key={c} className={`text-xs px-2 py-1 rounded-lg font-mono ${c.includes('*') ? 'bg-[#FF5C01]/10 text-[#FF5C01]' : 'bg-gray-100 text-gray-600'}`}>{c}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        <button onClick={() => setStep('metodo')} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                            Voltar
                        </button>
                        <button
                            onClick={fazerPreview}
                            disabled={loading || (metodo === 'url' && !url) || (metodo === 'csv' && !csvText)}
                            className="px-6 py-2.5 rounded-xl bg-[#FF5C01] text-white font-semibold text-sm hover:bg-[#e05101] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</> : <>Analisar <ChevronRight className="w-4 h-4" /></>}
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 3: Preview ── */}
            {step === 'preview' && preview && (
                <div className="space-y-4">
                    {/* Resumo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FF5C01]/10 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-[#FF5C01]" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Categorias encontradas</p>
                                <p className="text-2xl font-bold text-gray-900">{preview.totais.categorias}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <UtensilsCrossed className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Produtos encontrados</p>
                                <p className="text-2xl font-bold text-gray-900">{preview.totais.produtos}</p>
                            </div>
                        </div>
                    </div>

                    {/* Categorias */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Categorias</h3>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={buscarCategoria}
                                onChange={e => setBuscarCategoria(e.target.value)}
                                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF5C01]/30 w-40 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {categoriasFiltradas.map((cat, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cat.destino === 'BAR' ? 'bg-purple-500' : 'bg-[#FF5C01]'}`} />
                                    <span className="text-gray-800 truncate">{cat.nome}</span>
                                    <span className={`ml-auto text-xs font-medium shrink-0 ${cat.destino === 'BAR' ? 'text-purple-500' : 'text-[#FF5C01]'}`}>{cat.destino}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Produtos (amostra) */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">
                            Produtos
                            <span className="ml-2 text-sm text-gray-400 font-normal">— prévia dos primeiros {Math.min(10, preview.produtos.length)}</span>
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {preview.produtos.slice(0, 10).map((p, i) => (
                                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm truncate">{p.nome}</p>
                                        <p className="text-gray-400 text-xs truncate">{p.categoria}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[#FF5C01] font-bold text-sm">R$ {p.preco.toFixed(2).replace('.', ',')}</p>
                                        {p.destaque && <span className="text-xs text-yellow-500">⭐ Destaque</span>}
                                    </div>
                                </div>
                            ))}
                            {preview.produtos.length > 10 && (
                                <p className="text-center text-sm text-gray-400 py-2">
                                    + {preview.produtos.length - 10} produtos adicionais serão importados
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Warning destino */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        O destino (BAR/COZINHA) foi inferido automaticamente pelo nome da categoria. Você pode ajustá-lo nas configurações de categorias após a importação.
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between">
                        <button onClick={() => setStep('configurar')} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                            Voltar
                        </button>
                        <button
                            onClick={executar}
                            disabled={loading}
                            className="px-8 py-2.5 rounded-xl bg-[#FF5C01] text-white font-bold text-sm hover:bg-[#e05101] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                        >
                            {loading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</>
                                : <>Confirmar e Importar {preview.totais.produtos} produtos <ChevronRight className="w-4 h-4" /></>
                            }
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 4: Resultado ── */}
            {step === 'resultado' && resultado && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Importação concluída! 🎉</h2>
                        <p className="text-gray-500">Seu cardápio foi importado com sucesso.</p>

                        <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
                            <div className="bg-[#FF5C01]/5 rounded-xl p-4">
                                <p className="text-3xl font-bold text-[#FF5C01]">{resultado.categoriasCriadas}</p>
                                <p className="text-gray-500 text-sm mt-0.5">Categorias</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4">
                                <p className="text-3xl font-bold text-green-600">{resultado.produtosCriados}</p>
                                <p className="text-gray-500 text-sm mt-0.5">Produtos criados</p>
                            </div>
                            {(resultado.produtosAtualizados ?? 0) > 0 && (
                                <div className="col-span-2 bg-blue-50 rounded-xl p-4">
                                    <p className="text-3xl font-bold text-blue-600">{resultado.produtosAtualizados}</p>
                                    <p className="text-gray-500 text-sm mt-0.5">Produtos atualizados (sem duplicar)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {resultado.erros.length > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {resultado.erros.length} item(s) com erro
                            </h3>
                            <ul className="space-y-1">
                                {resultado.erros.map((e, i) => (
                                    <li key={i} className="text-amber-700 text-sm">• {e}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => { setStep('metodo'); setPreview(null); setResultado(null); setUrl(''); setCsvText(''); setCsvNome(''); }}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Nova importação
                        </button>
                        <button
                            onClick={() => router.push('/admin/produtos')}
                            className="flex-1 py-3 rounded-xl bg-[#FF5C01] text-white font-semibold hover:bg-[#e05101] transition-colors shadow-sm"
                        >
                            Ver produtos importados →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
