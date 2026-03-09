/**
 * Correção: transferir categorias/produtos e dados de kizan@sushi.com
 * para contato@kizansushi.com.br e eliminar kizan@sushi.com
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const EMAIL_ORIGEM = 'kizan@sushi.com';
  const EMAIL_DESTINO = 'contato@kizansushi.com.br';

  const userOrigem = await prisma.usuario.findUnique({
    where: { email: EMAIL_ORIGEM },
    include: { estabelecimento: true },
  });
  const userDestino = await prisma.usuario.findUnique({
    where: { email: EMAIL_DESTINO },
    include: { estabelecimento: true },
  });

  if (!userOrigem?.estabelecimentoId || !userDestino?.estabelecimentoId) {
    throw new Error('Usuários ou estabelecimentos não encontrados');
  }

  const estabOrigemId = userOrigem.estabelecimentoId;
  const estabDestinoId = userDestino.estabelecimentoId;

  console.log('\n=== Transferência Kizan ===');
  console.log('Origem (a remover):', EMAIL_ORIGEM, '-> estab', estabOrigemId);
  console.log('Destino (correto):', EMAIL_DESTINO, '-> estab', estabDestinoId);

  await prisma.$transaction(async (tx) => {
    const catCount = await tx.categoria.updateMany({
      where: { estabelecimentoId: estabOrigemId },
      data: { estabelecimentoId: estabDestinoId },
    });
    console.log('Categorias transferidas:', catCount.count);

    const mesaCount = await tx.mesa.updateMany({
      where: { estabelecimentoId: estabOrigemId },
      data: { estabelecimentoId: estabDestinoId },
    });
    console.log('Mesas transferidas:', mesaCount.count);

    const grupoCount = await tx.grupoMesa.updateMany({
      where: { estabelecimentoId: estabOrigemId },
      data: { estabelecimentoId: estabDestinoId },
    });
    console.log('Grupos de mesa transferidos:', grupoCount.count);

    const comandaCount = await tx.comanda.updateMany({
      where: { estabelecimentoId: estabOrigemId },
      data: { estabelecimentoId: estabDestinoId },
    });
    console.log('Comandas transferidas:', comandaCount.count);

    const estabOrigem = await tx.estabelecimento.findUnique({
      where: { id: estabOrigemId },
    });
    if (estabOrigem) {
      const estabDestino = await tx.estabelecimento.findUnique({
        where: { id: estabDestinoId },
      });
      if (estabDestino) {
        const updates: Record<string, unknown> = {};
        if (!estabDestino.telefone && estabOrigem.telefone) updates.telefone = estabOrigem.telefone;
        if (!estabDestino.endereco && estabOrigem.endereco) updates.endereco = estabOrigem.endereco;
        if (!estabDestino.cidade && estabOrigem.cidade) updates.cidade = estabOrigem.cidade;
        if (!estabDestino.estado && estabOrigem.estado) updates.estado = estabOrigem.estado;
        if (!estabDestino.cep && estabOrigem.cep) updates.cep = estabOrigem.cep;
        if (Object.keys(updates).length > 0) {
          await tx.estabelecimento.update({
            where: { id: estabDestinoId },
            data: updates,
          });
          console.log('Dados de perfil do estabelecimento copiados:', Object.keys(updates));
        }
      }
    }

    await tx.usuario.delete({ where: { email: EMAIL_ORIGEM } });
    console.log('Usuário', EMAIL_ORIGEM, 'removido');

    const restante = await tx.categoria.count({ where: { estabelecimentoId: estabOrigemId } });
    if (restante === 0) {
      await tx.estabelecimento.delete({ where: { id: estabOrigemId } });
      console.log('Estabelecimento vazio removido');
    }
  });

  console.log('\n=== Concluído ===\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
