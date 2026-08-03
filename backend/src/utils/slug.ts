import prisma from '../config/database.js';

export function slugify(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+|-+$)/g, '');
}

export async function gerarSlugUnico(nome: string): Promise<string> {
    const base = slugify(nome) || 'loja';
    let slug = base;
    let contador = 1;

    while (await prisma.estabelecimento.findUnique({ where: { slug } })) {
        contador += 1;
        slug = `${base}-${contador}`;
    }

    return slug;
}
