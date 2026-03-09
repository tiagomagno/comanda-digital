import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function adicionarMesas() {
    console.log('🪑 Adicionando mesas ao estabelecimento...\n');

    const estabelecimento = await prisma.estabelecimento.findFirst();

    if (!estabelecimento) {
        console.error('❌ Nenhum estabelecimento encontrado. Execute o seed principal primeiro.');
        return;
    }

    for (let i = 1; i <= 15; i++) {
        const mesaExistente = await prisma.mesa.findFirst({
            where: {
                estabelecimentoId: estabelecimento.id,
                numero: `${i}`,
            },
        });

        if (!mesaExistente) {
            const qrCodeUrl = `http://localhost:3000/comanda/mesa/${i}`;

            await prisma.mesa.create({
                data: {
                    estabelecimentoId: estabelecimento.id,
                    numero: `${i}`,
                    capacidade: i <= 5 ? 2 : i <= 10 ? 4 : 6,
                    qrCodeUrl,
                    ativo: true,
                },
            });
            console.log(`✅ Mesa ${i} criada`);
        } else {
            console.log(`ℹ️  Mesa ${i} já existe`);
        }
    }

    console.log('\n🎉 Mesas adicionadas com sucesso!\n');
}

adicionarMesas()
    .catch((e) => {
        console.error('❌ Erro ao adicionar mesas:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
