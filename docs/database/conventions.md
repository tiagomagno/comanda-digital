# Convenções de Banco de Dados — Dine

> 2026-06-30

---

## Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Tabelas | snake_case, plural | `estabelecimentos`, `pedido_itens` |
| Colunas | snake_case | `estabelecimento_id`, `created_at` |
| PKs | `id` UUID | `id String @id @default(uuid())` |
| FKs | `{entidade}_id` | `estabelecimento_id` |
| Timestamps | `created_at`, `updated_at` | automáticos via Prisma |
| Maps | `@map("snake_case")` | mapeado do camelCase TypeScript |

---

## Padrões do Schema Prisma

```prisma
model ExemploModel {
  id                String   @id @default(uuid())
  estabelecimentoId String   @map("estabelecimento_id")
  nome              String
  ativo             Boolean  @default(true)
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  estabelecimento Estabelecimento @relation(...)

  @@map("exemplos")
}
```

---

## Índices

Todos os campos FK têm `@@index` correspondente. Campos de filtro frequente também:

```prisma
@@index([estabelecimentoId])
@@index([status])
@@index([createdAt])
```

---

## Soft Delete

Atualmente **não implementado** na maioria das entidades. Entidades com `ativo` (Boolean) permitem desativação lógica mas não soft delete completo.

**Recomendação:** Avaliar `deletedAt DateTime?` em entidades críticas.

---

## Multi-Tenant

Todas as entidades operacionais têm `estabelecimentoId` como chave de isolamento de tenant.

**Regra:** Toda query deve filtrar por `estabelecimentoId` do usuário autenticado — nunca retornar dados de outro estabelecimento.

---

## Decimais

Campos monetários usam `Decimal` com precisão `@db.Decimal(10, 2)`:
```prisma
preco   Decimal  @db.Decimal(10, 2)
```

Campos geográficos (GPS) usam `@db.Decimal(10, 7)` para precisão de metros.
