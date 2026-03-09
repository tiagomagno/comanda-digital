import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

// Force IPv4
process.env.DATABASE_URL = 'mysql://root@127.0.0.1:3306/crm-comanda';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing connection (Node.js)...');
    try {
        const count = await prisma.estabelecimento.count();
        console.log(`Estabelecimentos count: ${count}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
