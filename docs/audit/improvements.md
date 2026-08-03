# Relatório de Melhorias — Dine

> Auditoria de código sem alterações | 2026-06-30

---

## Legenda de Prioridade

| Prioridade | Significado |
|-----------|-------------|
| **Crítico** | Risco de segurança ou perda de dados |
| **Alto** | Impacta estabilidade ou operação |
| **Médio** | Melhora qualidade, não causa falha imediata |
| **Baixo** | Otimização ou limpeza de código |

---

## Segurança

| # | Prioridade | Problema | Arquivo | Recomendação |
|---|-----------|---------|---------|-------------|
| S1 | **Crítico** | Credenciais de gateway (`secretKey`) armazenadas em texto plano no banco | `schema.prisma` — CredencialGateway | Criptografar com AES-256 antes de persistir; criar utilitário `encrypt/decrypt` |
| S2 | **Crítico** | Endpoint `POST /api/seed-personas` existe em produção (apenas bloqueado por env check) | `routes/index.ts` | Remover o endpoint ou mover para script npm separado |
| S3 | **Alto** | Sem rate limiting no endpoint de login | `auth.routes.ts` | Implementar `express-rate-limit` no POST /auth/login |
| S4 | **Alto** | JWT sem mecanismo de revogação (logout não invalida token) | `auth.middleware.ts` | Implementar blacklist em Redis ou incrementar `tokenVersion` no usuário |
| S5 | **Alto** | Rotas de comanda (`/api/comandas`) públicas sem nenhuma autenticação | `comanda.routes.ts` | Avaliar se acesso público é intencional; ao menos adicionar rate limit |
| S6 | **Médio** | Webhook de canais externos (`/api/omnichannel/webhook/:canalId`) sem validação de IP de origem | `omnichannel.routes.ts` | Adicionar validação de `webhookSecret` e/ou IP allowlist por canal |
| S7 | **Médio** | `CORS_ORIGIN` aceita `*` quando configurado como wildcard | `app.ts` | Restringir a origens específicas em produção; nunca usar `*` com `credentials: true` |

---

## Performance

| # | Prioridade | Problema | Arquivo | Recomendação |
|---|-----------|---------|---------|-------------|
| P1 | **Alto** | Sem paginação aparente em rotas de listagem (ex: `/api/crm/clientes`) | múltiplos controllers | Implementar paginação cursor-based ou offset/limit |
| P2 | **Alto** | Sem cache — cada request ao cardápio público bate no banco | `cardapio.routes.ts` | Adicionar cache de 5-10min para cardápio público (Redis ou in-memory) |
| P3 | **Médio** | `LocalizacaoEntregador` sem limpeza — tabela pode crescer indefinidamente | `schema.prisma` | Adicionar job de limpeza ou TTL strategy para localizações antigas |
| P4 | **Médio** | Falta de índices em queries de alto volume (ex: pedidos por status + estabelecimento) | `schema.prisma` | Adicionar índice composto `[estabelecimentoId, status]` em Pedido |
| P5 | **Baixo** | Socket.io sem Redis adapter — não escala horizontalmente | `app.ts` | Adicionar `@socket.io/redis-adapter` para multi-instância |

---

## Arquitetura

| # | Prioridade | Problema | Arquivo | Recomendação |
|---|-----------|---------|---------|-------------|
| A1 | **Alto** | Sem validação de entitlements por plano — qualquer admin pode usar todos os recursos | Falta em todos os controllers | Implementar middleware de entitlement antes de operações com limite por plano |
| A2 | **Alto** | `automacoes/processar` é chamada manual — sem job scheduler | `automacao.routes.ts` | Implementar scheduler (node-cron ou BullMQ) para processar automações periodicamente |
| A3 | **Médio** | Campo `comanda.mesa` (String) deprecated mas ainda existe | `schema.prisma` | Criar migration para remover o campo após confirmar que nenhum código o usa |
| A4 | **Médio** | Testes automatizados insuficientes — apenas `simple.test.ts` | `__tests__/` | Adicionar testes de integração para fluxos críticos (comanda → pedido → KDS) |
| A5 | **Médio** | Sem documentação OpenAPI/Swagger gerada automaticamente | — | Considerar `zod-to-openapi` para gerar spec da API automaticamente |
| A6 | **Baixo** | `routes/index.ts` mistura lógica de routing com seed code inline | `routes/index.ts` | Separar seed em arquivo `scripts/seed-personas.ts` |

---

## UX / Naming

| # | Prioridade | Problema | Arquivo | Recomendação |
|---|-----------|---------|---------|-------------|
| U1 | **Médio** | Frontend tem `cadastro/page-completo.backup.tsx` — arquivo de backup commitado | `frontend/app/cadastro/` | Remover arquivo de backup do repositório |
| U2 | **Médio** | Mensagens de erro do backend podem expor detalhes internos em desenvolvimento | `error.middleware.ts` | Garantir que em produção apenas mensagem genérica é retornada para erros 500 |
| U3 | **Baixo** | Nomenclatura inconsistente — some routes use `garcom` others `gestor` vs `admin` | vários arquivos | Padronizar: `gestor` para admin, manter consistência |

---

## Duplicação / Redundância

| # | Prioridade | Problema | Arquivo | Recomendação |
|---|-----------|---------|---------|-------------|
| D1 | **Médio** | `garcomMiddleware` e `preparoMiddleware` em auth.middleware.ts duplicam lógica de `requireGarcom` e `requireCozinha` em role.middleware.ts | `auth.middleware.ts`, `role.middleware.ts` | Unificar em um único arquivo `role.middleware.ts` |
| D2 | **Baixo** | RESUMO_EXECUTIVO.md menciona PostgreSQL, mas banco real é MySQL | `docs/` | Corrigir documentação (feito nesta refatoração) |

---

## Banco de Dados

| # | Prioridade | Problema | Arquivo | Recomendação |
|---|-----------|---------|---------|-------------|
| DB1 | **Alto** | Sem soft delete na maioria das entidades — deletes são permanentes | `schema.prisma` | Avaliar adicionar `deletedAt` em entidades críticas (Produto, Comanda, Usuario) |
| DB2 | **Médio** | `PreCadastroLead` não tem vínculo com `Assinatura` depois da conversão | `schema.prisma` | Adicionar FK ou campo para rastrear conversão lead → estabelecimento |
| DB3 | **Baixo** | Falta constraint de `CHECK` no banco para valores numéricos (ex: nota avaliação entre 1-5) | `schema.prisma` | Adicionar validação tanto no schema Zod quanto considerar constraints DB |
