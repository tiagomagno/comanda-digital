# Plano Tatico 90 Dias - Branding, Financeiro e Assinaturas

## Objetivo do ciclo

Consolidar a plataforma para escala SaaS em 90 dias, com foco em:

- branding consistente em toda a experiencia;
- modulo financeiro interno do gestor (vinculo bancario e repasses);
- assinaturas recorrentes para uso da plataforma;
- base de seguranca, governanca e observabilidade para crescimento.

## Frentes de trabalho

### Frente A - Branding e UX

- definir estrategia de marca, tom de voz e arquitetura de marca;
- padronizar design tokens (cores, tipografia, espacamentos, estados);
- aplicar design system nas telas core (login, dashboard, produtos, configuracoes);
- reduzir debitos de UX (feedbacks, consistencia de navegacao e formularios).

### Frente B - Transacional (BYOG)

- integração "Bring Your Own Gateway" (Mercado Pago, Pagar.me);
- tela para o lojista configurar suas credenciais/tokens de recebimento;
- checkout do cliente final enviando fundos direto ao restaurante;
- blindagem fiscal e isenção de gestão de chargebacks na plataforma.

### Frente C - Assinaturas SaaS

- planos, limites e regras de entitlements;
- trial, cobranca recorrente, dunning e bloqueio gradual;
- portal do gestor para plano/faturamento;
- dashboard superadmin com visao de assinaturas e inadimplencia.

### Base transversal - Seguranca e Operacao

- hardening de auth e rotas sensiveis;
- auditoria de eventos financeiros;
- observabilidade de cobranca, erro de pagamento e churn;
- runbook de suporte (fatura, estorno, suspensao, reativacao).

## Roadmap em 6 sprints (12 semanas)

### Sprint 1 (Semanas 1-2) - Definicoes

- fechar arquitetura de marca e guidelines;
- definir modelo comercial (planos, trial, grace period);
- escolher gateway de cobranca com criterios tecnicos e custo;
- definir modelo de dados para billing e financeiro interno;
- criar backlog final com criterios de aceite.

**Entregaveis**

- documento de decisoes (produto + tecnico);
- backlog priorizado por sprint;
- checklist de pronto para cada frente.

### Sprint 2 (Semanas 3-4) - Fundacao tecnica

- implementar entidades base:
  - plans, subscriptions, invoices, payments (Stripe/Banco Inter);
  - tenant_gateway_credentials (para BYOG);
- implementar camada de entitlements por plano;
- incluir auditoria minima de eventos sensiveis;
- aplicar hardening inicial (rate limit e controles de acesso).

**Entregaveis**

- migrations e APIs internas de billing/financeiro;
- ambientes de homologacao preparados.

### Sprint 3 (Semanas 5-6) - Branding aplicado + onboarding comercial

- aplicar design system nas telas core;
- criar area "Plano e Faturamento" no painel do gestor;
- **Onboarding Comercial (Product-Led Growth com Trial):**
  - Registro de conta direto da Landing Page recebendo plano escolhido;
  - Criação rápida de Tenant/User sem exigir cartão (Auto-login);
  - Setup automático da assinatura (ex: Trial de 7 dias com status `trialing`);
- **Paywall e Captura de Pagamento:**
  - Alerta regressivo no dashboard nos últimos dias de teste;
  - Fluxo modal seguro para inserção do Cartão/Pix obrigatório ao fim do Trial;
  - Possibilidade de troca de plano antes de efetivar o pagamento.

**Entregaveis**

- experiencia padronizada nas areas mais usadas;
- jornada fluida de "Teste Grátis" implementada;
- captura de metodo de pagamento funcional (Stripe/Pagar.me/etc).

### Sprint 4 (Semanas 7-8) - Cobranca recorrente

- integrar webhooks de cobranca (sucesso, falha, renovacao, cancelamento);
- implementar maquina de estados da assinatura:
  - trialing, active, past_due, grace_period, suspended, canceled;
- implementar dunning basico (retentativas e notificacoes);
- aplicar bloqueio gradual por inadimplencia.

**Entregaveis**

- cobranca recorrente funcionando em homologacao;
- estados de assinatura atualizados automaticamente.

### Sprint 5 (Semanas 9-10) - Transacional BYOG (Lojista)

- desenvolver tela de configurações de API (MercadoPago/Pagar.me);
- adaptar checkout do cliente final para utilizar credenciais dinâmicas do lojista;
- mapear webhooks de pagamentos para atualizar status do pedido (Salão/Delivery);
- blindagem de segurança nas chaves de API dos clientes.

**Entregaveis**

- Vendas do restaurante sendo processadas direto para a conta dele;
- Risco fiscal e operacional de chargebacks transferido para o lojista.

### Sprint 6 (Semanas 11-12) - Go-live controlado

- rodar piloto com grupo reduzido de clientes;
- monitorar funil, cobranca, inadimplencia e suporte;
- ajustar UX/erros e pontos de atrito;
- formalizar runbook de operacao e suporte.

**Entregaveis**

- entrada em producao gradual;
- metricas de negocio e rotina operacional validadas.

## Backlog priorizado

### P0 (obrigatorio)

- assinatura recorrente na plataforma (Stripe + Pix Inter);
- entitlements por plano (Features travadas);
- onboarding "Trial" completo;
- cadastro das chaves do Gateway pelo Restaurante (BYOG).

### P1 (escala)

- dunning avancado (réguas de cobrança automatizadas);
- upgrade/downgrade com prorata no painel;
- integração nativa com mais gateways de lojistas;
- dashboard financeiro de assinaturas no superadmin.

### P2 (otimizacao)

- cupons promocionais;
- plano anual com desconto;
- planos por perfil operacional (local/hospedado/delivery).

## Arquitetura de Planos (SaaS Entitlements)

A plataforma será estruturada em três níveis principais. Como diferencial competitivo, **todos os planos** incluem fechamento de pedidos direto na plataforma e pagamentos integrados (online/checkout). As restrições escalam o volume de uso operacional e gestão do estabelecimento.

### 1. Plano Start
- **Foco:** Pequenas operações e digitalização essencial (food trucks, quiosques).
- **Entitlements e Limites:**
  - Pedidos online com Pagamento Integrado
  - Limite prático de produtos (ex: ~100 produtos)
  - Apenas 1 usuário de painel (Gestão/Dono)
  - Limite moderado de mesas simultâneas (ex: 15 mesas)
  - Relatórios essenciais de vendas do dia
- **Suporte:** Atendimento padronizado (E-mail/Ticket SLAs de 24/48h)

### 2. Plano Growth (Principal)
- **Foco:** Restaurantes que precisam alavancar o delivery e rotacionar o salão.
- **Entitlements e Limites:**
  - Tudo do Start +
  - Proutos e Mesas/Comandas ativas ilimitadas
  - Até 5 usuários (com permissão segregada: Gestão, Caixa, Garçom)
  - Integração de roteamento básico de envio para Impressoras
  - Relatórios avançados (Curva ABC, rentabilidade mensal)
- **Suporte:** Prioritário via WhatsApp (em horário comercial)

### 3. Plano Scale
- **Foco:** Alto tráfego, franquias, e operações complexas (ex: múltiplos salões).
- **Entitlements e Limites:**
  - Tudo do Growth +
  - Usuários e permissões ilimitadas
  - KDS nativo (Kitchen Display System, tela digital para a cozinha)
  - Hub Multi-Lojas (painel de matriz para visualizar múltiplas filiais)
  - Whitelabel / Personalização extrema (domínio próprio ex: `pedidos.marca.com.br`)
- **Suporte:** VIP, plantão comercial, gerente de conta (Customer Success) dedicado

## KPIs de acompanhamento

- conversao trial para pago;
- MRR e ARPA;
- churn mensal;
- inadimplencia e recuperacao;
- tempo medio de ativacao;
- taxa de falha de cobranca;
- CSAT/NPS do gestor.

## Riscos e mitigacoes

- risco de cancelamento da assinatura por esquecimento -> enviar alertas via webhook faltando 3 dias + modelo de Trial e paywall explícito;
- bloqueio agressivo por inadimplencia -> aplicar bloqueio progressivo na mudança de status da subscription;
- vazamento de chaves (BYOG) -> criptografar os tokens dos lojistas no banco de dados e nunca exibi-los no lado do cliente.

## Time minimo recomendado

- 1 Product/Founder;
- 1 Designer (branding + design system);
- 2 devs fullstack;
- 1 QA (dedicado ou rotativo com checklist forte);
- apoio financeiro/operacional para regras de cobranca e repasse.

## Proximos passos imediatos

1. Aprovar este plano e congelar escopo do ciclo de 90 dias.
2. Confirmar gateway de cobranca alvo.
3. Quebrar cada sprint em historias tecnicas (backend/frontend/ops).
4. Definir dono por frente e ritos semanais de acompanhamento.

