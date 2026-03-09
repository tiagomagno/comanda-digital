# Comanda Digital — Contexto do Projeto, Telas e Status

## O que é o projeto

**Comanda Digital** é um sistema para bares e restaurantes que cobre três frentes: (1) **cardápio digital** vinculado ao estabelecimento, para visualização externa; (2) **comanda e pedidos in loco**, com leitura de QR Code, carrinho e pagamento no estabelecimento; (3) **painel de gestão** para donos e equipe (mesas, usuários, cardápio, operação do dia).

O frontend é uma aplicação Next.js (App Router) e o backend uma API REST em Node.js (Express) com MySQL e Prisma. A comunicação em tempo real usa Socket.IO. O acesso às telas é controlado por rotas públicas ou autenticadas (JWT).

---

## Visão geral das telas e interações

As telas estão organizadas em **três blocos**: **acesso público e links**, **cliente (consumidor)** e **painel de gestão (estabelecimento)**.

---

### 1. Acesso público e links

| Tela | Rota | O que faz |
|------|------|-----------|
| **Página inicial** | `/` | Apresenta o sistema e os acessos: Cliente, Garçom, Cozinha, Bar, Painel de Gestão e o botão **“Ver links: Cardápio e Painel (com dados de acesso)”**. |
| **Links de acesso** | `/acesso` | Central de links: lista estabelecimentos com **link do cardápio** (`/cardapio/estabelecimento/[id]`) e o **link do Painel de Gestão** com as credenciais (e-mail e senha) para login. Público. |
| **Login** | `/auth/login` | Dois modos: **código de acesso** (para garçom/cozinha/bar) ou **e-mail e senha** (Admin). Após login com e-mail/senha, redireciona para `/admin/dashboard`. |

---

### 2. Cardápio (visualização externa)

| Tela | Rota | O que faz |
|------|------|-----------|
| **Cardápio do estabelecimento** | `/cardapio/estabelecimento/[id]` | Página web/app do cardápio do estabelecimento: header com nome, aviso “Pedidos e delivery em breve”, navegação por categorias (âncoras), listagem de produtos com nome, descrição, preço e imagem (quando houver). **Somente visualização** — sem carrinho nem pedido. Público. |

Essa URL é a que pode ser vinculada ao estabelecimento e compartilhada (site, redes, QR). Ainda não há fluxo de pedido ou delivery.

---

### 3. Cliente (consumidor no estabelecimento)

Fluxo típico: **entrada pela mesa (QR)** ou **comanda nova** → **cardápio com comanda** → **carrinho** → **confirmar pedido** → **acompanhar pedido**.

| Tela | Rota | O que faz |
|------|------|-----------|
| **Nova comanda** | `/comanda/nova` | Cliente informa dados e escolhe forma de pagamento (imediato ou no final). Cria a comanda e redireciona para o cardápio com a comanda vinculada. |
| **Comanda por código** | `/comanda/[codigo]` | Exibe a comanda (dados, mesa, total) e links para **Cardápio** (fazer pedido) e **Pedido** (detalhes). |
| **Mesa (check-in)** | `/cliente/mesa/[estabelecimentoId]/[mesaId]` | Entrada via QR da mesa: valida mesa, exibe opção de criar comanda (nome e telefone). Após criar, redireciona para `/cliente/comanda/[codigo]`. |
| **Cardápio com comanda (cliente)** | `/cardapio?comanda=[codigo]` | Cardápio com carrinho e botão de enviar pedido (fluxo “in loco” com comanda). |
| **Carrinho** | `/carrinho` | Revisão do carrinho e envio do pedido; após enviar, redireciona para a tela do pedido. |
| **Confirmar pedido** | `/pedido/confirmar` | Confirmação antes de enviar; redireciona para acompanhar ou voltar ao cardápio. |
| **Detalhe do pedido** | `/pedido/[id]` | Status do pedido (criado, em preparo, pronto etc.) e link de volta ao cardápio. |
| **Acompanhar pedido** | `/pedido/acompanhar` | Acompanhamento por comanda; links para cardápio. |
| **Comanda do cliente (in loco)** | `/cliente/comanda/[codigo]` | Cardápio + carrinho + envio de pedidos e visualização da comanda (mesa, totais). |

Todas essas rotas são **públicas** (sem login obrigatório), para o consumidor usar no celular ou navegador.

---

### 4. Painel de gestão (estabelecimento)

Acesso após **login com e-mail e senha** em `/auth/login`. Todas as telas abaixo ficam dentro do **mesmo layout** (sidebar com as três vertentes: Cardápio, Estabelecimento, Operação).

**URL de entrada:** `/admin/dashboard` (ou `/painel`, que redireciona para `/admin/dashboard`).

#### 4.1 Visão geral

| Tela | Rota | O que faz |
|------|------|-----------|
| **Dashboard** | `/admin/dashboard` | Resumo: vendas, comandas, ticket médio, pedidos ativos, produtos mais vendidos e atalhos para Mesas, Usuários, Produtos, Relatórios, Configurações e Caixa. |

#### 4.2 Cardápio (gestão)

| Tela | Rota | O que faz |
|------|------|-----------|
| **Produtos** | `/admin/produtos` | Cadastro e edição de produtos e categorias do cardápio (nome, preço, categoria, destaque etc.). Hoje a lista/categorias podem usar mock; ideal integrar 100% com a API. |

#### 4.3 Estabelecimento

| Tela | Rota | O que faz |
|------|------|-----------|
| **Mesas e QR Code** | `/admin/mesas` | CRUD de mesas, geração e download de QR Code por mesa, regenerar QR e bloco de **QR Code universal** (comanda individual, sem mesa). Integrado à API. |
| **Usuários e Garçons** | `/admin/usuarios` | Interface para cadastro de usuários (garçom, cozinha, bar, admin). Hoje usa mock; falta API de gestão de usuários no backend. |

#### 4.4 Operação (dia a dia)

| Tela | Rota | O que faz |
|------|------|-----------|
| **Garçom** | `/garcom` | Lista comandas ativas, filtros (todas / pagar agora / pagar no final), aprovar/rejeitar pedidos, registrar pagamento e fechar comanda. |
| **Garçom — Comanda** | `/garcom/comanda/[id]` | Detalhe da comanda: pedidos, aprovar/rejeitar, pagar e fechar. Link de volta para `/garcom`. |
| **Cozinha** | `/cozinha` | Kanban: Aguardando, Em preparo, Prontos. Atualização de status dos pedidos (destino COZINHA). |
| **Bar** | `/bar` | Mesmo Kanban para pedidos do bar (destino BAR). |
| **Caixa** | `/caixa` | Comandas aguardando pagamento final, processar pagamento (método) e fechar comanda; visão de totais. |

#### 4.5 Sistema

| Tela | Rota | O que faz |
|------|------|-----------|
| **Relatórios** | `/admin/relatorios` | Relatórios de vendas (período), por método de pagamento e produtos mais vendidos. Dados ainda mock. |
| **Configurações** | `/admin/configuracoes` | Placeholder; texto “Em breve: configurações do estabelecimento”. |

---

## Resumo do status atual

### O que está implementado e em uso

- **Backend:** API REST (auth, estabelecimentos, categorias, produtos, comandas, pedidos, mesas, garçom, cozinha, bar, caixa, cardápio público). Socket.IO para tempo real. Seed de personas (`POST /api/seed-personas`).
- **Autenticação:** Login por código de acesso e por e-mail/senha; JWT; middleware protegendo rotas do painel.
- **Cardápio externo:** Página `/cardapio/estabelecimento/[id]` somente visualização, layout web/app, sem pedido; aviso de “delivery em breve”.
- **Links e credenciais:** Página `/acesso` com links do cardápio por estabelecimento e do painel, com credenciais de teste.
- **Cliente in loco:** Fluxo mesa (QR) → comanda → cardápio → carrinho → pedido → acompanhamento; comanda por código; pagamento tratado no painel (garçom/caixa).
- **Painel unificado:** Layout único (sidebar) para admin/dashboard, produtos, mesas, usuários, garçom, cozinha, bar, caixa, relatórios e configurações.
- **Mesas e QR:** Cadastro de mesas, geração e download de QR, regenerar QR e QR universal (comanda individual).

### O que está parcial ou em ajuste

- **Admin Produtos e Usuários:** Telas existem; produtos podem usar mock na listagem; usuários usam mock e ainda não há API de gestão de usuários (listar/criar/editar por estabelecimento).
- **Relatórios:** Interface pronta; dados vindo de mock; falta conectar às APIs de relatório do backend.
- **Cardápio com comanda (`/cardapio?comanda=`):** Pode estar usando mock; o fluxo “in loco” completo usa principalmente `/cliente/comanda/[codigo]`.

### O que está planejado / em breve

- **Pedidos e delivery** no cardápio externo (`/cardapio/estabelecimento/[id]`): hoje só visualização; configuração de delivery do estabelecimento ainda não solicitada.
- **Configurações do estabelecimento:** Tela placeholder; conteúdo a definir.
- **Validação de perfil por rota:** Middleware só exige token; a divisão por perfil (garçom, cozinha, caixa, admin) pode ser reforçada no frontend ou no backend.

---

## Fluxos resumidos

1. **Ver cardápio de um estabelecimento (qualquer pessoa)**  
   `/acesso` → clicar no link do estabelecimento → `/cardapio/estabelecimento/[id]`. Só visualização.

2. **Cliente fazendo pedido na mesa**  
   Escanear QR da mesa → `/cliente/mesa/[estab]/[mesa]` → criar comanda → `/cliente/comanda/[codigo]` → cardápio, carrinho, enviar pedido → acompanhar em `/pedido/[id]` ou `/pedido/acompanhar`. Pagamento no local (garçom/caixa).

3. **Gestor/equipe entrando no painel**  
   `/auth/login` (e-mail + senha) → `/admin/dashboard` → pela sidebar acessa Cardápio (produtos), Estabelecimento (mesas, usuários), Operação (garçom, cozinha, bar, caixa) e Sistema (relatórios, configurações).

4. **Acesso rápido para testes**  
   `/acesso` mostra links do cardápio e do painel e as credenciais (ex.: carlos@bar.com / 123456) para login no painel.

---

*Documento gerado para contextualizar o projeto Comanda Digital, todas as interações e telas disponíveis e o status atual (frontend Next.js, backend Express + MySQL + Prisma).*
