# Documentação — Dine

> Índice mestre da documentação técnica e de produto | Atualizado: 2026-06-30

---

## Início Rápido

| Documento | Descrição |
|-----------|-----------|
| [Setup](development/setup.md) | Como rodar o projeto localmente |
| [Arquitetura](ARCHITECTURE_DOCUMENTATION.md) | Visão geral da arquitetura do sistema |
| [API Overview](api/overview.md) | Como usar a API REST |
| [ER Model](database/er-model.md) | Diagrama entidade-relacionamento |

---

## Auditoria

| Documento | Descrição |
|-----------|-----------|
| [Auditoria do Projeto](audit/project-audit.md) | Mapeamento completo do codebase |
| [Auditoria de Documentação](audit/documentation-audit.md) | Classificação dos docs existentes |
| [Melhorias Identificadas](audit/improvements.md) | Bugs e melhorias sem impacto na produção |

---

## Negócio

| Documento | Descrição |
|-----------|-----------|
| [Planos e Entitlements](business/plans.md) | Start / Growth / Scale |
| [Billing e Assinaturas](business/billing.md) | Stripe, BYOG, ciclo de vida |
| [Monetização](business/monetization.md) | Modelo de receita |
| [Roadmap Comercial](business/roadmap-comercial.md) | Sprints e backlog SaaS |

---

## Backend

| Documento | Descrição |
|-----------|-----------|
| [Arquitetura](backend/architecture.md) | Express, Prisma, Socket.io |
| [Autenticação](backend/auth.md) | JWT, papéis, fluxos |
| [Rotas](backend/routes.md) | Mapa completo de todos os endpoints |
| [Middlewares](backend/middlewares.md) | auth, role, validate, error |

---

## Frontend

| Documento | Descrição |
|-----------|-----------|
| [Arquitetura](frontend/architecture.md) | Next.js App Router, rotas, componentes |

---

## Banco de Dados

| Documento | Descrição |
|-----------|-----------|
| [Modelo ER](database/er-model.md) | Diagrama completo com Mermaid |
| [Migrations](database/migrations.md) | Comandos e boas práticas |
| [Convenções](database/conventions.md) | Padrões de nomenclatura e schema |

---

## API

| Documento | Descrição |
|-----------|-----------|
| [Overview](api/overview.md) | Base URL, auth, formato de resposta |

---

## Módulos

| Módulo | Documento |
|--------|-----------|
| Comanda | [comanda.md](modules/comanda.md) |
| Pedido | [pedido.md](modules/pedido.md) |
| Delivery | [delivery.md](modules/delivery.md) |
| Garçom | [garcom.md](modules/garcom.md) |
| Caixa | [caixa.md](modules/caixa.md) |
| KDS (Cozinha/Bar) | [kds.md](modules/kds.md) |
| Cardápio | [cardapio.md](modules/cardapio.md) |
| Cliente / CRM | [crm.md](modules/crm.md), [cliente.md](modules/cliente.md) |
| Cupons | [cupons.md](modules/cupons.md) |
| Automações | [automacoes.md](modules/automacoes.md) |
| Omnichannel | [omnichannel.md](modules/omnichannel.md) |
| Dashboard | [dashboard.md](modules/dashboard.md) |
| Expedição | [expedicao.md](modules/expedicao.md) |
| Recepção | [recepcao.md](modules/recepcao.md) |
| Assinaturas | [assinaturas.md](modules/assinaturas.md) |
| Usuários | [usuarios.md](modules/usuarios.md) |
| Relatórios | [relatorios.md](modules/relatorios.md) |
| Configurações | [configuracoes.md](modules/configuracoes.md) |
| Super Admin | [superadmin.md](modules/superadmin.md) |

---

## Decisões Arquiteturais (ADRs)

| ADR | Decisão |
|-----|---------|
| [ADR-001](adr/ADR-001-database-mysql-prisma.md) | MySQL + Prisma ORM |
| [ADR-002](adr/ADR-002-auth-jwt.md) | Autenticação JWT |
| [ADR-003](adr/ADR-003-frontend-nextjs.md) | Frontend Next.js App Router |
| [ADR-004](adr/ADR-004-realtime-socketio.md) | Realtime Socket.io |
| [ADR-005](adr/ADR-005-saas-billing-model.md) | Billing SaaS com Stripe |
| [ADR-006](adr/ADR-006-byog-payment-gateway.md) | BYOG Payment Gateway |

---

## Desenvolvimento

| Documento | Descrição |
|-----------|-----------|
| [Setup](development/setup.md) | Ambiente de desenvolvimento |
| [Convenções](development/conventions.md) | Commits, branches, padrões |

---

## Prompts de IA

| Prompt | Uso |
|--------|-----|
| [backend-feature.md](prompts/backend-feature.md) | Implementar feature no backend |
| [frontend-component.md](prompts/frontend-component.md) | Criar tela ou componente |
| [bug-fix.md](prompts/bug-fix.md) | Corrigir bug |
| [api-endpoint.md](prompts/api-endpoint.md) | Criar endpoint de API |
| [database-migration.md](prompts/database-migration.md) | Criar migration |
| [code-review.md](prompts/code-review.md) | Revisão de código |
| [refactor.md](prompts/refactor.md) | Refatoração controlada |

---

## Documentos Legados (Histórico)

Os documentos abaixo são de versões anteriores e mantidos como referência histórica:

| Arquivo | Status |
|---------|--------|
| RESUMO_EXECUTIVO.md | Desatualizado — usa PostgreSQL (real: MySQL) |
| PLANEJAMENTO_TECNICO.md | Planejamento inicial — não reflete estado atual |
| MODELO_CONCEITUAL.md | Conflitante — ver er-model.md |
| HISTORIAS_USUARIO.md | Parcial — ver documentação de módulos |
| PLANO_TATICO_90_DIAS_BRANDING_BILLING.md | Correto — ver business/ |
| CHECKLIST.md | Histórico de desenvolvimento inicial |
