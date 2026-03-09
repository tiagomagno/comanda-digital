import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const estabs = await prisma.estabelecimento.findMany();
    for (const e of estabs) {
        console.log('---');
        console.log('Nome:', e.nome);
        console.log('CNPJ:', e.cnpj);
        console.log('CEP:', e.cep);
        console.log('Cidade:', e.cidade);
        console.log('Estado:', e.estado);
        console.log('Telefone:', e.telefone);
        console.log('Configuracoes:', JSON.stringify(e.configuracoes));
    }
}

main().finally(() => prisma.$disconnect());
