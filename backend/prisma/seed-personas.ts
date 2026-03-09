import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const SENHA_PADRAO = '123456';

async function main() {
    console.log('🌱 Iniciando seed COMPLETO de Personas...\n');
    const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);

    // Limpar banco (opcional, mas bom garanitr ids limpos se possível, ou usar upsert)
    // await prisma.pedido.deleteMany();
    // await prisma.comanda.deleteMany();
    // await prisma.produto.deleteMany();
    // await prisma.categoria.deleteMany();
    // await prisma.usuario.deleteMany();
    // await prisma.mesa.deleteMany();
    // await prisma.estabelecimento.deleteMany();
    // Melhor não deletar tudo se for produção, mas aqui é dev.

    // ==========================================
    // PERSONA 1: Carlos Almeida (Bar)
    // ==========================================
    console.log('📍 Criando PERSONA 1: Carlos (Bar)...');

    const estabCarlos = await prisma.estabelecimento.create({
        data: {
            nome: 'Bar do Carlos',
            cnpj: '11.111.111/0001-11',
            ativo: true,
            usuarios: {
                create: [
                    { nome: 'Carlos (Gestor)', email: 'carlos@bar.com', senhaHash, tipo: 'admin', codigoAcesso: '1000' },
                    { nome: 'Garçom João', tipo: 'garcom', codigoAcesso: '1001' },
                    { nome: 'Barman Zé', tipo: 'bar', codigoAcesso: '1002' },
                    { nome: 'Cozinheira Ana', tipo: 'cozinha', codigoAcesso: '1003' }, // O bar tem petiscos
                    { nome: 'Caixa Maria', tipo: 'admin', codigoAcesso: '1004' } // Admin/Caixa
                ]
            }
        },
    });

    const catBebidas1 = await prisma.categoria.create({
        data: { estabelecimentoId: estabCarlos.id, nome: 'Bebidas', destino: 'BAR', cor: '#EF4444' }
    });
    const catPetiscos1 = await prisma.categoria.create({
        data: { estabelecimentoId: estabCarlos.id, nome: 'Petiscos', destino: 'COZINHA', cor: '#F59E0B' }
    });

    await prisma.produto.createMany({
        data: [
            { categoriaId: catBebidas1.id, nome: 'Cerveja IPA', preco: 18.00 },
            { categoriaId: catBebidas1.id, nome: 'Caipirinha', preco: 22.00 },
            { categoriaId: catPetiscos1.id, nome: 'Fritas', preco: 25.00 },
        ]
    });

    // Mesas
    await prisma.mesa.createMany({
        data: Array.from({ length: 10 }).map((_, i) => ({
            estabelecimentoId: estabCarlos.id,
            numero: String(i + 1),
            capacidade: 4,
            qrCodeUrl: `http://localhost:3000/cliente/mesa/${estabCarlos.id}/${i + 1}` // Fake url for testing
        }))
    });


    // ==========================================
    // PERSONA 2: Mariana Lopes (Restaurante)
    // ==========================================
    console.log('📍 Criando PERSONA 2: Mariana (Restaurante)...');

    const estabMariana = await prisma.estabelecimento.create({
        data: {
            nome: 'Sabor & Prosa',
            cnpj: '22.222.222/0001-22',
            ativo: true,
            usuarios: {
                create: [
                    { nome: 'Mariana (Gestor)', email: 'mariana@rest.com', senhaHash, tipo: 'admin', codigoAcesso: '2000' },
                    { nome: 'Garçom Pedro', tipo: 'garcom', codigoAcesso: '2001' },
                    { nome: 'Chef Lucas', tipo: 'cozinha', codigoAcesso: '2002' },
                    { nome: 'Barman Leo', tipo: 'bar', codigoAcesso: '2003' },
                ]
            }
        },
    });

    // Mesas
    await prisma.mesa.createMany({
        data: Array.from({ length: 15 }).map((_, i) => ({
            estabelecimentoId: estabMariana.id,
            numero: String(i + 1),
            capacidade: 4
        }))
    });


    // ==========================================
    // PERSONA 3: Ricardo (Híbrido)
    // ==========================================
    console.log('📍 Criando PERSONA 3: Ricardo (Híbrido)...');

    const estabRicardo = await prisma.estabelecimento.create({
        data: {
            nome: 'Mix Gastrobar',
            cnpj: '33.333.333/0001-33',
            ativo: true,
            usuarios: {
                create: [
                    { nome: 'Ricardo (Gestor)', email: 'ricardo@mix.com', senhaHash, tipo: 'admin', codigoAcesso: '3000' },
                    { nome: 'Garçom Tiago', tipo: 'garcom', codigoAcesso: '3001' },
                    // Mais staff...
                ]
            }
        },
    });

    console.log('🏁 SEED CONCLUÍDO!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
