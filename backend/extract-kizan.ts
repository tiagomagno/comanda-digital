import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function run() {
    try {
        console.log('Buscando Kizan local...');
        const estabs = await prisma.estabelecimento.findMany({
            where: { nome: { contains: 'kizan' } },
            include: {
                categorias: {
                    include: { produtos: true }
                }
            }
        });

        if (estabs.length === 0) {
            console.log("Kizan não encontrado nos estabelecimentos.");
            return;
        }

        const data = estabs[0].categorias || [];
        fs.writeFileSync('kizan-data.json', JSON.stringify(data, null, 2), 'utf-8');
        console.log('Salvo em kizan-data.json', data.length, 'categorias');
    } catch(e) {
        console.error(e);
    }
}

run().finally(() => prisma.$disconnect());
