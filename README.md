# 🧠 Sistema de Comandas Digitais para Bares e Restaurantes (MVP)

## 🎯 Objetivo do Projeto

Sistema de comanda digital voltado para bares e restaurantes, com foco inicial exclusivamente no **módulo de comanda**, permitindo:

- ✅ Controle de pedidos via QR Code
- ✅ Suporte a comanda individual (sem obrigatoriedade de mesa)
- ✅ Separação automática de pedidos por destino (bar/cozinha)
- ✅ Operação online + local/offline (rede interna)

> **Nota:** O sistema será a base de uma futura plataforma tipo CRM, mas neste MVP o escopo é **restrito à comanda**.

---

## 🧩 Contexto de Uso (Cenário Real)

- 🏪 Estabelecimentos podem estar cheios, com clientes em pé, sem mesas
- 👤 Um mesmo cliente pode ter sua própria comanda independente
- 🪑 Uma mesa pode conter múltiplas comandas
- 💰 O pagamento não acontece no sistema (é feito via garçom)

### 📱 O sistema deve funcionar:

1. **No celular do cliente** (QR Code)
2. **Em tablets locais** do estabelecimento
3. **Com cardápio físico** (não interativo, mas sincronizado em preços e produtos)

---

## 👥 Perfis de Usuário

### 1. 👤 Cliente

**Acessa via QR Code (ou tablet local)**

- Cria sua comanda com:
  - Nome
  - Telefone
- Visualiza cardápio
- Faz pedidos
- Finaliza pedido
- Visualiza status básico do pedido (ex: Em preparo / Pronto)

### 2. 🧑‍💼 Garçom

- Visualiza comandas ativas
- Confirma pagamento
- Pode:
  - Editar pedidos antes do pagamento
  - Cancelar pedido
  - Liberar comanda para novo pedido
- Atua como intermediador humano (pagamento, entrega)

### 3. 👨‍🍳 Bar / Cozinha

- Visualizam pedidos separados automaticamente por destino
- Recebem pedidos somente após confirmação de pagamento
- Atualizam status do pedido (em preparo / pronto)

### 4. 👨‍💼 Gestor / Admin do Estabelecimento

- Cadastra cardápio
- Define categorias e destino dos produtos
- Visualiza métricas básicas:
  - Total de comandas
  - Total de pedidos
  - Valor estimado movimentado
- Pode ter mais de um bar/restaurante sob o mesmo perfil

---

## 🔄 Fluxo Principal da Comanda (Cliente)

1. Cliente chega ao local
2. Escaneia QR Code ou utiliza um tablet disponível
3. Cria comanda informando:
   - Nome
   - Telefone
4. Sistema gera:
   - ID único da comanda
5. Cliente acessa o cardápio
6. Cliente adiciona produtos
7. Cliente finaliza o pedido
8. **Pedido fica aguardando pagamento**
9. **Garçom confirma pagamento**
10. **Pedido é liberado para bar/cozinha**
11. Cliente pode visualizar status (simples)

---

## 🍔 Cardápio e Destino dos Produtos

Durante o cadastro de produtos:

- Cada produto pertence a uma **categoria**
- Cada categoria define um **destino automático**:
  - 🥤 **Bebidas / Drinks** → BAR
  - 🍔 **Comidas / Pratos** → COZINHA

> 👉 **O cliente não escolhe destino.**  
> 👉 **O sistema roteia automaticamente.**

---

## 💳 Pagamento (Importante)

### ❌ Não há pagamento integrado no MVP

### ✅ Pagamento é feito diretamente ao garçom

**Apenas após o pagamento:**
- O pedido é enviado para preparo
- Pedidos não expiram

**Antes do pagamento:**
- Pedido pode ser cancelado
- Pedido pode ser editado pelo garçom

---

## 📶 Operação Online + Local (Offline-First)

O sistema deve suportar:

### 🔹 Modo Online
- Cliente acessa via internet
- Dados sincronizados com servidor

### 🔹 Modo Local (Offline / Rede Interna)
- Funciona via Wi-Fi local do estabelecimento
- Ideal para:
  - Tablets internos
  - Ambientes com internet instável
- Deve permitir:
  - Criação de comandas
  - Envio de pedidos
  - Visualização por bar/cozinha

---

## 📲 Dispositivos Suportados

### 1. 📱 Smartphone do Cliente
- Interface simples
- Botões grandes
- UX acessível (pensando em idosos)

### 2. 📲 Tablet do Estabelecimento
- Mesmo sistema, layout adaptado
- Ideal para clientes que não querem usar celular

### 3. 📄 Cardápio Físico
- Não interativo
- Produtos e preços sincronizados com o sistema
- Serve como alternativa para público não digital

---

## 🧱 Modelo de Dados (Alto Nível)

### Entidades Principais

#### Usuário
- `id`
- `nome`
- `telefone`
- `tipo` (cliente, garçom, admin)

#### Estabelecimento
- `id`
- `nome`
- `configurações locais`

#### Comanda
- `id`
- `nome_cliente`
- `telefone`
- `status` (ativa, aguardando pagamento, finalizada)
- `mesa` (opcional)
- `created_at`

#### Pedido
- `id`
- `comanda_id`
- `status` (criado, pago, em preparo, pronto)
- `total_estimado`

#### Produto
- `id`
- `nome`
- `preço`
- `categoria_id`

#### Categoria
- `id`
- `nome`
- `destino` (BAR | COZINHA)

---

## 🧭 Fluxos Técnicos Recomendados

- **Arquitetura modular** (pensando em CRM futuro)

### Backend:
- API REST ou GraphQL
- Suporte a sincronização local

### Frontend:
- Web App responsivo
- Layout adaptativo para tablet

### Comunicação em tempo real:
- WebSocket ou polling simples (MVP)

### Banco de dados:
- Estrutura preparada para múltiplos estabelecimentos

---

## 🧩 Orientação de Airframe / Telas (Sem Design Final)

### Cliente
- Tela de cadastro da comanda
- Tela de cardápio por categorias
- Tela de resumo do pedido
- Tela de status do pedido

### Garçom
- Lista de comandas ativas
- Tela de confirmação de pagamento
- Tela de edição/cancelamento de pedido

### Bar / Cozinha
- Painel de pedidos
- Filtro por status
- Ação de "pedido pronto"

### Admin
- Cadastro de produtos e categorias
- Dashboard simples de métricas

---

## 🚀 Diferenciais Estratégicos do MVP

- ✔ Comanda individual sem mesa
- ✔ Separação automática bar/cozinha
- ✔ Pagamento fora do sistema
- ✔ Suporte a tablet local
- ✔ Operação offline-first
- ✔ UX inclusivo (idosos e público não digital)

---

## 📌 Escopo do MVP (Regra de Ouro)

> 👉 **Tudo que não for essencial para a comanda deve ficar fora do MVP**  
> (ex: fidelidade, pagamentos online, delivery, notificações push, etc.)

---

## 📂 Estrutura do Projeto

```
comanda-digital/
├── backend/          # API e lógica de negócio
├── frontend/         # Interface do usuário
├── database/         # Schemas e migrations
├── docs/             # Documentação técnica
└── README.md         # Este arquivo
```

---

## 🛠️ Tecnologias Sugeridas

- **Backend:** Node.js / Laravel / Django
- **Frontend:** React / Vue.js / Next.js
- **Database:** PostgreSQL / MySQL
- **Real-time:** Socket.io / WebSockets
- **Mobile:** PWA (Progressive Web App)

---

## 📝 Próximos Passos

1. [ ] Definir stack tecnológica
2. [ ] Criar estrutura de pastas
3. [ ] Modelar banco de dados
4. [ ] Desenvolver API básica
5. [ ] Criar interface do cliente
6. [ ] Implementar sistema de QR Code
7. [ ] Desenvolver painéis de garçom/cozinha/bar
8. [ ] Implementar modo offline
9. [ ] Testes e validação

---

**Desenvolvido com ❤️ para revolucionar a experiência em bares e restaurantes**
