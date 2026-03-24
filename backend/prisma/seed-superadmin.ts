/**
 * Script para criar o primeiro usuário superadmin na plataforma
 * Execute: npx ts-node prisma/seed-superadmin.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@comanda.digital';
    const senha = 'SuperAdmin@2025!';
    const nome = 'Super Admin';

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
        console.log('✅ Superadmin já existe:', existente.email);
        return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
        data: {
            nome,
            email,
            senhaHash,
            tipo: 'superadmin',
            ativo: true,
            estabelecimentoId: null,
        },
    });

    console.log('✅ Superadmin criado com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Email:', usuario.email);
    console.log('  Senha:', senha);
    console.log('  ID:   ', usuario.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Altere a senha após o primeiro login!');
}

main()
    .catch((e) => {
        console.error('❌ Erro:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
