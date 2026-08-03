import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+|-+$)/g, '');
}

async function gerarSlugUnico(nome: string): Promise<string> {
    const base = slugify(nome) || 'loja';
    let slug = base;
    let contador = 1;

    while (await prisma.estabelecimento.findUnique({ where: { slug } })) {
        contador += 1;
        slug = `${base}-${contador}`;
    }

    return slug;
}

async function main() {
    const estabelecimentos = await prisma.estabelecimento.findMany({
        where: { slug: null },
        select: { id: true, nome: true },
    });

    console.log(`Encontrados ${estabelecimentos.length} estabelecimento(s) sem slug.`);

    for (const est of estabelecimentos) {
        const slug = await gerarSlugUnico(est.nome);
        await prisma.estabelecimento.update({ where: { id: est.id }, data: { slug } });
        console.log(`  ${est.nome} -> ${slug}`);
    }

    console.log('Backfill concluído.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
