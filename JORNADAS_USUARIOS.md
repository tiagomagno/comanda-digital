# 🎭 JORNADAS DE USUÁRIO - COMANDA DIGITAL

**Data:** 09/01/2026  
**Versão:** 3.0.0

---

## 📋 ÍNDICE

1. [Jornada do Gestor (Admin)](#jornada-do-gestor)
2. [Jornada do Garçom](#jornada-do-garçom)
3. [Jornada do Cliente](#jornada-do-cliente)
4. [Jornada da Cozinha](#jornada-da-cozinha)
5. [Jornada do Bar](#jornada-do-bar)
6. [Jornada do Caixa](#jornada-do-caixa)
7. [Como o Sistema Diferencia os Perfis](#diferenciação-de-perfis)

---

## 🎯 JORNADA DO GESTOR (ADMIN)

### **Perfil:** Administrador do Estabelecimento
**Código de Acesso:** `ADMIN2026`  
**Email:** `admin@bardoze.com.br` | **Senha:** `admin123`

### **🚀 FLUXO COMPLETO**

#### **1. LOGIN**
```
┌─────────────────────────────────┐
│  http://localhost:3000/auth/login │
└─────────────────────────────────┘
         ↓
   Digite: ADMIN2026
         ↓
   Clique: "Entrar"
         ↓
   Sistema verifica:
   - Código existe?
   - Tipo = admin?
   - Ativo = true?
         ↓
   ✅ Gera JWT token
   ✅ Salva no localStorage
         ↓
   Redireciona para:
   /admin/dashboard
```

#### **2. DASHBOARD ADMIN**
```
┌─────────────────────────────────────────┐
│  📊 Dashboard Admin                     │
│  Visão geral do estabelecimento         │
├─────────────────────────────────────────┤
│  ESTATÍSTICAS:                          │
│  💰 Total de Vendas: R$ 2.450,00       │
│  👥 Comandas: 45 (12 abertas)          │
│  📈 Ticket Médio: R$ 54,44             │
│  🍽️ Pedidos Ativos: 8                  │
├─────────────────────────────────────────┤
│  MÓDULOS DISPONÍVEIS:                   │
│  🪑 Mesas                               │
│  👥 Usuários                            │
│  🍽️ Produtos                            │
│  📊 Relatórios                          │
│  ⚙️ Configurações                       │
│  💰 Caixa                               │
└─────────────────────────────────────────┘
```

#### **3. GESTÃO DE MESAS**
```
Clique em "Mesas"
         ↓
/admin/mesas
         ↓
┌─────────────────────────────────────────┐
│  🪑 Gestão de Mesas                     │
├─────────────────────────────────────────┤
│  ESTATÍSTICAS:                          │
│  • Total: 15 mesas                      │
│  • Ativas: 15                           │
│  • Capacidade: 60 pessoas               │
├─────────────────────────────────────────┤
│  TABELA:                                │
│  Nº | Capacidade | Status | QR Code     │
│  1  | 2 pessoas  | Ativa  | [Baixar]   │
│  2  | 2 pessoas  | Ativa  | [Baixar]   │
│  ...                                    │
├─────────────────────────────────────────┤
│  AÇÕES:                                 │
│  [+ Nova Mesa]  [🔄 Atualizar]         │
└─────────────────────────────────────────┘
```

**Criar Nova Mesa:**
```
Clique: "+ Nova Mesa"
         ↓
Modal abre:
┌─────────────────────────────┐
│  Nova Mesa                  │
├─────────────────────────────┤
│  Número: [____]             │
│  Capacidade: [____]         │
├─────────────────────────────┤
│  [Cancelar] [Criar Mesa]    │
└─────────────────────────────┘
         ↓
Preenche: Número = 16
          Capacidade = 4
         ↓
Clique: "Criar Mesa"
         ↓
Sistema:
✅ Cria mesa no banco
✅ Gera QR Code automaticamente
✅ URL: http://localhost:3000/comanda/nova?mesa=16
         ↓
Toast: "Mesa criada com sucesso!"
         ↓
Mesa aparece na lista
```

**Baixar QR Code:**
```
Clique: "Baixar" (na linha da mesa)
         ↓
Sistema:
✅ Gera imagem PNG do QR Code
✅ Download: mesa-16-qrcode.png
         ↓
Arquivo salvo na pasta Downloads
```

#### **4. GESTÃO DE USUÁRIOS**
```
Clique em "Usuários"
         ↓
/admin/usuarios
         ↓
┌─────────────────────────────────────────┐
│  👥 Gestão de Usuários                  │
├─────────────────────────────────────────┤
│  ESTATÍSTICAS:                          │
│  • Total: 4 usuários                    │
│  • Garçons: 1                           │
│  • Cozinha: 1                           │
│  • Bar: 1                               │
├─────────────────────────────────────────┤
│  TABELA:                                │
│  Nome | Contato | Tipo | Código | Status│
│  Admin | admin@... | ADMIN | ADMIN2026 │
│  Carlos | (11)98... | GARCOM | GARCOM01│
│  ...                                    │
├─────────────────────────────────────────┤
│  [+ Novo Usuário]  [🔄 Atualizar]      │
└─────────────────────────────────────────┘
```

**Criar Novo Usuário:**
```
Clique: "+ Novo Usuário"
         ↓
Modal abre:
┌─────────────────────────────┐
│  Novo Usuário               │
├─────────────────────────────┤
│  Nome: [____________]       │
│  Tipo: [Garçom ▼]          │
│  Email: [____________]      │
│  Telefone: [____________]   │
│  Senha: [____________] 👁️  │
├─────────────────────────────┤
│  [Cancelar] [Criar Usuário] │
└─────────────────────────────┘
         ↓
Preenche dados
         ↓
Sistema:
✅ Gera código automaticamente
   Exemplo: GARCOM02
✅ Cria usuário no banco
         ↓
Toast: "Usuário criado! Código: GARCOM02"
         ↓
Usuário aparece na lista
```

#### **5. GESTÃO DE PRODUTOS**
```
Clique em "Produtos"
         ↓
/admin/produtos
         ↓
┌─────────────────────────────────────────┐
│  🍽️ Gestão de Produtos                  │
├─────────────────────────────────────────┤
│  FILTROS:                               │
│  [Todos] [🍹 Bar] [🍽️ Cozinha]         │
├─────────────────────────────────────────┤
│  GRID DE CARDS:                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Cerveja  │ │Batata   │ │Feijoada │  │
│  │Heineken │ │Frita    │ │Completa │  │
│  │⭐ Destaque│ │R$ 25,00 │ │R$ 55,00 │  │
│  │R$ 12,00 │ │✓ Disp.  │ │✓ Disp.  │  │
│  └─────────┘ └─────────┘ └─────────┘  │
├─────────────────────────────────────────┤
│  [+ Novo Produto]  [🔄 Atualizar]      │
└─────────────────────────────────────────┘
```

#### **6. RELATÓRIOS**
```
Clique em "Relatórios"
         ↓
/admin/relatorios
         ↓
┌─────────────────────────────────────────┐
│  📊 Relatórios                          │
├─────────────────────────────────────────┤
│  PERÍODO: [Hoje] [Semana] [Mês]        │
├─────────────────────────────────────────┤
│  ESTATÍSTICAS:                          │
│  💰 Total: R$ 2.450,00                 │
│  👥 Comandas: 45                        │
│  📈 Ticket Médio: R$ 54,44             │
├─────────────────────────────────────────┤
│  VENDAS POR MÉTODO:                     │
│  💵 Dinheiro ████████ R$ 850,00        │
│  💳 Cartão   ████████████ R$ 1.200,00  │
│  📱 PIX      ████ R$ 400,00            │
├─────────────────────────────────────────┤
│  VENDAS POR HORA:                       │
│  11h ████ R$ 150                        │
│  12h ████████ R$ 380                    │
│  13h ██████████ R$ 420                  │
├─────────────────────────────────────────┤
│  TOP 5 PRODUTOS:                        │
│  1. Cerveja Heineken - 45 un - R$ 540  │
│  2. Porção Batata - 32 un - R$ 640     │
│  3. Feijoada - 28 un - R$ 1.260        │
└─────────────────────────────────────────┘
```

---

## 🍽️ JORNADA DO GARÇOM

### **Perfil:** Garçom/Atendente
**Código de Acesso:** `GARCOM01`

### **🚀 FLUXO COMPLETO**

#### **1. LOGIN**
```
http://localhost:3000/auth/login
         ↓
Digite: GARCOM01
         ↓
Sistema verifica:
✅ Tipo = garcom
         ↓
Redireciona para:
/garcom
```

#### **2. PAINEL DO GARÇOM**
```
┌─────────────────────────────────────────┐
│  🍽️ Painel do Garçom                    │
│  Gerencie comandas e pagamentos         │
├─────────────────────────────────────────┤
│  ESTATÍSTICAS:                          │
│  👥 Comandas Ativas: 12                 │
│  📋 Total de Itens: 45                  │
│  💰 Valor Total: R$ 1.250,00           │
├─────────────────────────────────────────┤
│  FILTROS:                               │
│  [Todas] [💳 Pagar Agora] [📋 Pagar Final]│
├─────────────────────────────────────────┤
│  COMANDAS:                              │
│  ┌─────────────────────────────────┐   │
│  │ Mesa 5 | 💳 Pagar Agora          │   │
│  │ João Silva                       │   │
│  │ 3 pedidos | 17:30               │   │
│  │ R$ 85,00                        │   │
│  │ Itens:                          │   │
│  │ • 2x Cerveja Heineken ✅ Pronto │   │
│  │ • 1x Batata Frita 🔄 Preparando │   │
│  │                                 │   │
│  │ [💳 Processar Pagamento]        │   │
│  │ [Ver Detalhes] [Fechar]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Mesa 8 | 📋 Pagar no Final       │   │
│  │ Maria Santos                     │   │
│  │ 2 pedidos | 18:00               │   │
│  │ R$ 120,00                       │   │
│  │ [Ver Detalhes] [Fechar]        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### **3. PROCESSAR PAGAMENTO (Pagar Agora)**
```
Comanda com "💳 Pagar Agora"
         ↓
Clique: "Processar Pagamento"
         ↓
Prompt: "Método de pagamento:"
         ↓
Digite: "cartao" (ou dinheiro/pix)
         ↓
Sistema:
✅ Registra pagamento
✅ Atualiza status da comanda
         ↓
Toast: "Pagamento processado!"
         ↓
Comanda pode ser fechada
```

#### **4. FECHAR COMANDA**
```
Clique: "Fechar"
         ↓
Confirma: "Deseja fechar esta comanda?"
         ↓
Sistema:
✅ Marca comanda como finalizada
✅ Remove da lista de ativas
         ↓
Toast: "Comanda fechada com sucesso!"
```

#### **5. DIFERENÇA: PAGAR AGORA vs PAGAR NO FINAL**

**💳 Pagar Agora:**
```
Cliente escolheu "Pagar Agora"
         ↓
Pedido é feito
         ↓
Garçom VÊ botão: "Processar Pagamento"
         ↓
Garçom processa pagamento ANTES de liberar
         ↓
Pedido vai para cozinha/bar APÓS pagamento
         ↓
Cliente recebe pedido
```

**📋 Pagar no Final:**
```
Cliente escolheu "Pagar no Final"
         ↓
Pedido é feito
         ↓
Pedido vai DIRETO para cozinha/bar
         ↓
Cliente consome
         ↓
Garçom fecha conta no final
         ↓
Cliente paga no caixa ou com garçom
```

---

## 👤 JORNADA DO CLIENTE

### **Perfil:** Cliente do Bar/Restaurante
**Acesso:** Via QR Code na mesa OU criando comanda

### **🚀 FLUXO COMPLETO**

#### **1. ENTRADA NO SISTEMA**

**Opção A: Escaneia QR Code da Mesa**
```
Cliente escaneia QR Code
         ↓
URL: http://localhost:3000/comanda/nova?mesa=5
         ↓
Sistema já sabe a mesa!
```

**Opção B: Acesso Direto**
```
Cliente acessa:
http://localhost:3000/comanda/nova
         ↓
Terá que escanear mesa depois
```

#### **2. CRIAR COMANDA**
```
┌─────────────────────────────────────────┐
│  🎫 Criar Comanda                       │
│  Informe seus dados para começar        │
├─────────────────────────────────────────┤
│  STEP 1: DADOS                          │
│  👤 Nome: [________________]            │
│  📱 Telefone: [________________]        │
│                                         │
│  [Continuar →]                          │
└─────────────────────────────────────────┘
         ↓
Preenche:
Nome: "João Silva"
Telefone: "(11) 99999-9999"
         ↓
Clique: "Continuar"
         ↓
┌─────────────────────────────────────────┐
│  💳 Como deseja pagar?                  │
│  Escolha antes de fazer seu pedido      │
├─────────────────────────────────────────┤
│  STEP 2: FORMA DE PAGAMENTO             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 💳 PAGAR AGORA                  │   │
│  │ O garçom virá com a maquininha  │   │
│  │ após confirmar o pedido         │   │
│  │ • Pagamento Imediato            │   │
│  │ • Pedido liberado após pagar    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📋 PAGAR NO FINAL               │   │
│  │ Feche a conta quando terminar   │   │
│  │ no caixa ou com o garçom        │   │
│  │ • Pagamento ao finalizar        │   │
│  │ • Pedido liberado imediatamente │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [← Voltar]                             │
└─────────────────────────────────────────┘
```

#### **3. ESCOLHA DE PAGAMENTO**

**Se escolher "💳 Pagar Agora":**
```
Clique: "Pagar Agora"
         ↓
Sistema:
✅ Cria comanda
✅ formaPagamento = "imediato"
✅ Salva no localStorage
         ↓
Toast: "Comanda criada! 💳 Pagar Agora"
         ↓
Redireciona para:
/cardapio?comanda=ABC123
```

**Se escolher "📋 Pagar no Final":**
```
Clique: "Pagar no Final"
         ↓
Sistema:
✅ Cria comanda
✅ formaPagamento = "final"
✅ Salva no localStorage
         ↓
Toast: "Comanda criada! 📋 Pagar no Final"
         ↓
Redireciona para:
/cardapio?comanda=ABC123
```

#### **4. ESCANEAR MESA (se não veio do QR)**
```
Se não veio do QR Code:
         ↓
/comanda/ABC123/mesa
         ↓
┌─────────────────────────────────────────┐
│  📱 Escaneie o QR Code da Mesa          │
│                                         │
│  [Abrir Câmera]                         │
│                                         │
│  OU                                     │
│                                         │
│  Digite o número da mesa: [___]         │
│  [Confirmar]                            │
└─────────────────────────────────────────┘
         ↓
Escaneia ou digita mesa
         ↓
Sistema associa comanda à mesa
         ↓
Redireciona para cardápio
```

#### **5. FAZER PEDIDO**
```
/cardapio?comanda=ABC123
         ↓
┌─────────────────────────────────────────┐
│  🍽️ Cardápio - Bar do Zé                │
│  Comanda: ABC123 | Mesa: 5              │
├─────────────────────────────────────────┤
│  CATEGORIAS:                            │
│  [🍹 Bebidas] [🍟 Porções] [🍽️ Pratos]  │
├─────────────────────────────────────────┤
│  PRODUTOS:                              │
│  ┌─────────────────────────────────┐   │
│  │ 🍺 Cerveja Heineken             │   │
│  │ Cerveja premium 330ml           │   │
│  │ R$ 12,00                        │   │
│  │ [- 0 +] [Adicionar]            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🍟 Porção de Batata             │   │
│  │ Batatas fritas 500g             │   │
│  │ R$ 25,00                        │   │
│  │ [- 0 +] [Adicionar]            │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  🛒 CARRINHO: 0 itens - R$ 0,00        │
│  [Ver Carrinho]                         │
└─────────────────────────────────────────┘
```

**Adicionar ao Carrinho:**
```
Clique: [+] (aumenta quantidade)
         ↓
Clique: "Adicionar"
         ↓
Item vai para o carrinho
         ↓
Carrinho atualiza: "2 itens - R$ 37,00"
```

#### **6. FINALIZAR PEDIDO**
```
Clique: "Ver Carrinho"
         ↓
┌─────────────────────────────────────────┐
│  🛒 Seu Carrinho                        │
├─────────────────────────────────────────┤
│  2x Cerveja Heineken    R$ 24,00       │
│  1x Batata Frita        R$ 25,00       │
├─────────────────────────────────────────┤
│  TOTAL: R$ 49,00                        │
│                                         │
│  Observações: [________________]        │
│                                         │
│  [Voltar] [Finalizar Pedido]           │
└─────────────────────────────────────────┘
         ↓
Clique: "Finalizar Pedido"
         ↓
Sistema:
✅ Cria pedido no banco
✅ Envia para cozinha/bar
✅ Notifica garçom
         ↓
Toast: "Pedido enviado!"
         ↓
Tela de acompanhamento
```

#### **7. ACOMPANHAR PEDIDO**
```
┌─────────────────────────────────────────┐
│  📋 Acompanhe seu Pedido                │
│  Comanda: ABC123 | Mesa: 5              │
├─────────────────────────────────────────┤
│  PEDIDO #001                            │
│  Status: 🔄 Em Preparo                  │
│                                         │
│  Itens:                                 │
│  • 2x Cerveja Heineken ✅ Pronto       │
│  • 1x Batata Frita 🔄 Preparando       │
│                                         │
│  Tempo estimado: 15 min                 │
└─────────────────────────────────────────┘
```

#### **8. DIFERENÇA NO FLUXO POR TIPO DE PAGAMENTO**

**Se escolheu "💳 Pagar Agora":**
```
Pedido finalizado
         ↓
Garçom recebe notificação
         ↓
Garçom VEM À MESA com maquininha
         ↓
Cliente paga
         ↓
Garçom confirma pagamento no sistema
         ↓
ENTÃO pedido vai para cozinha/bar
         ↓
Cliente aguarda
         ↓
Pedido fica pronto
         ↓
Garçom entrega
```

**Se escolheu "📋 Pagar no Final":**
```
Pedido finalizado
         ↓
Pedido vai DIRETO para cozinha/bar
         ↓
Cliente aguarda
         ↓
Pedido fica pronto
         ↓
Garçom entrega
         ↓
Cliente consome
         ↓
Cliente pode fazer mais pedidos
         ↓
Quando terminar:
Cliente pede a conta
         ↓
Vai ao caixa OU garçom traz conta
         ↓
Cliente paga tudo junto
```

---

## 👨‍🍳 JORNADA DA COZINHA

### **Perfil:** Cozinheiro
**Código de Acesso:** `COZINHA01`

### **🚀 FLUXO COMPLETO**

#### **1. LOGIN**
```
Digite: COZINHA01
         ↓
Redireciona para:
/cozinha
```

#### **2. KANBAN DA COZINHA**
```
┌─────────────────────────────────────────────────────────────┐
│  👨‍🍳 Cozinha                                                 │
│  Gerencie os pedidos de comida                              │
├─────────────────────────────────────────────────────────────┤
│  ESTATÍSTICAS:                                              │
│  🆕 Novos: 3 | 🔄 Em Preparo: 2 | ✅ Prontos: 1 | Total: 6  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │ 🆕 NOVOS  │  │🔄 EM PREP.│  │ ✅ PRONTOS │              │
│  │    (3)    │  │    (2)    │  │    (1)    │              │
│  ├───────────┤  ├───────────┤  ├───────────┤              │
│  │┌─────────┐│  │┌─────────┐│  │┌─────────┐│              │
│  ││Mesa 5   ││  ││Mesa 8   ││  ││Mesa 3   ││              │
│  ││⏱️ 2min  ││  ││⏱️ 12min ││  ││⏱️ 18min ││              │
│  ││         ││  ││         ││  ││         ││              │
│  ││1x Batata││  ││1x Feijo.││  ││1x Filé  ││              │
│  ││1x Filé  ││  ││         ││  ││         ││              │
│  ││         ││  ││         ││  ││         ││              │
│  ││[Iniciar]││  ││[Pronto] ││  ││         ││              │
│  │└─────────┘│  │└─────────┘│  │└─────────┘│              │
│  └───────────┘  └───────────┘  └───────────┘              │
└─────────────────────────────────────────────────────────────┘
```

#### **3. PROCESSAR PEDIDO**

**Novo Pedido Chega:**
```
Cliente faz pedido
         ↓
Sistema verifica categoria
         ↓
Se destino = COZINHA:
  Aparece na coluna "NOVOS"
         ↓
Cozinheiro vê:
┌─────────────┐
│ Mesa 5      │
│ ⏱️ 2min     │
│ 1x Batata   │
│ 1x Filé     │
│ [🔥 Iniciar]│
└─────────────┘
```

**Iniciar Preparo:**
```
Clique: "Iniciar Preparo"
         ↓
Sistema:
✅ Move para "EM PREPARO"
✅ Inicia timer
✅ Notifica garçom
         ↓
Card muda de coluna:
┌─────────────┐
│ Mesa 5      │
│ ⏱️ 5min     │
│ 1x Batata   │
│ 1x Filé     │
│ [✅ Pronto] │
└─────────────┘
```

**Marcar como Pronto:**
```
Pedido está pronto
         ↓
Clique: "Marcar como Pronto"
         ↓
Sistema:
✅ Move para "PRONTOS"
✅ Notifica garçom
✅ Para timer
         ↓
Garçom vê que está pronto
         ↓
Garçom busca e entrega ao cliente
```

#### **4. ALERTA DE URGÊNCIA**
```
Se pedido > 15 minutos:
         ↓
┌─────────────┐
│ Mesa 8 🔥   │ ← Ícone de fogo
│ ⏱️ 18min ❗ │ ← Tempo vermelho
│ 1x Feijoada │
│ [✅ Pronto] │
└─────────────┘
         ↓
Cozinheiro prioriza este pedido
```

---

## 🍹 JORNADA DO BAR

### **Perfil:** Barman
**Código de Acesso:** `BAR01`

### **🚀 FLUXO COMPLETO**

**Exatamente igual à Cozinha, mas:**
- Tema roxo/rosa (vs laranja/vermelho)
- Recebe apenas pedidos de BEBIDAS
- Urgência em 10min (vs 15min da cozinha)

```
┌─────────────────────────────────────────────────────────────┐
│  🍹 Bar                                                      │
│  Gerencie os pedidos de bebidas                             │
├─────────────────────────────────────────────────────────────┤
│  ESTATÍSTICAS:                                              │
│  🆕 Novos: 5 | 🔄 Em Preparo: 3 | ✅ Prontos: 2 | Total: 10 │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │ 🆕 NOVOS  │  │🔄 EM PREP.│  │ ✅ PRONTOS │              │
│  │    (5)    │  │    (3)    │  │    (2)    │              │
│  ├───────────┤  ├───────────┤  ├───────────┤              │
│  │┌─────────┐│  │┌─────────┐│  │┌─────────┐│              │
│  ││Mesa 3   ││  ││Mesa 7   ││  ││Mesa 2   ││              │
│  ││⏱️ 1min  ││  ││⏱️ 8min  ││  ││⏱️ 12min🔥│              │
│  ││         ││  ││         ││  ││         ││              │
│  ││2x Cervej││  ││1x Caipir││  ││3x Cervej││              │
│  ││1x Refrig││  ││         ││  ││         ││              │
│  ││         ││  ││         ││  ││         ││              │
│  ││[Iniciar]││  ││[Pronto] ││  ││         ││              │
│  │└─────────┘│  │└─────────┘│  │└─────────┘│              │
│  └───────────┘  └───────────┘  └───────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Diferença:** Bebidas são mais rápidas, então urgência em 10min!

---

## 💰 JORNADA DO CAIXA

### **Perfil:** Operador de Caixa
**Acesso:** Via `/caixa` (qualquer admin ou caixa)

### **🚀 FLUXO COMPLETO**

```
/caixa
         ↓
┌─────────────────────────────────────────┐
│  💰 Caixa                               │
│  Gerencie pagamentos e fechamentos      │
├─────────────────────────────────────────┤
│  ESTATÍSTICAS:                          │
│  📋 Pendentes: 8                        │
│  💰 Valor Total: R$ 850,00             │
│  📊 Ticket Médio: R$ 106,25            │
├─────────────────────────────────────────┤
│  COMANDAS AGUARDANDO PAGAMENTO:         │
│  ┌─────────────────────────────────┐   │
│  │ Mesa 8 | Individual #ABC123     │   │
│  │ Maria Santos                     │   │
│  │ (11) 98888-8888                 │   │
│  │ 3 pedido(s)                     │   │
│  │                                 │   │
│  │ R$ 120,00                       │   │
│  │                                 │   │
│  │ [Fechar Conta]                  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Fechar Conta:**
```
Clique: "Fechar Conta"
         ↓
Modal abre:
┌─────────────────────────────────────────┐
│  💰 Fechar Conta                        │
├─────────────────────────────────────────┤
│  CLIENTE:                               │
│  Maria Santos                           │
│  Mesa 8                                 │
├─────────────────────────────────────────┤
│  ITENS CONSUMIDOS:                      │
│  2x Cerveja Heineken    R$ 24,00       │
│  1x Batata Frita        R$ 25,00       │
│  1x Feijoada            R$ 45,00       │
├─────────────────────────────────────────┤
│  TOTAL: R$ 94,00                        │
├─────────────────────────────────────────┤
│  MÉTODO DE PAGAMENTO:                   │
│  [💵 Dinheiro] [💳 Cartão] [📱 PIX]    │
├─────────────────────────────────────────┤
│  [Cancelar] [Confirmar Pagamento]       │
└─────────────────────────────────────────┘
         ↓
Seleciona método
         ↓
Clique: "Confirmar Pagamento"
         ↓
Sistema:
✅ Registra pagamento
✅ Fecha comanda
✅ Remove da lista
         ↓
Toast: "Pagamento processado!"
```

---

## 🔐 COMO O SISTEMA DIFERENCIA OS PERFIS

### **1. NO LOGIN**

```typescript
// backend/src/controllers/auth.controller.ts

export const login = async (req, res) => {
  const { code } = req.body;
  
  // Busca usuário pelo código
  const usuario = await prisma.usuario.findUnique({
    where: { codigoAcesso: code }
  });
  
  // Verifica o TIPO do usuário
  const tipo = usuario.tipo; // 'admin', 'garcom', 'cozinha', 'bar'
  
  // Gera token JWT com o tipo
  const token = jwt.sign(
    { 
      id: usuario.id, 
      tipo: usuario.tipo  // ← IMPORTANTE!
    }, 
    JWT_SECRET
  );
  
  return res.json({ 
    token, 
    usuario: {
      nome: usuario.nome,
      tipo: usuario.tipo  // ← Envia para frontend
    }
  });
};
```

### **2. NO FRONTEND - REDIRECIONAMENTO**

```typescript
// frontend/app/auth/login/page.tsx

const handleLogin = async () => {
  const response = await fetch('/api/auth/login', {
    body: JSON.stringify({ code })
  });
  
  const { token, usuario } = await response.json();
  
  // Salva token
  localStorage.setItem('token', token);
  
  // REDIRECIONA BASEADO NO TIPO
  switch (usuario.tipo) {
    case 'admin':
      router.push('/admin/dashboard');  // ← Admin
      break;
    case 'garcom':
      router.push('/garcom');           // ← Garçom
      break;
    case 'cozinha':
      router.push('/cozinha');          // ← Cozinha
      break;
    case 'bar':
      router.push('/bar');              // ← Bar
      break;
    default:
      router.push('/');
  }
};
```

### **3. PROTEÇÃO DE ROTAS**

```typescript
// backend/src/middlewares/auth.middleware.ts

export const requireAdmin = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores.' 
    });
  }
  next();
};

export const requireGarcom = (req, res, next) => {
  if (req.user.tipo !== 'garcom') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas garçons.' 
    });
  }
  next();
};

// Uso nas rotas:
router.get('/admin/mesas', authMiddleware, requireAdmin, getMesas);
router.get('/garcom/comandas', authMiddleware, requireGarcom, getComandas);
```

### **4. FILTRO DE PEDIDOS POR DESTINO**

```typescript
// backend/src/controllers/cozinha.controller.ts

export const getPedidosCozinha = async (req, res) => {
  const pedidos = await prisma.pedido.findMany({
    where: {
      itens: {
        some: {
          produto: {
            categoria: {
              destino: 'COZINHA'  // ← Apenas cozinha
            }
          }
        }
      }
    }
  });
  
  return res.json(pedidos);
};

// backend/src/controllers/bar.controller.ts

export const getPedidosBar = async (req, res) => {
  const pedidos = await prisma.pedido.findMany({
    where: {
      itens: {
        some: {
          produto: {
            categoria: {
              destino: 'BAR'  // ← Apenas bar
            }
          }
        }
      }
    }
  });
  
  return res.json(pedidos);
};
```

### **5. RESUMO DA DIFERENCIAÇÃO**

```
┌─────────────────────────────────────────────────────────┐
│  COMO O SISTEMA SABE QUEM É QUEM?                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. CÓDIGO DE ACESSO                                    │
│     ADMIN2026 → tipo: 'admin'                          │
│     GARCOM01  → tipo: 'garcom'                         │
│     COZINHA01 → tipo: 'cozinha'                        │
│     BAR01     → tipo: 'bar'                            │
│                                                         │
│  2. JWT TOKEN                                           │
│     { id: '123', tipo: 'admin' }                       │
│     ↓                                                   │
│     Cada requisição envia o token                      │
│     Backend verifica o tipo                            │
│                                                         │
│  3. REDIRECIONAMENTO                                    │
│     Admin    → /admin/dashboard                        │
│     Garçom   → /garcom                                 │
│     Cozinha  → /cozinha                                │
│     Bar      → /bar                                    │
│                                                         │
│  4. FILTROS DE DADOS                                    │
│     Cozinha vê: destino = 'COZINHA'                   │
│     Bar vê:     destino = 'BAR'                       │
│     Garçom vê:  TODAS as comandas                     │
│     Admin vê:   TUDO                                  │
│                                                         │
│  5. PERMISSÕES                                          │
│     Middlewares verificam tipo antes de permitir       │
│     acesso às rotas protegidas                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 TABELA COMPARATIVA

| Perfil | Código | Rota | Vê | Pode Fazer |
|--------|--------|------|-----|-----------|
| **Admin** | ADMIN2026 | /admin/dashboard | Tudo | Gerenciar mesas, usuários, produtos, relatórios |
| **Garçom** | GARCOM01 | /garcom | Comandas ativas | Processar pagamentos, fechar comandas |
| **Cozinha** | COZINHA01 | /cozinha | Pedidos de comida | Iniciar preparo, marcar como pronto |
| **Bar** | BAR01 | /bar | Pedidos de bebidas | Iniciar preparo, marcar como pronto |
| **Caixa** | (Admin) | /caixa | Comandas pendentes | Fechar contas, processar pagamentos |
| **Cliente** | - | /comanda/nova | Cardápio | Criar comanda, fazer pedidos |

---

**FIM DO GUIA DE JORNADAS** 🎉
