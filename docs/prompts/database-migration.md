# Prompt: Criar Migration de Banco de Dados

> 2026-06-30

---

## Template

```
Você está criando uma migration de banco de dados para o sistema Dine.

## Contexto
- ORM: Prisma com MySQL 8
- Schema: backend/prisma/schema.prisma
- Convenções: snake_case nas tabelas, uuid PKs, timestamps created_at/updated_at
- Multi-tenant: toda entidade operacional tem estabelecimentoId

## Mudança necessária
[DESCREVER: o que precisa ser adicionado/alterado/removido no schema]

## Impacto esperado
[DESCREVER: quais controllers/services precisam ser atualizados]

## Checklist
- [ ] Mudança é retrocompatível? (adições são ok, remoções precisam de plano)
- [ ] Campos novos têm valor default ou são nullable?
- [ ] Índices necessários foram adicionados?
- [ ] Relations foram configuradas corretamente (onDelete)?
- [ ] @@map() com snake_case foi adicionado?

## Entregáveis
1. Diff do schema.prisma
2. Comando: `npx prisma migrate dev --name nome_descritivo`
3. Se destrutiva: plano de migração de dados
```
