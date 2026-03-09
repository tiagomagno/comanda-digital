import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // 1. Criar Estabelecimento
    console.log('📍 Criando estabelecimento...');
    const estabelecimento = await prisma.estabelecimento.upsert({
        where: { id: 'estab-seed-001' },
        update: {},
        create: {
            id: 'estab-seed-001',
            nome: 'Bar do Zé',
            cnpj: '12.345.678/0001-90',
            telefone: '(11) 98765-4321',
            email: 'contato@bardoze.com.br',
            endereco: 'Rua das Flores, 123',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01234-567',
            ativo: true,
        },
    });
    console.log(`✅ Estabelecimento criado: ${estabelecimento.nome}\n`);

    // 2. Criar Usuários
    console.log('👤 Criando usuários...\n');

    // Admin
    const senhaHashAdmin = await bcrypt.hash('admin123', 10);
    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@bardoze.com.br' },
        update: {
            codigoAcesso: 'ADMIN2026',
        },
        create: {
            estabelecimentoId: estabelecimento.id,
            nome: 'Administrador',
            email: 'admin@bardoze.com.br',
            telefone: '(11) 98765-4321',
            senhaHash: senhaHashAdmin,
            codigoAcesso: 'ADMIN2026',
            tipo: 'admin',
            ativo: true,
        },
    });
    console.log(`✅ Admin: ${admin.email} | Código: ADMIN2026`);

    // Garçom
    const garcom = await prisma.usuario.upsert({
        where: { codigoAcesso: 'GARCOM01' },
        update: {},
        create: {
            estabelecimentoId: estabelecimento.id,
            nome: 'Carlos Silva',
            telefone: '(11) 98765-1111',
            codigoAcesso: 'GARCOM01',
            tipo: 'garcom',
            ativo: true,
        },
    });
    console.log(`✅ Garçom: ${garcom.nome} | Código: GARCOM01`);

    // Cozinha
    const cozinha = await prisma.usuario.upsert({
        where: { codigoAcesso: 'COZINHA01' },
        update: {},
        create: {
            estabelecimentoId: estabelecimento.id,
            nome: 'João Cozinheiro',
            telefone: '(11) 98765-2222',
            codigoAcesso: 'COZINHA01',
            tipo: 'cozinha',
            ativo: true,
        },
    });
    console.log(`✅ Cozinha: ${cozinha.nome} | Código: COZINHA01`);

    // Bar
    const bar = await prisma.usuario.upsert({
        where: { codigoAcesso: 'BAR01' },
        update: {},
        create: {
            estabelecimentoId: estabelecimento.id,
            nome: 'Pedro Barman',
            telefone: '(11) 98765-3333',
            codigoAcesso: 'BAR01',
            tipo: 'bar',
            ativo: true,
        },
    });
    console.log(`✅ Bar: ${bar.nome} | Código: BAR01\n`);

    // 3. Criar Categorias
    console.log('📂 Criando categorias...');

    const categoriaBebidas = await prisma.categoria.create({
        data: {
            estabelecimentoId: estabelecimento.id,
            nome: 'Bebidas',
            descricao: 'Cervejas, refrigerantes e sucos',
            destino: 'BAR',
            cor: '#9333EA',
            ordem: 1,
            ativo: true,
        },
    });

    const categoriaPorcoes = await prisma.categoria.create({
        data: {
            estabelecimentoId: estabelecimento.id,
            nome: 'Porções',
            descricao: 'Petiscos e porções para compartilhar',
            destino: 'COZINHA',
            cor: '#F97316',
            ordem: 2,
            ativo: true,
        },
    });

    const categoriaPratos = await prisma.categoria.create({
        data: {
            estabelecimentoId: estabelecimento.id,
            nome: 'Pratos Principais',
            descricao: 'Refeições completas',
            destino: 'COZINHA',
            cor: '#EF4444',
            ordem: 3,
            ativo: true,
        },
    });

    const categoriaSobremesas = await prisma.categoria.create({
        data: {
            estabelecimentoId: estabelecimento.id,
            nome: 'Sobremesas',
            descricao: 'Doces e sobremesas',
            destino: 'COZINHA',
            cor: '#EC4899',
            ordem: 4,
            ativo: true,
        },
    });

    console.log('✅ 4 categorias criadas\n');

    // 4. Criar Produtos - Bebidas
    console.log('🍺 Criando produtos de bebidas...');

    await prisma.produto.createMany({
        data: [
            {
                categoriaId: categoriaBebidas.id,
                codigo: 'BEB001',
                nome: 'Cerveja Heineken Long Neck',
                descricao: 'Cerveja premium holandesa 330ml',
                preco: 12.00,
                precoPromocional: 10.00,
                disponivel: true,
                destaque: true,
                ordem: 1,
            },
            {
                categoriaId: categoriaBebidas.id,
                codigo: 'BEB002',
                nome: 'Cerveja Brahma Duplo Malte',
                descricao: 'Cerveja brasileira 350ml',
                preco: 8.00,
                disponivel: true,
                ordem: 2,
            },
            {
                categoriaId: categoriaBebidas.id,
                codigo: 'BEB003',
                nome: 'Coca-Cola Lata',
                descricao: 'Refrigerante 350ml',
                preco: 6.00,
                disponivel: true,
                ordem: 3,
            },
            {
                categoriaId: categoriaBebidas.id,
                codigo: 'BEB004',
                nome: 'Suco de Laranja Natural',
                descricao: 'Suco natural 500ml',
                preco: 10.00,
                disponivel: true,
                ordem: 4,
            },
            {
                categoriaId: categoriaBebidas.id,
                codigo: 'BEB005',
                nome: 'Água Mineral',
                descricao: 'Água sem gás 500ml',
                preco: 4.00,
                disponivel: true,
                ordem: 5,
            },
        ],
    });

    // 5. Criar Produtos - Porções
    console.log('🍟 Criando produtos de porções...');

    await prisma.produto.createMany({
        data: [
            {
                categoriaId: categoriaPorcoes.id,
                codigo: 'POR001',
                nome: 'Porção de Batata Frita',
                descricao: 'Batatas fritas crocantes (500g)',
                preco: 25.00,
                precoPromocional: 20.00,
                disponivel: true,
                destaque: true,
                ordem: 1,
            },
            {
                categoriaId: categoriaPorcoes.id,
                codigo: 'POR002',
                nome: 'Porção de Frango à Passarinho',
                descricao: 'Frango frito temperado (600g)',
                preco: 35.00,
                disponivel: true,
                ordem: 2,
            },
            {
                categoriaId: categoriaPorcoes.id,
                codigo: 'POR003',
                nome: 'Porção de Calabresa Acebolada',
                descricao: 'Calabresa com cebola (400g)',
                preco: 30.00,
                disponivel: true,
                ordem: 3,
            },
            {
                categoriaId: categoriaPorcoes.id,
                codigo: 'POR004',
                nome: 'Porção de Mandioca Frita',
                descricao: 'Mandioca crocante (500g)',
                preco: 22.00,
                disponivel: true,
                ordem: 4,
            },
            {
                categoriaId: categoriaPorcoes.id,
                codigo: 'POR005',
                nome: 'Tábua de Frios',
                descricao: 'Queijos, salames e azeitonas',
                preco: 45.00,
                disponivel: true,
                ordem: 5,
            },
        ],
    });

    // 6. Criar Produtos - Pratos
    console.log('🍽️ Criando pratos principais...');

    await prisma.produto.createMany({
        data: [
            {
                categoriaId: categoriaPratos.id,
                codigo: 'PRA001',
                nome: 'Filé Mignon com Fritas',
                descricao: 'Filé mignon grelhado com batatas fritas e arroz',
                preco: 55.00,
                disponivel: true,
                destaque: true,
                ordem: 1,
            },
            {
                categoriaId: categoriaPratos.id,
                codigo: 'PRA002',
                nome: 'Picanha na Chapa',
                descricao: 'Picanha grelhada com vinagrete e farofa',
                preco: 65.00,
                disponivel: true,
                ordem: 2,
            },
            {
                categoriaId: categoriaPratos.id,
                codigo: 'PRA003',
                nome: 'Feijoada Completa',
                descricao: 'Feijoada tradicional com acompanhamentos',
                preco: 45.00,
                disponivel: true,
                ordem: 3,
            },
            {
                categoriaId: categoriaPratos.id,
                codigo: 'PRA004',
                nome: 'Parmegiana de Frango',
                descricao: 'Frango empanado com molho e queijo',
                preco: 40.00,
                disponivel: true,
                ordem: 4,
            },
        ],
    });

    // 7. Criar Produtos - Sobremesas
    console.log('🍰 Criando sobremesas...');

    await prisma.produto.createMany({
        data: [
            {
                categoriaId: categoriaSobremesas.id,
                codigo: 'SOB001',
                nome: 'Pudim de Leite',
                descricao: 'Pudim caseiro com calda de caramelo',
                preco: 12.00,
                disponivel: true,
                ordem: 1,
            },
            {
                categoriaId: categoriaSobremesas.id,
                codigo: 'SOB002',
                nome: 'Petit Gateau',
                descricao: 'Bolo de chocolate com sorvete',
                preco: 18.00,
                precoPromocional: 15.00,
                disponivel: true,
                destaque: true,
                ordem: 2,
            },
            {
                categoriaId: categoriaSobremesas.id,
                codigo: 'SOB003',
                nome: 'Sorvete (2 bolas)',
                descricao: 'Escolha o sabor',
                preco: 10.00,
                disponivel: true,
                ordem: 3,
            },
        ],
    });

    console.log('✅ 17 produtos criados\n');

    // Resumo
    console.log('📊 RESUMO DO SEED:');
    console.log('==================');
    console.log(`✅ 1 Estabelecimento: ${estabelecimento.nome}`);
    console.log(`✅ 1 Admin: ${admin.email} (senha: admin123)`);
    console.log(`✅ 4 Categorias`);
    console.log(`✅ 17 Produtos`);
    console.log('\n🎉 Seed concluído com sucesso!\n');

    console.log('🔑 CREDENCIAIS DE ACESSO:');
    console.log('========================');
    console.log(`Email: ${admin.email}`);
    console.log(`Senha: admin123`);
    console.log(`Estabelecimento ID: ${estabelecimento.id}`);
    console.log('\n');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao executar seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
