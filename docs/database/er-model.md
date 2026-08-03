# Modelo Entidade-Relacionamento — Dine

> Fonte: `backend/prisma/schema.prisma` | Atualizado em: 2026-06-30

---

## Diagrama ER (Mermaid)

```mermaid
erDiagram
    Estabelecimento {
        string id PK
        string nome
        boolean operaLocal
        boolean operaHospedado
        boolean operaDelivery
        string cnpj UK
        string telefone
        string email
        string endereco
        string cidade
        string estado
        string cep
        json configuracoes
        int lotacaoMaxima
        boolean permiteCmdIndiv
        boolean ativo
        datetime createdAt
        datetime updatedAt
    }

    Usuario {
        string id PK
        string estabelecimentoId FK
        string nome
        string telefone
        string email UK
        string senhaHash
        string codigoAcesso UK
        TipoUsuario tipo
        boolean ativo
        StatusEntregador statusEntregador
        datetime ultimoAcesso
    }

    Mesa {
        string id PK
        string estabelecimentoId FK
        string numero
        int capacidade
        string qrCodeUrl
        boolean ativo
    }

    GrupoMesa {
        string id PK
        string estabelecimentoId FK
        string nome
        int capacidadeTotal
        boolean ativo
    }

    MesaGrupo {
        string id PK
        string grupoId FK
        string mesaId FK
    }

    Categoria {
        string id PK
        string estabelecimentoId FK
        string nome
        string descricao
        DestinoCategoria destino
        string cor
        string icone
        int ordem
        boolean ativo
    }

    Produto {
        string id PK
        string categoriaId FK
        string codigo
        string nome
        string descricao
        decimal preco
        decimal precoPromocional
        string imagemUrl
        string videoUrl
        boolean disponivel
        boolean destaque
        int ordem
        boolean estoqueControlado
        int quantidadeEstoque
    }

    AdicionalGrupo {
        string id PK
        string produtoId FK
        string nome
        boolean obrigatorio
        int minSelecoes
        int maxSelecoes
        int ordem
    }

    Adicional {
        string id PK
        string grupoId FK
        string nome
        decimal preco
        boolean disponivel
        int ordem
    }

    Comanda {
        string id PK
        string estabelecimentoId FK
        string mesaId FK
        string grupoMesaId FK
        string clienteId FK
        string enderecoEntregaId FK
        string cupomId FK
        string codigo UK
        string nomeCliente
        string telefoneCliente
        string emailCliente
        TipoComanda tipoComanda
        FormaPagamento formaPagamento
        StatusComanda status
        decimal totalEstimado
        decimal taxaEntrega
        decimal desconto
        string metodoPagamento
        string observacoes
        string qrCodeUrl
        datetime finalizadaAt
        datetime canceladaAt
    }

    Pedido {
        string id PK
        string comandaId FK
        int numeroPedido
        StatusPedido status
        DestinoCategoria destino
        decimal total
        string observacoes
        string aprovadoPor
        datetime aprovadoAt
        datetime pagoAt
        datetime emPreparoAt
        datetime prontoAt
        datetime emExpedicaoAt
        datetime entregueAt
        datetime canceladoAt
    }

    PedidoItem {
        string id PK
        string pedidoId FK
        string produtoId FK
        int quantidade
        decimal precoUnitario
        decimal subtotal
        string observacoes
    }

    PedidoItemAdicional {
        string id PK
        string pedidoItemId FK
        string adicionalId FK
        decimal preco
    }

    HistoricoStatusPedido {
        string id PK
        string pedidoId FK
        string usuarioId FK
        string statusAnterior
        string statusNovo
        string observacao
    }

    Cliente {
        string id PK
        string estabelecimentoId FK
        string nome
        string telefone
        string email
        string senha
        string cpf
    }

    EnderecoCliente {
        string id PK
        string clienteId FK
        string cep
        string logradouro
        string numero
        string complemento
        string bairro
        string cidade
        string estado
        string referencia
        boolean padrao
    }

    Plano {
        string id PK
        string nome
        string stripePriceId
        decimal preco
        json features
        boolean ativo
    }

    Assinatura {
        string id PK
        string estabelecimentoId FK UK
        string planoId FK
        string stripeSubscriptionId
        StatusAssinatura status
        datetime trialEndsAt
        datetime currentPeriodEnd
    }

    CredencialGateway {
        string id PK
        string estabelecimentoId FK
        ProvedorGateway provedor
        string publicKey
        string secretKey
        string webhookSecret
        boolean ativo
    }

    Transacao {
        string id PK
        string comandaId FK
        decimal valor
        StatusTransacao status
        string metodo
        string provedor
        string providerId
        string observacao
    }

    PagamentoParcial {
        string id PK
        string comandaId FK
        string telefoneCliente
        string nomeCliente
        decimal valor
        string metodoPagamento
        StatusPagamentoParcial status
    }

    Avaliacao {
        string id PK
        string comandaId FK UK
        string estabelecimentoId FK
        string usuarioId FK
        int notaAtendimento
        int notaComida
        string comentario
    }

    Corrida {
        string id PK
        string comandaId FK UK
        string entregadorId FK
        StatusCorrida status
        datetime oferecidaAt
        datetime aceitaAt
        datetime emColetaAt
        datetime coletadaAt
        datetime emEntregaAt
        datetime entregaAt
        datetime canceladaAt
    }

    LocalizacaoEntregador {
        string id PK
        string entregadorId FK
        decimal lat
        decimal lng
    }

    Cupom {
        string id PK
        string estabelecimentoId FK
        string codigo
        TipoCupom tipo
        decimal valor
        decimal valorMinimo
        int usoMaximo
        int usoAtual
        boolean ativo
        datetime dataInicio
        datetime dataFim
    }

    CanalExterno {
        string id PK
        string estabelecimentoId FK
        string nome
        TipoCanal tipo
        string webhookSecret
        json configuracoes
        boolean ativo
    }

    PedidoExterno {
        string id PK
        string canalId FK
        string comandaId FK
        string externalId
        string status
        json payload
        string erroMensagem
    }

    RegraAutomacao {
        string id PK
        string estabelecimentoId FK
        string nome
        TipoAutomacao tipo
        int delayMinutos
        int diasInatividade
        json acao
        boolean ativo
    }

    ExecucaoAutomacao {
        string id PK
        string regraId FK
        string referencia
        string status
        json resultado
    }

    FilaEspera {
        string id PK
        string estabelecimentoId FK
        string nomeCliente
        string telefone
        int quantidadePessoas
        StatusFilaEspera status
    }

    Reserva {
        string id PK
        string estabelecimentoId FK
        string nomeCliente
        string telefone
        int quantidadePessoas
        datetime dataHora
        string observacoes
        StatusReserva status
    }

    PreCadastroLead {
        string id PK
        string nomeEstabelecimento
        string nomeGestor
        string email UK
        string telefone
        string planoId
        string token UK
        boolean convertido
        string utmSource
        string utmCampaign
    }

    %% Relacionamentos
    Estabelecimento ||--o{ Usuario : "tem"
    Estabelecimento ||--o{ Mesa : "tem"
    Estabelecimento ||--o{ GrupoMesa : "tem"
    Estabelecimento ||--o{ Categoria : "tem"
    Estabelecimento ||--o{ Comanda : "tem"
    Estabelecimento ||--o{ Cliente : "tem"
    Estabelecimento ||--o| Assinatura : "tem"
    Estabelecimento ||--o{ CredencialGateway : "tem"
    Estabelecimento ||--o{ Avaliacao : "tem"
    Estabelecimento ||--o{ FilaEspera : "tem"
    Estabelecimento ||--o{ Reserva : "tem"
    Estabelecimento ||--o{ Cupom : "tem"
    Estabelecimento ||--o{ RegraAutomacao : "tem"
    Estabelecimento ||--o{ CanalExterno : "tem"

    Mesa ||--o{ Comanda : "tem"
    Mesa }o--o{ GrupoMesa : "pertence (MesaGrupo)"
    GrupoMesa ||--o{ MesaGrupo : "contém"
    Mesa ||--o{ MesaGrupo : "pertence"

    Categoria ||--o{ Produto : "tem"
    Produto ||--o{ AdicionalGrupo : "tem"
    AdicionalGrupo ||--o{ Adicional : "tem"

    Comanda ||--o{ Pedido : "tem"
    Comanda ||--o{ PagamentoParcial : "tem"
    Comanda ||--o| Avaliacao : "tem"
    Comanda ||--o{ Transacao : "tem"
    Comanda ||--o| Corrida : "tem"
    Comanda ||--o{ PedidoExterno : "tem"
    Comanda }o--|| Cliente : "pertence"
    Comanda }o--|| EnderecoCliente : "usa"
    Comanda }o--|| Cupom : "usa"

    Pedido ||--o{ PedidoItem : "tem"
    Pedido ||--o{ HistoricoStatusPedido : "tem"
    PedidoItem ||--o{ PedidoItemAdicional : "tem"
    PedidoItem }o--|| Produto : "referencia"
    PedidoItemAdicional }o--|| Adicional : "referencia"
    HistoricoStatusPedido }o--|| Usuario : "registrado por"

    Cliente ||--o{ EnderecoCliente : "tem"

    Plano ||--o{ Assinatura : "tem"

    Corrida }o--|| Usuario : "entregador"
    LocalizacaoEntregador }o--|| Usuario : "de"

    CanalExterno ||--o{ PedidoExterno : "tem"

    RegraAutomacao ||--o{ ExecucaoAutomacao : "tem"
```

---

## Descrição das Entidades

### Núcleo Operacional

**Estabelecimento** — Tenant principal. Cada restaurante/bar é um estabelecimento. Suporta 3 modos de operação: local (salão), hospedado (hotel/evento) e delivery.

**Usuario** — Unifica todos os papéis: cliente, garcom, entregador, cozinha, bar, admin, superadmin. O campo `tipo` determina permissões.

**Mesa** — Mesa física com QR Code gerado automaticamente. Vinculada ao estabelecimento.

**GrupoMesa / MesaGrupo** — Permite agrupar mesas para eventos ou festas. Relação N:M entre GrupoMesa e Mesa.

### Cardápio

**Categoria** — Organiza produtos com destino (BAR ou COZINHA). Controla para onde o pedido é roteado.

**Produto** — Item do cardápio. Suporta preço promocional, imagem, vídeo, controle de estoque.

**AdicionalGrupo / Adicional** — Permite configurar opcionais e adicionais por produto (ex: "ponto da carne", "tipo de molho").

### Comanda e Pedido

**Comanda** — Sessão de consumo. Pode ser tipo: mesa (vinculada a uma mesa), individual (sem mesa, por código) ou delivery (com endereço).

**Pedido** — Agrupamento de itens dentro de uma comanda. Um cliente pode fazer múltiplos pedidos na mesma comanda.

**PedidoItem** — Item individual do pedido com quantidade, preço unitário e subtotal.

**PedidoItemAdicional** — Adicionais selecionados para um item específico.

**HistoricoStatusPedido** — Auditoria completa de todas as transições de status de cada pedido.

### CRM e Delivery

**Cliente** — Cliente cadastrado no delivery. Identificado por telefone dentro do estabelecimento.

**EnderecoCliente** — Endereços salvos do cliente para delivery.

**Corrida** — Corrida de entrega. Vincula comanda ao entregador com status detalhado.

**LocalizacaoEntregador** — Histórico de posições GPS do entregador.

### SaaS / Financeiro

**Plano** — Planos da plataforma (Start, Growth, Scale). Tem stripePriceId para integração Stripe.

**Assinatura** — Assinatura SaaS do estabelecimento. Mapeada 1:1 com o estabelecimento. Status controlado por webhooks Stripe.

**CredencialGateway** — Chaves BYOG do lojista (MercadoPago, Pagar.me, etc.) criptografadas.

**Transacao** — Registro de transações de pagamento (tanto SaaS quanto BYOG).

**PagamentoParcial** — Divisão de conta entre comensais de uma mesma comanda.

**PreCadastroLead** — Lead capturado na landing page antes do cadastro completo.

### Módulos Avançados

**Avaliacao** — Avaliação pós-consumo com notas de atendimento e comida.

**Cupom** — Cupons de desconto (percentual ou fixo) com controle de uso e validade.

**CanalExterno / PedidoExterno** — Integração omnichannel (iFood, WhatsApp, Rappi, etc.) via webhooks.

**RegraAutomacao / ExecucaoAutomacao** — Automação de marketing pós-consumo (envio de avaliação, cupom, mensagem).

**FilaEspera / Reserva** — Módulo de recepção para gestão de fila e reservas.

---

## Status Enums

```
StatusComanda:     ativa → aguardando_pagamento → paga → finalizada | cancelada
StatusPedido:      criado → aguardando_pagamento → pago → em_preparo → pronto → em_expedicao → entregue | cancelado
StatusAssinatura:  trialing → active | past_due → canceled | unpaid | paused
StatusCorrida:     oferecida → aceita → em_coleta → coletada → em_entrega → entregue | recusada | cancelada
StatusTransacao:   pendente → processando → pago | falhou | reembolsado | cancelado | chargeback
```
