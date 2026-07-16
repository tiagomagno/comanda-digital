-- CreateEnum
CREATE TYPE "TipoCupom" AS ENUM ('percentual', 'fixo');

-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('cliente', 'garcom', 'entregador', 'cozinha', 'bar', 'admin', 'superadmin');

-- CreateEnum
CREATE TYPE "StatusEntregador" AS ENUM ('offline', 'online', 'pausado', 'em_corrida');

-- CreateEnum
CREATE TYPE "DestinoCategoria" AS ENUM ('BAR', 'COZINHA');

-- CreateEnum
CREATE TYPE "StatusComanda" AS ENUM ('ativa', 'aguardando_pagamento', 'paga', 'finalizada', 'cancelada');

-- CreateEnum
CREATE TYPE "TipoComanda" AS ENUM ('mesa', 'individual', 'delivery');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('imediato', 'final');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('criado', 'aguardando_pagamento', 'pago', 'em_preparo', 'pronto', 'em_expedicao', 'entregue', 'cancelado');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');

-- CreateEnum
CREATE TYPE "ProvedorGateway" AS ENUM ('mercadopago', 'pagarme', 'asaas', 'stripe');

-- CreateEnum
CREATE TYPE "StatusCorrida" AS ENUM ('oferecida', 'aceita', 'recusada', 'em_coleta', 'coletada', 'em_entrega', 'entregue', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusTransacao" AS ENUM ('pendente', 'processando', 'pago', 'falhou', 'reembolsado', 'cancelado', 'chargeback');

-- CreateEnum
CREATE TYPE "StatusPagamentoParcial" AS ENUM ('pendente', 'pago', 'erro');

-- CreateEnum
CREATE TYPE "TipoCanal" AS ENUM ('whatsapp', 'ifood', 'rappi', 'instagram', 'site_proprio', 'telefone', 'generico');

-- CreateEnum
CREATE TYPE "TipoAutomacao" AS ENUM ('apos_entrega', 'cliente_inativo');

-- CreateEnum
CREATE TYPE "StatusFilaEspera" AS ENUM ('aguardando', 'chamado', 'sentado', 'cancelado');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('pendente', 'confirmada', 'cancelada', 'concluida');

-- CreateTable
CREATE TABLE "estabelecimentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "opera_local" BOOLEAN NOT NULL DEFAULT false,
    "opera_hospedado" BOOLEAN NOT NULL DEFAULT false,
    "opera_delivery" BOOLEAN NOT NULL DEFAULT false,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "configuracoes" JSONB NOT NULL DEFAULT '{}',
    "lotacao_maxima" INTEGER,
    "permite_comanda_individual" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estabelecimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupons" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoCupom" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "valor_minimo" DECIMAL(10,2),
    "uso_maximo" INTEGER,
    "uso_atual" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "senha_hash" TEXT,
    "codigo_acesso" TEXT,
    "tipo" "TipoUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "status_entregador" "StatusEntregador",
    "ultimo_acesso" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL DEFAULT 4,
    "qr_code_url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_mesa" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "capacidade_total" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesa_grupo" (
    "id" TEXT NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "mesa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mesa_grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "destino" "DestinoCategoria" NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#3b82f6',
    "icone" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "codigo" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "preco_promocional" DECIMAL(10,2),
    "imagem_url" TEXT,
    "video_url" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "estoque_controlado" BOOLEAN NOT NULL DEFAULT false,
    "quantidade_estoque" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adicional_grupos" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "min_selecoes" INTEGER NOT NULL DEFAULT 0,
    "max_selecoes" INTEGER NOT NULL DEFAULT 1,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "adicional_grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adicionais" (
    "id" TEXT NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_item_adicionais" (
    "id" TEXT NOT NULL,
    "pedido_item_id" TEXT NOT NULL,
    "adicional_id" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_item_adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comandas" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "mesa_id" TEXT,
    "codigo" TEXT NOT NULL,
    "nome_cliente" TEXT NOT NULL,
    "telefone_cliente" TEXT NOT NULL,
    "email_cliente" TEXT,
    "mesa" TEXT,
    "tipo_comanda" "TipoComanda" NOT NULL DEFAULT 'individual',
    "forma_pagamento" "FormaPagamento",
    "status" "StatusComanda" NOT NULL DEFAULT 'ativa',
    "total_estimado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "qr_code_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "finalizada_at" TIMESTAMP(3),
    "cancelada_at" TIMESTAMP(3),
    "cliente_id" TEXT,
    "endereco_entrega_id" TEXT,
    "taxa_entrega" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "metodo_pagamento" TEXT,
    "cupom_id" TEXT,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "grupoMesaId" TEXT,

    CONSTRAINT "comandas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "comanda_id" TEXT NOT NULL,
    "numero_pedido" INTEGER NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'criado',
    "destino" "DestinoCategoria",
    "total" DECIMAL(10,2) NOT NULL,
    "observacoes" TEXT,
    "aprovado_por" TEXT,
    "aprovado_at" TIMESTAMP(3),
    "metodo_pagamento" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pago_at" TIMESTAMP(3),
    "em_preparo_at" TIMESTAMP(3),
    "pronto_at" TIMESTAMP(3),
    "em_expedicao_at" TIMESTAMP(3),
    "entregue_at" TIMESTAMP(3),
    "cancelado_at" TIMESTAMP(3),

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_status_pedido" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "status_anterior" TEXT,
    "status_novo" TEXT NOT NULL,
    "usuario_id" TEXT,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_status_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "senha" TEXT,
    "cpf" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enderecos_cliente" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "referencia" TEXT,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enderecos_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "stripe_price_id" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "features" JSONB NOT NULL DEFAULT '{}',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "plano_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'trialing',
    "trial_ends_at" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credenciais_gateway" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "provedor" "ProvedorGateway" NOT NULL,
    "public_key" TEXT,
    "secret_key" TEXT,
    "webhook_secret" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credenciais_gateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_cadastro_leads" (
    "id" TEXT NOT NULL,
    "nome_estabelecimento" TEXT NOT NULL,
    "nome_gestor" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "plano_id" TEXT,
    "token" TEXT NOT NULL,
    "convertido" BOOLEAN NOT NULL DEFAULT false,
    "utm_source" TEXT,
    "utm_campaign" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_cadastro_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corridas" (
    "id" TEXT NOT NULL,
    "comanda_id" TEXT NOT NULL,
    "entregador_id" TEXT NOT NULL,
    "status" "StatusCorrida" NOT NULL DEFAULT 'oferecida',
    "observacoes" TEXT,
    "oferecida_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aceita_at" TIMESTAMP(3),
    "em_coleta_at" TIMESTAMP(3),
    "coletada_at" TIMESTAMP(3),
    "em_entrega_at" TIMESTAMP(3),
    "entrega_at" TIMESTAMP(3),
    "cancelada_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corridas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localizacao_entregadores" (
    "id" TEXT NOT NULL,
    "entregador_id" TEXT NOT NULL,
    "lat" DECIMAL(10,7) NOT NULL,
    "lng" DECIMAL(10,7) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "localizacao_entregadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL,
    "comanda_id" TEXT NOT NULL,
    "pedido_id" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "StatusTransacao" NOT NULL DEFAULT 'pendente',
    "metodo" TEXT,
    "provedor" TEXT,
    "provider_id" TEXT,
    "observacao" TEXT,
    "criado_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_parciais" (
    "id" TEXT NOT NULL,
    "comanda_id" TEXT NOT NULL,
    "telefone_cliente" TEXT NOT NULL,
    "nome_cliente" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "metodo_pagamento" TEXT,
    "status" "StatusPagamentoParcial" NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_parciais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "comanda_id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "nota_atendimento" INTEGER NOT NULL,
    "nota_comida" INTEGER NOT NULL,
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canais_externos" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoCanal" NOT NULL,
    "webhook_secret" TEXT,
    "configuracoes" JSONB NOT NULL DEFAULT '{}',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canais_externos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_externos" (
    "id" TEXT NOT NULL,
    "canal_id" TEXT NOT NULL,
    "comanda_id" TEXT,
    "external_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'recebido',
    "payload" JSONB NOT NULL,
    "erro_mensagem" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_externos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regras_automacao" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoAutomacao" NOT NULL,
    "delay_minutos" INTEGER NOT NULL DEFAULT 30,
    "dias_inatividade" INTEGER,
    "acao" JSONB NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regras_automacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execucoes_automacao" (
    "id" TEXT NOT NULL,
    "regra_id" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "resultado" JSONB,
    "criado_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execucoes_automacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filas_espera" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "nome_cliente" TEXT NOT NULL,
    "telefone" TEXT,
    "quantidade_pessoas" INTEGER NOT NULL,
    "status" "StatusFilaEspera" NOT NULL DEFAULT 'aguardando',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filas_espera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "nome_cliente" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "quantidade_pessoas" INTEGER NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "status" "StatusReserva" NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estabelecimentos_cnpj_key" ON "estabelecimentos"("cnpj");

-- CreateIndex
CREATE INDEX "cupons_estabelecimento_id_idx" ON "cupons"("estabelecimento_id");

-- CreateIndex
CREATE UNIQUE INDEX "cupons_estabelecimento_id_codigo_key" ON "cupons"("estabelecimento_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_codigo_acesso_key" ON "usuarios"("codigo_acesso");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_estabelecimento_id_numero_key" ON "mesas"("estabelecimento_id", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "mesa_grupo_grupo_id_mesa_id_key" ON "mesa_grupo"("grupo_id", "mesa_id");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_estabelecimento_id_nome_key" ON "categorias"("estabelecimento_id", "nome");

-- CreateIndex
CREATE INDEX "adicional_grupos_produto_id_idx" ON "adicional_grupos"("produto_id");

-- CreateIndex
CREATE INDEX "adicionais_grupo_id_idx" ON "adicionais"("grupo_id");

-- CreateIndex
CREATE INDEX "pedido_item_adicionais_pedido_item_id_idx" ON "pedido_item_adicionais"("pedido_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "comandas_codigo_key" ON "comandas"("codigo");

-- CreateIndex
CREATE INDEX "comandas_estabelecimento_id_idx" ON "comandas"("estabelecimento_id");

-- CreateIndex
CREATE INDEX "comandas_mesa_id_idx" ON "comandas"("mesa_id");

-- CreateIndex
CREATE INDEX "comandas_status_idx" ON "comandas"("status");

-- CreateIndex
CREATE INDEX "comandas_codigo_idx" ON "comandas"("codigo");

-- CreateIndex
CREATE INDEX "comandas_created_at_idx" ON "comandas"("created_at");

-- CreateIndex
CREATE INDEX "comandas_cliente_id_idx" ON "comandas"("cliente_id");

-- CreateIndex
CREATE INDEX "pedidos_comanda_id_idx" ON "pedidos"("comanda_id");

-- CreateIndex
CREATE INDEX "pedidos_status_idx" ON "pedidos"("status");

-- CreateIndex
CREATE INDEX "pedidos_destino_idx" ON "pedidos"("destino");

-- CreateIndex
CREATE INDEX "pedidos_created_at_idx" ON "pedidos"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_comanda_id_numero_pedido_key" ON "pedidos"("comanda_id", "numero_pedido");

-- CreateIndex
CREATE INDEX "pedido_itens_pedido_id_idx" ON "pedido_itens"("pedido_id");

-- CreateIndex
CREATE INDEX "pedido_itens_produto_id_idx" ON "pedido_itens"("produto_id");

-- CreateIndex
CREATE INDEX "historico_status_pedido_pedido_id_idx" ON "historico_status_pedido"("pedido_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_estabelecimento_id_telefone_key" ON "clientes"("estabelecimento_id", "telefone");

-- CreateIndex
CREATE INDEX "enderecos_cliente_cliente_id_idx" ON "enderecos_cliente"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "assinaturas_estabelecimento_id_key" ON "assinaturas"("estabelecimento_id");

-- CreateIndex
CREATE INDEX "assinaturas_estabelecimento_id_idx" ON "assinaturas"("estabelecimento_id");

-- CreateIndex
CREATE INDEX "assinaturas_plano_id_idx" ON "assinaturas"("plano_id");

-- CreateIndex
CREATE UNIQUE INDEX "credenciais_gateway_estabelecimento_id_provedor_key" ON "credenciais_gateway"("estabelecimento_id", "provedor");

-- CreateIndex
CREATE UNIQUE INDEX "pre_cadastro_leads_email_key" ON "pre_cadastro_leads"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pre_cadastro_leads_token_key" ON "pre_cadastro_leads"("token");

-- CreateIndex
CREATE UNIQUE INDEX "corridas_comanda_id_key" ON "corridas"("comanda_id");

-- CreateIndex
CREATE INDEX "corridas_entregador_id_idx" ON "corridas"("entregador_id");

-- CreateIndex
CREATE INDEX "corridas_status_idx" ON "corridas"("status");

-- CreateIndex
CREATE INDEX "localizacao_entregadores_entregador_id_idx" ON "localizacao_entregadores"("entregador_id");

-- CreateIndex
CREATE INDEX "transacoes_comanda_id_idx" ON "transacoes"("comanda_id");

-- CreateIndex
CREATE INDEX "transacoes_status_idx" ON "transacoes"("status");

-- CreateIndex
CREATE INDEX "transacoes_provider_id_idx" ON "transacoes"("provider_id");

-- CreateIndex
CREATE INDEX "transacoes_pedido_id_idx" ON "transacoes"("pedido_id");

-- CreateIndex
CREATE INDEX "pagamentos_parciais_comanda_id_idx" ON "pagamentos_parciais"("comanda_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_comanda_id_key" ON "avaliacoes"("comanda_id");

-- CreateIndex
CREATE INDEX "avaliacoes_comanda_id_idx" ON "avaliacoes"("comanda_id");

-- CreateIndex
CREATE INDEX "avaliacoes_estabelecimento_id_idx" ON "avaliacoes"("estabelecimento_id");

-- CreateIndex
CREATE INDEX "avaliacoes_usuario_id_idx" ON "avaliacoes"("usuario_id");

-- CreateIndex
CREATE INDEX "canais_externos_estabelecimento_id_idx" ON "canais_externos"("estabelecimento_id");

-- CreateIndex
CREATE INDEX "pedidos_externos_canal_id_idx" ON "pedidos_externos"("canal_id");

-- CreateIndex
CREATE INDEX "pedidos_externos_external_id_idx" ON "pedidos_externos"("external_id");

-- CreateIndex
CREATE INDEX "regras_automacao_estabelecimento_id_idx" ON "regras_automacao"("estabelecimento_id");

-- CreateIndex
CREATE INDEX "execucoes_automacao_regra_id_idx" ON "execucoes_automacao"("regra_id");

-- CreateIndex
CREATE INDEX "execucoes_automacao_referencia_idx" ON "execucoes_automacao"("referencia");

-- CreateIndex
CREATE INDEX "filas_espera_estabelecimento_id_idx" ON "filas_espera"("estabelecimento_id");

-- CreateIndex
CREATE INDEX "filas_espera_status_idx" ON "filas_espera"("status");

-- CreateIndex
CREATE INDEX "reservas_estabelecimento_id_idx" ON "reservas"("estabelecimento_id");

-- CreateIndex
CREATE INDEX "reservas_data_hora_idx" ON "reservas"("data_hora");

-- CreateIndex
CREATE INDEX "reservas_status_idx" ON "reservas"("status");

-- AddForeignKey
ALTER TABLE "cupons" ADD CONSTRAINT "cupons_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_mesa" ADD CONSTRAINT "grupos_mesa_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesa_grupo" ADD CONSTRAINT "mesa_grupo_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos_mesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesa_grupo" ADD CONSTRAINT "mesa_grupo_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adicional_grupos" ADD CONSTRAINT "adicional_grupos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adicionais" ADD CONSTRAINT "adicionais_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "adicional_grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_item_adicionais" ADD CONSTRAINT "pedido_item_adicionais_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_item_adicionais" ADD CONSTRAINT "pedido_item_adicionais_adicional_id_fkey" FOREIGN KEY ("adicional_id") REFERENCES "adicionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_grupoMesaId_fkey" FOREIGN KEY ("grupoMesaId") REFERENCES "grupos_mesa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_endereco_entrega_id_fkey" FOREIGN KEY ("endereco_entrega_id") REFERENCES "enderecos_cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_cupom_id_fkey" FOREIGN KEY ("cupom_id") REFERENCES "cupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status_pedido" ADD CONSTRAINT "historico_status_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status_pedido" ADD CONSTRAINT "historico_status_pedido_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enderecos_cliente" ADD CONSTRAINT "enderecos_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credenciais_gateway" ADD CONSTRAINT "credenciais_gateway_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corridas" ADD CONSTRAINT "corridas_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corridas" ADD CONSTRAINT "corridas_entregador_id_fkey" FOREIGN KEY ("entregador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "localizacao_entregadores" ADD CONSTRAINT "localizacao_entregadores_entregador_id_fkey" FOREIGN KEY ("entregador_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_parciais" ADD CONSTRAINT "pagamentos_parciais_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canais_externos" ADD CONSTRAINT "canais_externos_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_externos" ADD CONSTRAINT "pedidos_externos_canal_id_fkey" FOREIGN KEY ("canal_id") REFERENCES "canais_externos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_externos" ADD CONSTRAINT "pedidos_externos_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regras_automacao" ADD CONSTRAINT "regras_automacao_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucoes_automacao" ADD CONSTRAINT "execucoes_automacao_regra_id_fkey" FOREIGN KEY ("regra_id") REFERENCES "regras_automacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filas_espera" ADD CONSTRAINT "filas_espera_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
