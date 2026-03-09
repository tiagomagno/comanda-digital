import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "mysql://root:@127.0.0.1:3306/crm-comanda",
        },
    },
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('💥 NUKING DATABASE...');
    try {
        // Need to connect to 'mysql' system db or just no DB to drop the main one?
        // Prisma connects to the DB specified in URL. If it doesn't exist, it might fail to connect.
        // Let's rely on db push.
        // Actually, if I can't connect, I can't drop.

        // This is a Catch-22 if the DB is corrupted.
        // But let's try dropping tables.
        console.log('Trying to drop tables...');
        // await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`crm-comanda\`;`); 
        // Cannot drop the DB we are connected to usually.

        console.log('Skipping manual drop, running setup...');

    } catch (e) {
        console.error('❌ ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
