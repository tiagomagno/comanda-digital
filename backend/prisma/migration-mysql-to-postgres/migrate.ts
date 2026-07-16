/**
 * Migração de dados MySQL -> PostgreSQL.
 *
 * Lê todos os models do banco MySQL de origem (MYSQL_SOURCE_URL) e grava no
 * banco PostgreSQL de destino (DATABASE_URL, client principal do projeto).
 * Roda com as checagens de FK do Postgres desativadas durante a carga
 * (session_replication_role = replica), então a ordem dos models não
 * precisa respeitar dependências — mas mantém a ordem do schema por
 * legibilidade.
 *
 * Uso: npx tsx prisma/migration-mysql-to-postgres/migrate.ts
 */
import { PrismaClient as MysqlClient } from '../../node_modules/.prisma/client-mysql-source/index.js';
import { PrismaClient as PgClient } from '@prisma/client';

const mysql = new MysqlClient();
const pg = new PgClient();

const MODELS = [
    'estabelecimento',
    'cupom',
    'usuario',
    'mesa',
    'grupoMesa',
    'mesaGrupo',
    'categoria',
    'produto',
    'adicionalGrupo',
    'adicional',
    'pedidoItemAdicional',
    'comanda',
    'pedido',
    'pedidoItem',
    'historicoStatusPedido',
    'cliente',
    'enderecoCliente',
    'plano',
    'assinatura',
    'credencialGateway',
    'preCadastroLead',
    'corrida',
    'localizacaoEntregador',
    'transacao',
    'pagamentoParcial',
    'avaliacao',
    'canalExterno',
    'pedidoExterno',
    'regraAutomacao',
    'execucaoAutomacao',
    'filaEspera',
    'reserva',
] as const;

async function main() {
    console.log('Iniciando migracao de dados MySQL -> PostgreSQL...\n');

    await pg.$executeRawUnsafe('SET session_replication_role = replica;');

    const resultados: { model: string; origem: number; destino: number }[] = [];

    try {
        for (const model of MODELS) {
            const source = (mysql as any)[model];
            const target = (pg as any)[model];

            const rows = await source.findMany();
            if (rows.length > 0) {
                await target.createMany({ data: rows, skipDuplicates: true });
            }
            const destino = await target.count();
            resultados.push({ model, origem: rows.length, destino });

            const flag = rows.length !== destino ? '  <-- DIVERGENTE' : '';
            console.log(`${model.padEnd(24)} origem=${String(rows.length).padStart(6)}  destino=${String(destino).padStart(6)}${flag}`);
        }
    } finally {
        await pg.$executeRawUnsafe('SET session_replication_role = origin;');
    }

    const divergentes = resultados.filter((r) => r.origem !== r.destino);
    console.log('\n' + '='.repeat(60));
    if (divergentes.length === 0) {
        console.log('OK: todas as contagens batem entre origem e destino.');
    } else {
        console.log(`ATENCAO: ${divergentes.length} model(s) com contagem divergente:`);
        divergentes.forEach((d) => console.log(`  - ${d.model}: origem=${d.origem} destino=${d.destino}`));
        process.exitCode = 1;
    }
}

main()
    .catch((e) => {
        console.error('Erro na migracao:', e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mysql.$disconnect();
        await pg.$disconnect();
    });
