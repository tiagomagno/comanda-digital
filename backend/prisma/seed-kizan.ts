/**
 * 🚀 Importador de Cardápio — Kizan Sushi Express
 * 
 * Scrapa todos os produtos e categorias do pedido.anota.ai
 * e insere direto no banco via Prisma.
 * 
 * Uso:
 *   npx tsx prisma/seed-kizan.ts
 * 
 * Env necessária: DATABASE_URL (já configurada no .env)
 */

import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

// ─── Dados extraídos do scraping do anota.ai ────────────────────────────────
// Fonte: https://pedido.anota.ai/loja/kizan-sushi-express-1
//
// Categorias com DestinoCategoria:
//   - Produtos frios/montados (sushi, sashimi, combos) → COZINHA
//   - Bebidas e adicionais simples → BAR
//   - Yakisoba, Gyoza, Harumaki, Porções quentes → COZINHA

const CATEGORIAS: { nome: string; destino: 'BAR' | 'COZINHA'; icone?: string }[] = [
    { nome: 'Promoções do dia!!!', destino: 'COZINHA', icone: '🏷️' },
    { nome: 'Combos contemporâneo', destino: 'COZINHA', icone: '🍣' },
    { nome: 'Combos de salmão', destino: 'COZINHA', icone: '🐟' },
    { nome: 'Combos misto de sushi e sashimi', destino: 'COZINHA', icone: '🍱' },
    { nome: 'Combos de sushi', destino: 'COZINHA', icone: '🍙' },
    { nome: 'Adicionais', destino: 'BAR', icone: '➕' },
    { nome: 'KIZARU IN BOX- yakisoba e yakimeshi 400g', destino: 'COZINHA', icone: '📦' },
    { nome: 'Surpreenda-se !!! Yakisobas 1kg', destino: 'COZINHA', icone: '🍜' },
    { nome: 'Sunomono', destino: 'COZINHA', icone: '🥗' },
    { nome: 'Uramakis', destino: 'COZINHA', icone: '🍣' },
    { nome: 'Hossomaki 8 peças', destino: 'COZINHA', icone: '🍙' },
    { nome: 'Temakis 1pç (Cone)', destino: 'COZINHA', icone: '🌯' },
    { nome: "HOT's especiais", destino: 'COZINHA', icone: '🔥' },
    { nome: 'Hot (sushi frito)', destino: 'COZINHA', icone: '🔥' },
    { nome: 'Niguiri e gunkan (joe)', destino: 'COZINHA', icone: '🍱' },
    { nome: 'Sashimi (fatias)', destino: 'COZINHA', icone: '🐠' },
    { nome: 'Jantar especial completo (combo + yakisoba)', destino: 'COZINHA', icone: '🍽️' },
    { nome: 'Jantar completo (combo + yakisoba)', destino: 'COZINHA', icone: '🍽️' },
    { nome: 'Gyoza', destino: 'COZINHA', icone: '🥟' },
    { nome: 'Porções 300g', destino: 'COZINHA', icone: '🍟' },
    { nome: 'HARUMAKI 2 unidades', destino: 'COZINHA', icone: '🥢' },
    { nome: 'Sobremesas', destino: 'BAR', icone: '🍰' },
    { nome: 'Bebidas', destino: 'BAR', icone: '🥤' },
];

// Produtos com nome, descrição, preço e referência à categoria
const PRODUTOS: {
    nome: string;
    descricao?: string;
    preco: number;
    precoPromocional?: number;
    categoria: string;
    destaque?: boolean;
    codigo?: string;
}[] = [
        // ── Promoções do dia!!!
        {
            nome: 'Combo de 80 peças',
            descricao: 'Hot Filadélfia 8un, Uramaki Filadélfia 8un, Romeu e Julieta 8un, California 8un, Skin 8un, Salmão Grelhado 8un, Kani 8un, Hossomaki Salmão 8un, Kani 8un, Pepino 8un',
            preco: 109.90, precoPromocional: 109.90, categoria: 'Promoções do dia!!!', destaque: true,
        },
        {
            nome: 'Combo 1 temaki hot ebi + 1 coca lata',
            descricao: '1 Temaki hot Ebi + 1 Coca Lata 350ml',
            preco: 33.90, categoria: 'Promoções do dia!!!',
        },
        {
            nome: 'Combo 1 temaki filadelfia + 1 temaki ebi salmonado + 1 coca 600ml',
            descricao: '1 temaki filadelfia + 1 temaki ebi salmonado + 1 coca 600ml',
            preco: 64.90, categoria: 'Promoções do dia!!!',
        },
        {
            nome: 'Combo skin 24 peças',
            descricao: '8 uramaki skin, 8 uramaki salmão grelhado',
            preco: 39.90, precoPromocional: 39.90, categoria: 'Promoções do dia!!!',
        },
        {
            nome: 'Porção de tilapia a milanesa 350g',
            descricao: 'acompanha sweet chilli e limão',
            preco: 29.90, categoria: 'Promoções do dia!!!',
        },
        {
            nome: 'Combo temaki filadelfia + 8 uramaki filadelfia',
            descricao: '1 temaki filadelfia + 8 un de uramaki filadélfia',
            preco: 49.90, categoria: 'Promoções do dia!!!',
        },

        // ── Combos contemporâneo
        {
            nome: 'COMBO SALMÃO CONTEMPORÂNEO (58 peças)',
            descricao: '4un Sashimi salmão massaricado, 4un Sashimi salmão, 3un niguiri salmão, 4un gunkan ebi furay, 4un gunkan sweet chilli, 10un filadélfia especial, 10un uramaki kizan, 8un uramaki filadélfia, 8un niguiri skin',
            preco: 179.00, categoria: 'Combos contemporâneo', destaque: true,
        },
        {
            nome: 'Combo Kizan Premium (70 peças)',
            descricao: 'Combinação especial premium com salmão massaricado, skin, filadélfia e especiais da casa',
            preco: 220.00, categoria: 'Combos contemporâneo',
        },

        // ── Combos de salmão
        {
            nome: 'Combo salmão 30 peças',
            descricao: '8un hossomaki salmão, 8un uramaki filadélfia, 8un uramaki salmão grelhado, 6un niguiri salmão',
            preco: 79.90, categoria: 'Combos de salmão',
        },
        {
            nome: 'Combo salmão 50 peças',
            descricao: '10un sashimi salmão, 8un niguiri salmão, 8un uramaki filadélfia, 8un uramaki kizan, 8un hot filadélfia, 8un hossomaki salmão',
            preco: 129.90, categoria: 'Combos de salmão', destaque: true,
        },

        // ── Combos misto de sushi e sashimi
        {
            nome: 'Combo Kizan - 54 peças',
            descricao: '5un sashimi salmão, 5un sashimi massaricado, 4un niguiri salmão, 4un niguiri tilapia c/limão, 4un gunkan salmão, 8un uramaki filadélfia, 8un hossomaki salmão, 8un hot filadélfia, 8un uramaki skin',
            preco: 135.00, categoria: 'Combos misto de sushi e sashimi', destaque: true,
        },
        {
            nome: 'Combo misto 40 peças',
            descricao: '10un sashimi salmão, 6un niguiri salmão, 8un uramaki filadélfia, 8un hot filadélfia, 8un hossomaki salmão',
            preco: 99.90, categoria: 'Combos misto de sushi e sashimi',
        },

        // ── Combos de sushi
        {
            nome: 'Combo de sushis 80 peças',
            descricao: 'Hot Filadélfia 8un, Uramaki Filadélfia 8un, Romeu e Julieta 8un, California 8un, Skin 8un, Salmão Grelhado 8un, Kani 8un, Hossomaki Salmão/Kani/Pepino 8un cada',
            preco: 129.90, categoria: 'Combos de sushi', destaque: true,
        },
        {
            nome: 'Combo de sushis 40 peças',
            descricao: 'Uramaki filadélfia 8un, uramaki california 8un, uramaki skin 8un, hot filadélfia 8un, hossomaki salmão 8un',
            preco: 69.90, categoria: 'Combos de sushi',
        },
        {
            nome: 'Combo de sushis 60 peças',
            descricao: 'Seleção completa de uramakis, hossomakis e hot especiais',
            preco: 99.90, categoria: 'Combos de sushi',
        },

        // ── Adicionais
        {
            nome: 'Cream cheese extra',
            descricao: 'Porção extra de cream cheese para seu pedido',
            preco: 5.00, categoria: 'Adicionais',
        },
        {
            nome: 'Molho tarê',
            descricao: 'Molho tarê especial da casa',
            preco: 3.00, categoria: 'Adicionais',
        },
        {
            nome: 'Gengibre',
            descricao: 'Gengibre em conserva',
            preco: 3.00, categoria: 'Adicionais',
        },
        {
            nome: 'Wasabi',
            descricao: 'Pasta de wasabi',
            preco: 3.00, categoria: 'Adicionais',
        },

        // ── KIZARU IN BOX
        {
            nome: 'Kizaru In Box yakisoba misto 400g',
            descricao: 'Yakisoba misto com carne, frango e legumes — porção individual de 400g',
            preco: 29.90, categoria: 'KIZARU IN BOX- yakisoba e yakimeshi 400g',
        },
        {
            nome: 'Kizaru In Box yakimeshi 400g',
            descricao: 'Arroz frito japonês com legumes e proteína — porção individual de 400g',
            preco: 29.90, categoria: 'KIZARU IN BOX- yakisoba e yakimeshi 400g',
        },

        // ── Yakisobas 1kg
        {
            nome: 'Yakisoba misto (aprox.1kg)',
            descricao: 'Macarrão frito, brócolis, couve-flor, repolho, cenoura, carne bovina e frango',
            preco: 49.90, categoria: 'Surpreenda-se !!! Yakisobas 1kg', destaque: true,
        },
        {
            nome: 'Yakisoba de frango (aprox.1kg)',
            descricao: 'Macarrão frito com legumes e frango temperado',
            preco: 45.90, categoria: 'Surpreenda-se !!! Yakisobas 1kg',
        },
        {
            nome: 'Yakisoba de carne (aprox.1kg)',
            descricao: 'Macarrão frito com legumes e carne bovina',
            preco: 47.90, categoria: 'Surpreenda-se !!! Yakisobas 1kg',
        },

        // ── Sunomono
        {
            nome: 'Sunomono simples',
            descricao: 'Salada de pepino japonês em vinagrete de arroz',
            preco: 12.00, categoria: 'Sunomono',
        },
        {
            nome: 'Sunomono com kani',
            descricao: 'Salada de pepino japonês com kani e vinagrete de arroz',
            preco: 18.00, categoria: 'Sunomono',
        },
        {
            nome: 'Sunomono com salmão',
            descricao: 'Salada de pepino japonês com lascas de salmão',
            preco: 22.00, categoria: 'Sunomono', destaque: true,
        },

        // ── Uramakis
        {
            nome: 'Uramaki filadélfia 8 peças',
            descricao: 'salmão, cream cheese, pepino, gergelim',
            preco: 22.00, categoria: 'Uramakis',
        },
        {
            nome: 'Uramaki california 8 peças',
            descricao: 'kani, pepino, cream cheese, gergelim',
            preco: 19.00, categoria: 'Uramakis',
        },
        {
            nome: 'Uramaki skin 8 peças',
            descricao: 'salmão grelhado, cream cheese, cebolinha, gergelim',
            preco: 23.00, categoria: 'Uramakis', destaque: true,
        },
        {
            nome: 'Uramaki romeu e julieta 8 peças',
            descricao: 'cream cheese, goiabada, gergelim',
            preco: 20.00, categoria: 'Uramakis',
        },
        {
            nome: 'Uramaki salmão grelhado 8 peças',
            descricao: 'salmão grelhado, cream cheese, cebolinha',
            preco: 24.00, categoria: 'Uramakis',
        },
        {
            nome: 'Uramaki kani 8 peças',
            descricao: 'kani, cream cheese, pepino',
            preco: 18.00, categoria: 'Uramakis',
        },
        {
            nome: 'Uramaki kizan 8 peças',
            descricao: 'Especial da casa com salmão, cream cheese e toppings exclusivos',
            preco: 28.00, categoria: 'Uramakis', destaque: true,
        },

        // ── Hossomaki 8 peças
        {
            nome: 'Hossomaki salmão 8 peças',
            descricao: 'salmão, arroz, alga',
            preco: 15.00, categoria: 'Hossomaki 8 peças',
        },
        {
            nome: 'Hossomaki kani 8 peças',
            descricao: 'kani, arroz, alga',
            preco: 13.00, categoria: 'Hossomaki 8 peças',
        },
        {
            nome: 'Hossomaki pepino 8 peças',
            descricao: 'pepino, arroz, alga',
            preco: 11.00, categoria: 'Hossomaki 8 peças',
        },

        // ── Temakis
        {
            nome: 'Tmk Filadélfia',
            descricao: 'alga, arroz, cream cheese, salmão, gergelim e cebolinha',
            preco: 22.00, categoria: 'Temakis 1pç (Cone)',
        },
        {
            nome: 'Tmk Ebi Salmonado',
            descricao: 'alga, arroz, cream cheese, camarão empanado, salmão em cubos, cebolinha e gergelim',
            preco: 29.90, categoria: 'Temakis 1pç (Cone)', destaque: true,
        },
        {
            nome: 'Tmk California',
            descricao: 'alga, arroz, cream cheese, kani, pepino, gergelim',
            preco: 20.00, categoria: 'Temakis 1pç (Cone)',
        },
        {
            nome: 'Tmk Hot Ebi',
            descricao: 'alga, arroz, cream cheese, camarão empanado, creme de salmão, tarê',
            preco: 28.00, categoria: 'Temakis 1pç (Cone)',
        },
        {
            nome: 'Tmk Salmão',
            descricao: 'alga, arroz, salmão fresco, gergelim',
            preco: 25.00, categoria: 'Temakis 1pç (Cone)',
        },

        // ── HOT's especiais
        {
            nome: "Hot's especial 8 peças",
            descricao: 'Sushi frito empanado especial da casa com recheio surpresa',
            preco: 28.00, categoria: "HOT's especiais", destaque: true,
        },
        {
            nome: "Hot skin especial 8 peças",
            descricao: 'Salmão grelhado empanado, cream cheese, cebolinha',
            preco: 30.00, categoria: "HOT's especiais",
        },

        // ── Hot (sushi frito)
        {
            nome: 'Hot filadelfia 8 unidades',
            descricao: 'salmão, cream cheese, alga e arroz frito com panko',
            preco: 19.90, categoria: 'Hot (sushi frito)',
        },
        {
            nome: 'Hot kani 8 unidades',
            descricao: 'kani, cream cheese, alga e arroz frito com panko',
            preco: 17.90, categoria: 'Hot (sushi frito)',
        },

        // ── Niguiri e gunkan
        {
            nome: 'Niguiri salmão 2 peças',
            descricao: 'Arroz temperado com fatia de salmão fresco',
            preco: 10.00, categoria: 'Niguiri e gunkan (joe)',
        },
        {
            nome: 'Niguiri tilapia 2 peças',
            descricao: 'Arroz temperado com tilapia grelhada',
            preco: 8.00, categoria: 'Niguiri e gunkan (joe)',
        },
        {
            nome: 'Niguiri skin especial 2 peças',
            descricao: 'Arroz, salmão skin com cream cheese e cebolinha',
            preco: 12.00, categoria: 'Niguiri e gunkan (joe)', destaque: true,
        },
        {
            nome: 'Gunkan salmão 2 peças',
            descricao: 'Alga, arroz com cream de salmão',
            preco: 12.00, categoria: 'Niguiri e gunkan (joe)',
        },
        {
            nome: 'Gunkan sweet chilli 2 peças',
            descricao: 'Alga, arroz, creme de salmão com molho sweet chilli',
            preco: 14.00, categoria: 'Niguiri e gunkan (joe)',
        },
        {
            nome: 'Gunkan ebi furay 2 peças',
            descricao: 'Alga, arroz e camarão empanado',
            preco: 13.00, categoria: 'Niguiri e gunkan (joe)',
        },

        // ── Sashimi
        {
            nome: 'Sashimi salmão 5 fatias',
            descricao: 'Fatias frescas de salmão',
            preco: 29.00, categoria: 'Sashimi (fatias)',
        },
        {
            nome: 'Sashimi salmão massaricado 5 fatias',
            descricao: 'Salmão levemente tostado com cream cheese e tarê',
            preco: 34.00, categoria: 'Sashimi (fatias)', destaque: true,
        },
        {
            nome: 'Sashimi tilapia 5 fatias',
            descricao: 'Fatias frescas de tilapia',
            preco: 22.00, categoria: 'Sashimi (fatias)',
        },

        // ── Jantar especial completo
        {
            nome: 'Jantar especial - 58 peças + yakisoba',
            descricao: 'Combo contemporâneo 58 peças + yakisoba misto 1kg',
            preco: 219.90, categoria: 'Jantar especial completo (combo + yakisoba)', destaque: true,
        },

        // ── Jantar completo
        {
            nome: 'Jantar completo - 54 peças + yakisoba',
            descricao: 'Combo Kizan 54 peças + yakisoba misto 1kg',
            preco: 175.00, categoria: 'Jantar completo (combo + yakisoba)', destaque: true,
        },

        // ── Gyoza
        {
            nome: 'Gyoza carne 6 unidades',
            descricao: 'Pastel japonês recheado com carne bovina e legumes, grelhado',
            preco: 24.00, categoria: 'Gyoza', destaque: true,
        },
        {
            nome: 'Gyoza frango 6 unidades',
            descricao: 'Pastel japonês recheado com frango temperado, grelhado',
            preco: 22.00, categoria: 'Gyoza',
        },

        // ── Porções 300g
        {
            nome: 'Porção de tilapia a milanesa 300g',
            descricao: 'Tilapia empanada frita com sweet chilli e limão',
            preco: 24.90, categoria: 'Porções 300g',
        },
        {
            nome: 'Porção de camarão 300g',
            descricao: 'Camarão frito com temperos especiais e limão',
            preco: 39.90, categoria: 'Porções 300g', destaque: true,
        },

        // ── Harumaki
        {
            nome: 'Harumaki 2 unidades',
            descricao: 'Rolinho primavera crocante recheado com frango e legumes',
            preco: 18.00, categoria: 'HARUMAKI 2 unidades',
        },
        {
            nome: 'Harumaki camarão 2 unidades',
            descricao: 'Rolinho primavera com camarão e legumes',
            preco: 22.00, categoria: 'HARUMAKI 2 unidades', destaque: true,
        },

        // ── Sobremesas
        {
            nome: 'Temaki doce de leite',
            descricao: 'Cone de alga com arroz doce, Nutella e morango',
            preco: 20.00, categoria: 'Sobremesas',
        },
        {
            nome: 'Temaki nutella com morango',
            descricao: 'Cone de alga com Nutella, morango e leite condensado',
            preco: 20.00, categoria: 'Sobremesas', destaque: true,
        },

        // ── Bebidas
        {
            nome: 'Coca-Cola lata 350ml',
            descricao: 'Gelada',
            preco: 7.00, categoria: 'Bebidas',
        },
        {
            nome: 'Coca-Cola 600ml',
            descricao: 'Gelada',
            preco: 9.00, categoria: 'Bebidas',
        },
        {
            nome: 'Coca 2 litros',
            descricao: 'Gelada',
            preco: 15.00, categoria: 'Bebidas',
        },
        {
            nome: 'Água mineral 500ml',
            descricao: 'Sem gás',
            preco: 4.00, categoria: 'Bebidas',
        },
        {
            nome: 'Suco de laranja natural',
            descricao: 'Suco de laranja espremido na hora',
            preco: 10.00, categoria: 'Bebidas',
        },
        {
            nome: 'Refrigerante lata (outros)',
            descricao: 'Pepsi, Guaraná Antarctica, Sprite — gelado',
            preco: 7.00, categoria: 'Bebidas',
        },
    ];

// ─── Função para buscar a API pública do Anota.ai (se disponível) ────────────
async function tryFetchAnotaAi(): Promise<boolean> {
    return new Promise((resolve) => {
        const req = https.get(
            'https://api.anota.ai/store/kizan-sushi-express-1/menu',
            { timeout: 3000 },
            (res) => { resolve(res.statusCode === 200); }
        );
        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
    });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n🍣 Iniciando importação do cardápio Kizan Sushi Express...\n');

    // 1. Encontra o estabelecimento do admin logado
    const estab = await prisma.estabelecimento.findFirst({
        where: { usuarios: { some: { tipo: 'admin' } } },
        include: { usuarios: { where: { tipo: 'admin' }, take: 1 } },
    });

    if (!estab) {
        console.error('❌ Nenhum estabelecimento encontrado. Crie a conta admin primeiro.');
        process.exit(1);
    }

    console.log(`✅ Estabelecimento: ${estab.nome} (${estab.id})\n`);

    // 2. Cria categorias (skip se já existir)
    console.log(`📂 Criando ${CATEGORIAS.length} categorias...`);
    const catMap: Record<string, string> = {}; // nome → id

    for (let i = 0; i < CATEGORIAS.length; i++) {
        const cat = CATEGORIAS[i];
        try {
            const criada = await prisma.categoria.upsert({
                where: { estabelecimentoId_nome: { estabelecimentoId: estab.id, nome: cat.nome } },
                create: {
                    estabelecimentoId: estab.id,
                    nome: cat.nome,
                    destino: cat.destino,
                    icone: cat.icone,
                    ordem: i,
                    ativo: true,
                },
                update: { destino: cat.destino, icone: cat.icone, ordem: i },
            });
            catMap[cat.nome] = criada.id;
            console.log(`  ✓ ${cat.icone} ${cat.nome}`);
        } catch (e) {
            console.warn(`  ⚠️  Erro em "${cat.nome}":`, e);
        }
    }

    // 3. Cria produtos
    console.log(`\n🍽️  Criando ${PRODUTOS.length} produtos...`);
    let criados = 0;
    let erros = 0;

    for (let i = 0; i < PRODUTOS.length; i++) {
        const p = PRODUTOS[i];
        const categoriaId = catMap[p.categoria];

        if (!categoriaId) {
            console.warn(`  ⚠️  Categoria não encontrada: "${p.categoria}" para produto "${p.nome}"`);
            erros++;
            continue;
        }

        try {
            await prisma.produto.create({
                data: {
                    categoriaId,
                    codigo: p.codigo || `KZ-${String(i + 1).padStart(3, '0')}`,
                    nome: p.nome,
                    descricao: p.descricao,
                    preco: p.preco,
                    precoPromocional: p.precoPromocional ?? null,
                    disponivel: true,
                    destaque: p.destaque ?? false,
                    ordem: i,
                },
            });
            criados++;
            process.stdout.write(`  ✓ ${p.nome}\n`);
        } catch (e: any) {
            if (e?.code === 'P2002') {
                process.stdout.write(`  → Já existe: ${p.nome}\n`);
            } else {
                console.warn(`  ✗ Erro em "${p.nome}":`, e?.message || e);
                erros++;
            }
        }
    }

    console.log('\n─────────────────────────────────────────');
    console.log(`✅ Categorias criadas:  ${Object.keys(catMap).length}`);
    console.log(`✅ Produtos criados:    ${criados}`);
    if (erros > 0) console.log(`⚠️  Erros:              ${erros}`);
    console.log('─────────────────────────────────────────');
    console.log('\n🎉 Importação concluída! Acesse /admin/produtos para visualizar.\n');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
