import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Testing connection...');
    console.log('DB URL:', process.env.DATABASE_URL);
    const count = await prisma.estabelecimento.count();
    console.log(`Estabelecimentos count: ${count}`);

    // Try to find one
    const first = await prisma.estabelecimento.findFirst();
    console.log('First:', first);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
