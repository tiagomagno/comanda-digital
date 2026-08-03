# Migrations — Dine

> 2026-06-30

---

## Ferramentas

- **Prisma Migrate** para versionamento e execução de migrations
- Migrations geradas automaticamente a partir do `schema.prisma`

---

## Comandos

```bash
# Criar e aplicar nova migration (desenvolvimento)
cd backend && npx prisma migrate dev --name nome_da_migration

# Aplicar migrations pendentes (produção)
cd backend && npx prisma migrate deploy

# Resetar banco (DESTRUTIVO — apenas dev)
cd backend && npx prisma migrate reset

# Ver status das migrations
cd backend && npx prisma migrate status

# Regenerar cliente após mudança no schema
cd backend && npx prisma generate
```

Ou via scripts npm:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## Localização das Migrations

```
backend/prisma/migrations/
├── {timestamp}_nome_da_migration/
│   └── migration.sql
└── migration_lock.toml
```

---

## Boas Práticas

1. **Nunca editar** uma migration já aplicada em produção
2. **Sempre revisar** o SQL gerado antes de aplicar em produção
3. **Migrations destrutivas** (DROP COLUMN, DROP TABLE) requerem aprovação e backup prévio
4. **Retrocompatibilidade:** adicionar colunas com default ou nullable primeiro, migrar dados, depois adicionar NOT NULL
5. **Seeds** são separados das migrations — `prisma/seed.ts`

---

## Entidades por Fase de Desenvolvimento

### Fase MVP Core
- Estabelecimento, Usuario, Mesa, Categoria, Produto
- Comanda, Pedido, PedidoItem

### Fase 1 — SaaS + Delivery
- Plano, Assinatura, CredencialGateway
- Cliente, EnderecoCliente, Corrida, LocalizacaoEntregador
- Transacao, PagamentoParcial, Avaliacao
- Cupom

### Fase 2 — Módulos Avançados
- CanalExterno, PedidoExterno (Omnichannel)
- RegraAutomacao, ExecucaoAutomacao
- FilaEspera, Reserva
- GrupoMesa, MesaGrupo
- AdicionalGrupo, Adicional, PedidoItemAdicional
- PreCadastroLead
- HistoricoStatusPedido
