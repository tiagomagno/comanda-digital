# Auditoria de Documentação Existente

> Gerado em: 2026-06-30

---

## Inventário e Classificação

| Arquivo | Classificação | Problemas Identificados |
|---------|--------------|------------------------|
| CHECKLIST.md | **Desatualizado** | Checklist de desenvolvimento que provavelmente reflete estado inicial do MVP |
| ESTRUTURA.md | **Incompleto** | Estrutura de pastas; não reflete adições recentes (delivery, CRM, SaaS) |
| HISTORIAS_USUARIO.md | **Incompleto** | Cobre o core inicial mas não cobre módulos SaaS, delivery, entregador, CRM, omnichannel |
| INDICE.md | **Desatualizado** | Índice de docs; não aponta para os novos arquivos criados |
| INICIO_RAPIDO.md | **Incompleto** | Guia de setup; pode não ter as variáveis de ambiente completas ou os comandos atuais |
| MODELO_CONCEITUAL.md | **Conflitante** | Menciona PostgreSQL mas o sistema usa MySQL; modelo de dados está desatualizado em relação ao schema Prisma atual |
| PLANEJAMENTO_TECNICO.md | **Desatualizado** | Documento de planejamento inicial; não reflete estado real do sistema com 30+ controllers |
| PLANO_TATICO_90_DIAS_BRANDING_BILLING.md | **Correto** | Documento estratégico com planos, sprints e arquitetura de pricing — ainda relevante e correto |
| RESUMO_EXECUTIVO.md | **Conflitante** | Menciona PostgreSQL como banco (real: MySQL); roadmap reflete planejamento inicial, não estado atual |

---

## Análise Detalhada

### CHECKLIST.md
- **Status:** Desatualizado
- **Problema:** Checklist de desenvolvimento criado no início do projeto. Provavelmente checado parcialmente. Não reflete o estado atual do sistema que possui 30+ módulos.
- **Ação recomendada:** Migrar para `docs/development/` como histórico; substituir por roadmap atual.

### ESTRUTURA.md
- **Status:** Incompleto
- **Problema:** Descreve estrutura inicial do projeto. Não cobre novos módulos adicionados (SaaS billing, delivery, CRM, omnichannel, automações, cupons, expedição).
- **Ação recomendada:** Substituído pelo `docs/audit/project-audit.md` e `docs/backend/architecture.md`.

### HISTORIAS_USUARIO.md
- **Status:** Incompleto
- **Problema:** 19 user stories cobrindo fluxo básico (cliente, garçom, cozinha, admin). Não inclui: delivery, entregador, CRM, automações, assinaturas, superadmin, omnichannel.
- **Ação recomendada:** Migrar para `docs/product/user-stories.md` e expandir com módulos atuais.

### INDICE.md
- **Status:** Desatualizado
- **Problema:** Aponta apenas para os 5-6 arquivos originais. Não reflete a nova estrutura de documentação.
- **Ação recomendada:** Atualizar após conclusão da documentação refatorada.

### INICIO_RAPIDO.md
- **Status:** Incompleto / Potencialmente desatualizado
- **Problema:** Guia de setup inicial. Pode não incluir variáveis de ambiente do Stripe ou configurações atuais.
- **Ação recomendada:** Migrar e expandir para `docs/development/setup.md`.

### MODELO_CONCEITUAL.md
- **Status:** Conflitante
- **Problema Principal:** Menciona PostgreSQL como banco de dados. O sistema real usa **MySQL**. O modelo entidade-relacionamento pode estar desatualizado em relação ao schema Prisma (que tem 30+ models).
- **Ação recomendada:** Substituir pelo `docs/database/er-model.md` gerado diretamente do schema.prisma.

### PLANEJAMENTO_TECNICO.md
- **Status:** Desatualizado
- **Problema:** Documento de planejamento técnico inicial (fase de ideação). Não reflete a arquitetura real implementada com Socket.io, múltiplos módulos, SaaS billing, BYOG.
- **Ação recomendada:** Migrar para `docs/development/` como referência histórica. Substituir pela documentação real de arquitetura.

### PLANO_TATICO_90_DIAS_BRANDING_BILLING.md
- **Status:** Correto e Relevante
- **Conteúdo:** Planos Start/Growth/Scale com entitlements, sprints de desenvolvimento, BYOG, modelo de assinaturas.
- **Ação recomendada:** Migrar para `docs/business/` e referenciar em `docs/business/plans.md` e `docs/business/billing.md`.

### RESUMO_EXECUTIVO.md
- **Status:** Conflitante
- **Problemas:**
  1. Menciona PostgreSQL (real: MySQL)
  2. Roadmap de 12 semanas é o planejamento inicial, não o estado atual
  3. Não menciona delivery, CRM, SaaS, omnichannel que já existem
- **Ação recomendada:** Migrar para `docs/product/` como documento histórico. Criar novo resumo executivo atualizado.

---

## Matriz de Decisão

| Arquivo Original | Destino | Ação |
|----------------|---------|------|
| CHECKLIST.md | docs/development/checklist-historico.md | Mover + nota |
| ESTRUTURA.md | docs/audit/ | Mover como histórico |
| HISTORIAS_USUARIO.md | docs/product/user-stories.md | Mover + expandir |
| INDICE.md | docs/INDICE.md | Atualizar |
| INICIO_RAPIDO.md | docs/development/setup.md | Mover + expandir |
| MODELO_CONCEITUAL.md | docs/database/ | Mover como histórico + criar versão corrigida |
| PLANEJAMENTO_TECNICO.md | docs/development/ | Mover como histórico |
| PLANO_TATICO_90_DIAS_BRANDING_BILLING.md | docs/business/ | Mover |
| RESUMO_EXECUTIVO.md | docs/product/ | Mover + criar versão atualizada |

---

## Lacunas de Documentação (Ausências Críticas)

| Área | Status |
|------|--------|
| Diagrama ER completo (do schema atual) | Ausente |
| Documentação de API com endpoints | Ausente |
| Fluxos de entrega (delivery) | Ausente |
| Arquitetura SaaS / billing | Ausente |
| Documentação de autenticação JWT | Ausente |
| Socket.io eventos e salas | Ausente |
| ADRs (decisões arquiteturais) | Ausente |
| Guia de contribuição/desenvolvimento | Ausente |
| Documentação de módulos por papel (garçom, cozinha, etc.) | Ausente |
| Prompts de IA para desenvolvimento | Ausente |
