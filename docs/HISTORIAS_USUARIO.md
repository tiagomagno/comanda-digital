# 📖 Histórias de Usuário - Sistema de Comandas Digitais

## 👤 Como Cliente

### US-001: Criar Comanda via QR Code
**Como** cliente  
**Quero** escanear um QR Code e criar minha comanda  
**Para** fazer pedidos de forma rápida e independente

**Critérios de Aceitação:**
- [ ] Ao escanear o QR Code, sou direcionado para a tela de criação de comanda
- [ ] Posso informar meu nome e telefone
- [ ] O campo de mesa é opcional
- [ ] Recebo um código único da minha comanda
- [ ] Sou redirecionado automaticamente para o cardápio

**Tarefas Técnicas:**
- Implementar geração de QR Code único por estabelecimento
- Criar endpoint POST /api/comandas
- Validar dados do cliente (nome obrigatório, telefone com formato válido)
- Gerar código único da comanda (ex: A001)

---

### US-002: Visualizar Cardápio por Categorias
**Como** cliente  
**Quero** visualizar o cardápio organizado por categorias  
**Para** encontrar facilmente o que desejo pedir

**Critérios de Aceitação:**
- [ ] Vejo as categorias em abas ou seções (Bebidas, Comidas, etc)
- [ ] Cada produto mostra nome, descrição e preço
- [ ] Produtos indisponíveis aparecem desabilitados
- [ ] A interface é responsiva e funciona bem em celular
- [ ] Botões são grandes o suficiente para facilitar o toque

**Tarefas Técnicas:**
- Criar endpoint GET /api/cardapio
- Implementar componente de listagem de categorias
- Criar card de produto com imagem, nome, descrição e preço
- Adicionar estados de loading e erro

---

### US-003: Adicionar Produtos ao Carrinho
**Como** cliente  
**Quero** adicionar produtos ao meu carrinho  
**Para** montar meu pedido antes de finalizar

**Critérios de Aceitação:**
- [ ] Posso adicionar múltiplas unidades do mesmo produto
- [ ] Posso adicionar observações ao item (ex: "sem cebola")
- [ ] Vejo o total do carrinho atualizado em tempo real
- [ ] Posso remover itens do carrinho
- [ ] Posso alterar a quantidade de itens

**Tarefas Técnicas:**
- Implementar store de carrinho (Zustand/Redux)
- Criar componente de carrinho com lista de itens
- Adicionar validação de quantidade mínima (1)
- Calcular subtotal e total automaticamente

---

### US-004: Finalizar Pedido
**Como** cliente  
**Quero** finalizar meu pedido  
**Para** que ele seja enviado para preparo após o pagamento

**Critérios de Aceitação:**
- [ ] Vejo um resumo completo do pedido antes de finalizar
- [ ] Vejo o valor total a pagar
- [ ] Posso adicionar observações gerais ao pedido
- [ ] Recebo confirmação de que o pedido foi criado
- [ ] Sou informado que devo aguardar o garçom para pagamento

**Tarefas Técnicas:**
- Criar endpoint POST /api/pedidos
- Implementar tela de resumo do pedido
- Validar carrinho não vazio
- Criar pedido com status "aguardando_pagamento"
- Limpar carrinho após finalização

---

### US-005: Acompanhar Status do Pedido
**Como** cliente  
**Quero** ver o status do meu pedido  
**Para** saber quando estará pronto

**Critérios de Aceitação:**
- [ ] Vejo os status: Aguardando Pagamento, Em Preparo, Pronto
- [ ] A atualização é em tempo real (sem precisar recarregar)
- [ ] Vejo o histórico de todos os meus pedidos na comanda
- [ ] Cada pedido mostra os itens e o total

**Tarefas Técnicas:**
- Implementar WebSocket para atualizações em tempo real
- Criar endpoint GET /api/comandas/:id/pedidos
- Criar componente de timeline de status
- Adicionar notificação visual quando status mudar

---

## 🧑‍💼 Como Garçom

### US-006: Visualizar Comandas Ativas
**Como** garçom  
**Quero** ver todas as comandas ativas  
**Para** gerenciar os atendimentos

**Critérios de Aceitação:**
- [ ] Vejo lista de todas as comandas ativas
- [ ] Cada comanda mostra: código, nome do cliente, mesa, total
- [ ] Posso filtrar por mesa ou nome
- [ ] Vejo quantos pedidos cada comanda tem
- [ ] Comandas são ordenadas por horário de criação

**Tarefas Técnicas:**
- Criar endpoint GET /api/garcom/comandas
- Implementar autenticação JWT para garçom
- Criar componente de listagem de comandas
- Adicionar filtros e busca

---

### US-007: Confirmar Pagamento de Pedido
**Como** garçom  
**Quero** confirmar que o cliente pagou o pedido  
**Para** liberar o pedido para preparo

**Critérios de Aceitação:**
- [ ] Vejo detalhes completos do pedido antes de confirmar
- [ ] Posso confirmar o pagamento com um clique
- [ ] Após confirmar, o pedido é enviado para bar/cozinha
- [ ] Recebo confirmação visual da ação
- [ ] Não posso confirmar pagamento duas vezes

**Tarefas Técnicas:**
- Criar endpoint POST /api/garcom/pedidos/:id/pagar
- Atualizar status do pedido para "pago"
- Emitir evento WebSocket para bar/cozinha
- Adicionar validação de status anterior

---

### US-008: Editar Pedido Antes do Pagamento
**Como** garçom  
**Quero** editar um pedido antes do pagamento  
**Para** corrigir erros ou atender solicitações do cliente

**Critérios de Aceitação:**
- [ ] Posso adicionar ou remover itens do pedido
- [ ] Posso alterar quantidades
- [ ] Posso adicionar observações
- [ ] Só posso editar pedidos com status "aguardando_pagamento"
- [ ] O total é recalculado automaticamente

**Tarefas Técnicas:**
- Criar endpoint PATCH /api/garcom/pedidos/:id
- Validar status do pedido
- Recalcular total após edição
- Adicionar auditoria de alterações

---

### US-009: Cancelar Pedido
**Como** garçom  
**Quero** cancelar um pedido  
**Para** atender desistências ou corrigir erros

**Critérios de Aceitação:**
- [ ] Posso cancelar pedidos com status "aguardando_pagamento"
- [ ] Devo informar um motivo do cancelamento
- [ ] Recebo confirmação antes de cancelar
- [ ] O pedido é marcado como "cancelado" (não deletado)
- [ ] A comanda permanece ativa

**Tarefas Técnicas:**
- Criar endpoint DELETE /api/garcom/pedidos/:id
- Adicionar soft delete (status = cancelado)
- Registrar motivo e timestamp do cancelamento
- Emitir evento de cancelamento

---

## 👨‍🍳 Como Bar/Cozinha

### US-010: Visualizar Pedidos Pendentes
**Como** atendente do bar/cozinha  
**Quero** ver apenas os pedidos destinados ao meu setor  
**Para** preparar os itens corretamente

**Critérios de Aceitação:**
- [ ] Vejo apenas pedidos do meu destino (BAR ou COZINHA)
- [ ] Pedidos são ordenados por horário (mais antigos primeiro)
- [ ] Cada pedido mostra: número, mesa/comanda, itens, observações
- [ ] Vejo status atual de cada pedido
- [ ] Novos pedidos aparecem automaticamente (tempo real)

**Tarefas Técnicas:**
- Criar endpoint GET /api/preparo/pedidos?destino=BAR
- Filtrar pedidos por destino automaticamente
- Implementar WebSocket para novos pedidos
- Criar componente de card de pedido

---

### US-011: Atualizar Status do Pedido
**Como** atendente do bar/cozinha  
**Quero** atualizar o status do pedido  
**Para** informar o progresso do preparo

**Critérios de Aceitação:**
- [ ] Posso marcar pedido como "Em Preparo"
- [ ] Posso marcar pedido como "Pronto"
- [ ] O cliente vê a atualização em tempo real
- [ ] O garçom é notificado quando o pedido fica pronto
- [ ] Não posso voltar status (apenas avançar)

**Tarefas Técnicas:**
- Criar endpoint PATCH /api/preparo/pedidos/:id/status
- Validar transições de status permitidas
- Emitir evento WebSocket para cliente e garçom
- Registrar timestamp de cada mudança de status

---

### US-012: Visualizar Detalhes do Pedido
**Como** atendente do bar/cozinha  
**Quero** ver detalhes completos do pedido  
**Para** preparar corretamente todos os itens

**Critérios de Aceitação:**
- [ ] Vejo lista completa de itens com quantidades
- [ ] Vejo observações de cada item
- [ ] Vejo observações gerais do pedido
- [ ] Vejo código da comanda e mesa (se houver)
- [ ] Interface é clara e fácil de ler rapidamente

**Tarefas Técnicas:**
- Criar modal/drawer de detalhes do pedido
- Destacar observações visualmente
- Usar fonte grande e legível
- Adicionar impressão (opcional)

---

## 👨‍💼 Como Administrador

### US-013: Cadastrar Produtos
**Como** administrador  
**Quero** cadastrar novos produtos no cardápio  
**Para** manter o sistema atualizado

**Critérios de Aceitação:**
- [ ] Posso informar: nome, descrição, preço, categoria
- [ ] Posso fazer upload de imagem do produto
- [ ] Posso definir se o produto está disponível
- [ ] Posso definir ordem de exibição
- [ ] Validação de campos obrigatórios

**Tarefas Técnicas:**
- Criar endpoint POST /api/admin/produtos
- Implementar upload de imagens
- Validar dados (preço > 0, nome único, etc)
- Criar formulário de cadastro

---

### US-014: Gerenciar Categorias
**Como** administrador  
**Quero** criar e gerenciar categorias  
**Para** organizar o cardápio

**Critérios de Aceitação:**
- [ ] Posso criar nova categoria
- [ ] Posso definir nome e destino (BAR/COZINHA)
- [ ] Posso definir cor e ícone da categoria
- [ ] Posso reordenar categorias
- [ ] Posso desativar categoria (sem deletar)

**Tarefas Técnicas:**
- Criar endpoint POST /api/admin/categorias
- Implementar drag-and-drop para reordenação
- Validar destino (enum BAR/COZINHA)
- Criar interface de gerenciamento

---

### US-015: Visualizar Dashboard de Métricas
**Como** administrador  
**Quero** ver métricas básicas do sistema  
**Para** acompanhar o desempenho do estabelecimento

**Critérios de Aceitação:**
- [ ] Vejo total de comandas ativas
- [ ] Vejo total de pedidos do dia
- [ ] Vejo valor total movimentado
- [ ] Vejo produtos mais vendidos
- [ ] Posso filtrar por período

**Tarefas Técnicas:**
- Criar endpoint GET /api/admin/metricas
- Implementar queries agregadas no banco
- Criar componentes de cards de métricas
- Adicionar gráficos simples (opcional)

---

### US-016: Gerenciar Estabelecimento
**Como** administrador  
**Quero** configurar dados do estabelecimento  
**Para** personalizar o sistema

**Critérios de Aceitação:**
- [ ] Posso editar nome, telefone, endereço
- [ ] Posso fazer upload do logo
- [ ] Posso configurar modo offline
- [ ] Posso gerar novos QR Codes
- [ ] Posso definir tempo de expiração de comanda (opcional)

**Tarefas Técnicas:**
- Criar endpoint PATCH /api/admin/estabelecimento
- Implementar upload de logo
- Criar formulário de configurações
- Validar dados obrigatórios

---

## 🔄 Funcionalidades Transversais

### US-017: Sincronização Offline
**Como** usuário do sistema  
**Quero** que o sistema funcione sem internet  
**Para** não interromper o atendimento

**Critérios de Aceitação:**
- [ ] Posso criar comandas offline
- [ ] Posso fazer pedidos offline
- [ ] Dados são sincronizados quando voltar online
- [ ] Vejo indicador de modo offline
- [ ] Não perco dados durante a sincronização

**Tarefas Técnicas:**
- Implementar Service Worker
- Criar fila de sincronização com IndexedDB
- Detectar conectividade (online/offline)
- Implementar estratégia de resolução de conflitos
- Adicionar indicador visual de status de conexão

---

### US-018: Notificações em Tempo Real
**Como** usuário do sistema  
**Quero** receber atualizações em tempo real  
**Para** não precisar recarregar a página

**Critérios de Aceitação:**
- [ ] Novos pedidos aparecem automaticamente
- [ ] Mudanças de status são instantâneas
- [ ] Não preciso recarregar a página manualmente
- [ ] Funciona em todas as interfaces (cliente, garçom, bar/cozinha)

**Tarefas Técnicas:**
- Implementar WebSocket com Socket.io
- Criar eventos para cada ação importante
- Implementar listeners nos componentes
- Adicionar fallback para polling se WebSocket falhar

---

### US-019: Responsividade Mobile
**Como** usuário  
**Quero** que o sistema funcione perfeitamente no celular  
**Para** ter boa experiência em qualquer dispositivo

**Critérios de Aceitação:**
- [ ] Interface se adapta a diferentes tamanhos de tela
- [ ] Botões são grandes o suficiente para toque
- [ ] Textos são legíveis sem zoom
- [ ] Navegação é intuitiva no mobile
- [ ] Funciona em modo retrato e paisagem

**Tarefas Técnicas:**
- Usar design mobile-first
- Implementar breakpoints responsivos
- Testar em diferentes dispositivos
- Usar unidades relativas (rem, %, vw/vh)
- Adicionar meta viewport

---

## 📊 Priorização (MoSCoW)

### Must Have (Essencial para MVP)
- US-001: Criar Comanda via QR Code
- US-002: Visualizar Cardápio
- US-003: Adicionar Produtos ao Carrinho
- US-004: Finalizar Pedido
- US-007: Confirmar Pagamento
- US-010: Visualizar Pedidos Pendentes (Bar/Cozinha)
- US-011: Atualizar Status do Pedido
- US-013: Cadastrar Produtos
- US-014: Gerenciar Categorias

### Should Have (Importante, mas não bloqueante)
- US-005: Acompanhar Status do Pedido
- US-006: Visualizar Comandas Ativas
- US-008: Editar Pedido
- US-009: Cancelar Pedido
- US-015: Dashboard de Métricas
- US-018: Notificações em Tempo Real
- US-019: Responsividade Mobile

### Could Have (Desejável)
- US-012: Visualizar Detalhes do Pedido
- US-016: Gerenciar Estabelecimento
- US-017: Sincronização Offline

### Won't Have (Fora do escopo MVP)
- Integração com pagamentos online
- Sistema de fidelidade
- Delivery
- App nativo
- Integração com impressoras térmicas
- Relatórios avançados

---

**Total de Histórias: 19**  
**Estimativa de Desenvolvimento: 10-12 semanas**
