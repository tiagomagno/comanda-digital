# ADR-001: Banco de Dados MySQL + Prisma ORM

**Status:** Aceito  
**Data:** 2025 (decisão original)  
**Revisado em:** 2026-06-30

---

## Contexto

O sistema Dine precisa de um banco de dados relacional para armazenar entidades multi-tenant (estabelecimentos, usuários, comandas, pedidos). A equipe precisa de produtividade alta com segurança nas migrations e tipagem no ORM.

---

## Decisão

Usar **MySQL 8** como banco de dados com **Prisma ORM** para acesso, migrations e geração de tipos TypeScript.

---

## Consequências

### Positivas
- Prisma gera tipos TypeScript automaticamente a partir do schema
- Migrations versionadas e reproduzíveis
- Prisma Client tem API fluente e type-safe
- MySQL é amplamente suportado em provedores de hospedagem (Railway, PlanetScale, etc.)
- Prisma Schema é fonte única de verdade para o modelo de dados

### Negativas
- Prisma não suporta queries 100% complexas — queries muito elaboradas requerem `$queryRaw`
- MySQL não tem suporte nativo a arrays (diferente de PostgreSQL) — arrays são armazenados como JSON
- Lock-in no Prisma para o ORM (difícil de substituir sem refatoração)

---

## Alternativas Consideradas

| Alternativa | Razão da Rejeição |
|------------|-------------------|
| PostgreSQL + Prisma | MySQL escolhido por familiaridade da equipe e maior disponibilidade em hosting local |
| TypeORM | Menos ergonômico, tipagem mais fraca que Prisma |
| Drizzle ORM | Relativamente novo, menor ecossistema em 2024 |
| MongoDB | Dados são relacionais — JOIN é necessário |

---

## Notas

O RESUMO_EXECUTIVO.md original menciona PostgreSQL — esta é uma inconsistência na documentação. O banco real em uso é MySQL conforme `schema.prisma` (`provider = "mysql"`).
