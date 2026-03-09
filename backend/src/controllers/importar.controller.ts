import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import prisma from '../config/database.js';
import https from 'https';
import http from 'http';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CategoriaImport {
    nome: string;
    destino: 'BAR' | 'COZINHA';
}

interface ProdutoImport {
    codigo?: string;
    nome: string;
    descricao?: string;
    preco: number;
    precoPromocional?: number;
    categoria: string;
    destaque?: boolean;
}

interface ImportPayload {
    categorias: CategoriaImport[];
    produtos: ProdutoImport[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function limparPreco(valor: string | number): number {
    if (typeof valor === 'number') return valor;
    return parseFloat(
        valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
    ) || 0;
}

function inferirDestino(nomeCategoria: string): 'BAR' | 'COZINHA' {
    const lower = nomeCategoria.toLowerCase();
    const bar = ['bebida', 'drink', 'suco', 'água', 'water', 'cerveja', 'chopp', 'vinho', 'licor', 'dose', 'caipirinha', 'adicional'];
    if (bar.some(k => lower.includes(k))) return 'BAR';
    return 'COZINHA';
}

function truncar(texto: string | undefined, max = 500): string | undefined {
    if (!texto) return undefined;
    return texto.length > max ? texto.substring(0, max - 3) + '...' : texto;
}

function buscarUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const cliente = url.startsWith('https') ? https : http;
        const options = {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            },
        };
        const req = cliente.get(url, options, (res) => {
            if (res.statusCode === 404) {
                reject(new Error('404'));
                return;
            }
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                buscarUrl(res.headers.location).then(resolve).catch(reject);
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout ao buscar URL')); });
    });
}

// ─── Parsers por plataforma ───────────────────────────────────────────────────

// Tenta extrair dados da API interna do Anota.ai
async function parseAnotaAi(storeSlug: string): Promise<ImportPayload | null> {
    const endpoints = [
        `https://api.anota.ai/store/${storeSlug}/catalog`,
        `https://api.anota.ai/store/${storeSlug}/menu`,
        `https://api.anota.ai/v2/store/${storeSlug}/catalog`,
        `https://api.anota.ai/v2/store/${storeSlug}/menu`,
    ];

    for (const endpoint of endpoints) {
        try {
            const html = await buscarUrl(endpoint);
            const json = JSON.parse(html);
            if (json?.categories || json?.catalog) {
                const rawCats = json.categories || json.catalog?.categories || [];
                const categorias: CategoriaImport[] = rawCats.map((c: any) => ({
                    nome: c.name || c.title || c.nome,
                    destino: inferirDestino(c.name || c.title || ''),
                }));

                const produtos: ProdutoImport[] = [];
                for (const cat of rawCats) {
                    const itens = cat.items || cat.products || cat.produtos || [];
                    for (const item of itens) {
                        produtos.push({
                            nome: item.title || item.name || item.nome,
                            descricao: truncar(item.description || item.descricao),
                            preco: limparPreco(item.price || item.preco || 0),
                            precoPromocional: item.sale_price ? limparPreco(item.sale_price) : undefined,
                            categoria: cat.name || cat.title || cat.nome,
                            destaque: item.highlight === true,
                        });
                    }
                }
                if (categorias.length > 0) return { categorias, produtos };
            }
        } catch (_) { /* tenta próximo */ }
    }

    // Fallback: buscar HTML da página e extrair JSON embutido (ex: __NEXT_DATA__, window.__STATE__)
    try {
        const pageUrl = `https://pedido.anota.ai/loja/${storeSlug}`;
        const html = await buscarUrl(pageUrl);
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (nextDataMatch) {
            const nextData = JSON.parse(nextDataMatch[1]);
            const pageProps = nextData?.props?.pageProps || nextData?.props;
            const rawCats = pageProps?.catalog?.categories || pageProps?.categories || pageProps?.menu || [];
            if (Array.isArray(rawCats) && rawCats.length > 0) {
                const categorias: CategoriaImport[] = rawCats.map((c: any) => ({
                    nome: c.name || c.title || c.nome || '',
                    destino: inferirDestino(c.name || c.title || c.nome || ''),
                })).filter((c: CategoriaImport) => c.nome);

                const produtos: ProdutoImport[] = [];
                for (const cat of rawCats) {
                    const itens = cat.items || cat.products || cat.produtos || [];
                    for (const item of itens) {
                        produtos.push({
                            nome: item.title || item.name || item.nome,
                            descricao: truncar(item.description || item.descricao),
                            preco: limparPreco(item.price || item.preco || 0),
                            precoPromocional: item.sale_price ? limparPreco(item.sale_price) : undefined,
                            categoria: cat.name || cat.title || cat.nome || 'Geral',
                            destaque: item.highlight === true,
                        });
                    }
                }
                if (categorias.length > 0) return { categorias, produtos };
            }
        }
    } catch (_) { /* ignora */ }

    return null;
}

// Parser CSV: suporta layouts com colunas: categoria, nome, descricao, preco, preco_promocional, destino
function parseCsv(csv: string): ImportPayload {
    const linhas = csv.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (linhas.length < 2) return { categorias: [], produtos: [] };

    const delim = linhas[0].includes(';') ? ';' : ',';
    const cabecalho = linhas[0].split(delim).map(h => h.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
    );

    const get = (row: string[], campo: string) => {
        const idx = cabecalho.indexOf(campo);
        return idx >= 0 ? row[idx]?.trim().replace(/^"|"$/g, '') || '' : '';
    };

    const categoriaSet = new Set<string>();
    const produtos: ProdutoImport[] = [];

    for (let i = 1; i < linhas.length; i++) {
        const cols = linhas[i].split(delim);
        const categoria = get(cols, 'categoria') || get(cols, 'category') || 'Geral';
        const nome = get(cols, 'nome') || get(cols, 'name') || get(cols, 'produto');
        if (!nome) continue;

        categoriaSet.add(categoria);
        const precoStr = get(cols, 'preco') || get(cols, 'price') || get(cols, 'valor') || '0';
        const promoStr = get(cols, 'preco_promocional') || get(cols, 'promotional_price') || '';

        produtos.push({
            nome,
            descricao: truncar(get(cols, 'descricao') || get(cols, 'description')),
            preco: limparPreco(precoStr),
            precoPromocional: promoStr ? limparPreco(promoStr) : undefined,
            categoria,
            destaque: (get(cols, 'destaque') || '').toLowerCase() === 'sim',
        });
    }

    const destinos: Record<string, string> = {};
    cabecalho.forEach((h, i) => { if (h === 'destino' || h === 'destination') destinos['_col'] = String(i); });

    const categorias: CategoriaImport[] = Array.from(categoriaSet).map(nome => ({
        nome,
        destino: inferirDestino(nome),
    }));

    return { categorias, produtos };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/importar/preview
 * Faz preview da importação (não salva nada)
 */
export const previewImportacao = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { url, csv, dados } = req.body;

    let payload: ImportPayload | null = null;

    // 1. Dados pré-processados (JSON direto)
    if (dados) {
        payload = dados as ImportPayload;
    }

    // 2. URL do anota.ai
    else if (url) {
        const slug = url
            .replace(/https?:\/\/pedido\.anota\.ai\/loja\//i, '')
            .replace(/https?:\/\/.*?\/loja\//i, '')
            .replace(/\/$/, '')
            .split('/')[0];

        payload = await parseAnotaAi(slug);

        if (!payload) {
            return res.status(422).json({
                erro: 'Não foi possível extrair dados automaticamente desta URL. O Anota.ai pode ter alterado a API. Use a importação por CSV: exporte o cardápio do painel do Anota.ai ou monte um arquivo com as colunas categoria;nome;descricao;preco;preco_promocional;destaque.',
                slug,
            });
        }
    }

    // 3. CSV
    else if (csv) {
        payload = parseCsv(csv);
    }

    if (!payload || payload.categorias.length === 0) {
        return res.status(400).json({ erro: 'Nenhum dado válido encontrado para importar.' });
    }

    return res.json({
        categorias: payload.categorias,
        produtos: payload.produtos,
        totais: {
            categorias: payload.categorias.length,
            produtos: payload.produtos.length,
        },
    });
});

/**
 * POST /api/importar/executar
 * Salva categorias e produtos no banco
 */
export const executarImportacao = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId;
    if (!estabelecimentoId) {
        return res.status(403).json({ erro: 'Estabelecimento não encontrado.' });
    }

    const { categorias, produtos } = req.body as ImportPayload;

    if (!categorias?.length) {
        return res.status(400).json({ erro: 'Nenhuma categoria para importar.' });
    }

    const catMap: Record<string, string> = {};
    let catCriadas = 0;
    let prodCriados = 0;
    let prodAtualizados = 0;
    let erros: string[] = [];

    // Criar/atualizar categorias (upsert evita duplicatas)
    for (let i = 0; i < categorias.length; i++) {
        const cat = categorias[i];
        try {
            const criada = await prisma.categoria.upsert({
                where: { estabelecimentoId_nome: { estabelecimentoId, nome: cat.nome } },
                create: {
                    estabelecimentoId,
                    nome: cat.nome,
                    destino: cat.destino || 'COZINHA',
                    ordem: i,
                    ativo: true,
                },
                update: { destino: cat.destino || 'COZINHA', ordem: i },
            });
            catMap[cat.nome] = criada.id;
            catCriadas++;
        } catch (e: any) {
            erros.push(`Categoria "${cat.nome}": ${e?.message || e}`);
        }
    }

    // Criar ou atualizar produtos (evita duplicatas por categoria + nome)
    for (let i = 0; i < (produtos || []).length; i++) {
        const p = produtos[i];
        const categoriaId = catMap[p.categoria];
        if (!categoriaId) {
            erros.push(`Produto "${p.nome}": categoria "${p.categoria}" não encontrada.`);
            continue;
        }
        try {
            const existente = await prisma.produto.findFirst({
                where: { categoriaId, nome: p.nome },
            });
            const dados = {
                codigo: p.codigo || (existente ? undefined : `IMP-${String(i + 1).padStart(4, '0')}`),
                descricao: truncar(p.descricao),
                preco: p.preco,
                precoPromocional: p.precoPromocional ?? null,
                destaque: p.destaque ?? false,
                ordem: i,
            };
            if (existente) {
                await prisma.produto.update({
                    where: { id: existente.id },
                    data: {
                        ...dados,
                        codigo: dados.codigo ?? existente.codigo,
                    },
                });
                prodAtualizados++;
            } else {
                await prisma.produto.create({
                    data: {
                        categoriaId,
                        nome: p.nome,
                        codigo: dados.codigo || `IMP-${String(i + 1).padStart(4, '0')}`,
                        descricao: dados.descricao,
                        preco: dados.preco,
                        precoPromocional: dados.precoPromocional,
                        disponivel: true,
                        destaque: dados.destaque,
                        ordem: dados.ordem,
                    },
                });
                prodCriados++;
            }
        } catch (e: any) {
            erros.push(`Produto "${p.nome}": ${e?.message || e}`);
        }
    }

    return res.json({
        sucesso: true,
        categoriasCriadas: catCriadas,
        produtosCriados: prodCriados,
        produtosAtualizados: prodAtualizados,
        erros,
    });
});

/**
 * GET /api/importar/template-csv
 * Retorna um CSV de exemplo para download
 */
export const downloadTemplateCsv = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const csv = [
        'categoria;nome;descricao;preco;preco_promocional;destaque',
        'Bebidas;Coca-Cola lata 350ml;Gelada;7,00;;nao',
        'Bebidas;Suco de laranja natural;Espremido na hora;10,00;;nao',
        'Pratos;Filé a parmegiana;Filé grelhado com molho e queijo;45,00;39,90;sim',
        'Pratos;Macarrão Carbonara;Massa artesanal ao molho cremoso;38,00;;nao',
        'Sobremesas;Temaki de Nutella;Cone com Nutella e morango;20,00;;sim',
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="template-importacao.csv"');
    res.send('\uFEFF' + csv); // BOM para UTF-8 no Excel
});
