import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * reset-db.ts
 * Limpa toda a base de dados e recria apenas o usuário administrador padrão.
 * Uso: npx tsx prisma/reset-db.ts
 */

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Iniciando limpeza total da base de dados...\n');

    // A ordem importa por causa das foreign keys
    await prisma.historicoStatusPedido.deleteMany();
    console.log('✅ Histórico de status apagado');

    await prisma.pedidoItem.deleteMany();
    console.log('✅ Itens de pedido apagados');

    await prisma.pedido.deleteMany();
    console.log('✅ Pedidos apagados');

    await prisma.comanda.deleteMany();
    console.log('✅ Comandas apagadas');

    await prisma.mesaGrupo.deleteMany();
    console.log('✅ Relações mesa-grupo apagadas');

    await prisma.grupoMesa.deleteMany();
    console.log('✅ Grupos de mesa apagados');

    await prisma.mesa.deleteMany();
    console.log('✅ Mesas apagadas');

    await prisma.produto.deleteMany();
    console.log('✅ Produtos apagados');

    await prisma.categoria.deleteMany();
    console.log('✅ Categorias apagadas');

    await prisma.usuario.deleteMany();
    console.log('✅ Usuários apagados');

    await prisma.estabelecimento.deleteMany();
    console.log('✅ Estabelecimentos apagados');

    console.log('\n🌱 Recriando usuário administrador padrão...\n');

    // Recriar apenas o admin padrão (sem estabelecimento vinculado)
    const senhaHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.usuario.create({
        data: {
            nome: 'Administrador',
            email: 'admin@comanda.com',
            senhaHash,
            tipo: 'admin',
            ativo: true,
        },
    });

    console.log('🎉 Base resetada com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 CREDENCIAIS DO ADMIN:');
    console.log(`   E-mail : ${admin.email}`);
    console.log(`   Senha  : admin123`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao resetar banco:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
