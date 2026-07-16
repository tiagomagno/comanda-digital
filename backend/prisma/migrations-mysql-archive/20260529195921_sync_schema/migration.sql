-- AlterTable
ALTER TABLE `comandas` MODIFY `metodo_pagamento` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `planos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `stripe_price_id` VARCHAR(191) NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `features` JSON NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assinaturas` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `plano_id` VARCHAR(191) NOT NULL,
    `stripe_subscription_id` VARCHAR(191) NULL,
    `status` ENUM('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused') NOT NULL DEFAULT 'trialing',
    `trial_ends_at` DATETIME(3) NULL,
    `current_period_end` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assinaturas_estabelecimento_id_key`(`estabelecimento_id`),
    INDEX `assinaturas_estabelecimento_id_idx`(`estabelecimento_id`),
    INDEX `assinaturas_plano_id_idx`(`plano_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credenciais_gateway` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `provedor` ENUM('mercadopago', 'pagarme', 'asaas', 'stripe') NOT NULL,
    `public_key` VARCHAR(191) NULL,
    `secret_key` VARCHAR(191) NULL,
    `webhook_secret` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `credenciais_gateway_estabelecimento_id_provedor_key`(`estabelecimento_id`, `provedor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pre_cadastro_leads` (
    `id` VARCHAR(191) NOT NULL,
    `nome_estabelecimento` VARCHAR(191) NOT NULL,
    `nome_gestor` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `plano_id` VARCHAR(191) NULL,
    `token` VARCHAR(191) NOT NULL,
    `convertido` BOOLEAN NOT NULL DEFAULT false,
    `utm_source` VARCHAR(191) NULL,
    `utm_campaign` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pre_cadastro_leads_email_key`(`email`),
    UNIQUE INDEX `pre_cadastro_leads_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos_parciais` (
    `id` VARCHAR(191) NOT NULL,
    `comanda_id` VARCHAR(191) NOT NULL,
    `telefone_cliente` VARCHAR(191) NOT NULL,
    `nome_cliente` VARCHAR(191) NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `metodo_pagamento` VARCHAR(191) NULL,
    `status` ENUM('pendente', 'pago', 'erro') NOT NULL DEFAULT 'pendente',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pagamentos_parciais_comanda_id_idx`(`comanda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacoes` (
    `id` VARCHAR(191) NOT NULL,
    `comanda_id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NULL,
    `nota_atendimento` INTEGER NOT NULL,
    `nota_comida` INTEGER NOT NULL,
    `comentario` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `avaliacoes_comanda_id_key`(`comanda_id`),
    INDEX `avaliacoes_comanda_id_idx`(`comanda_id`),
    INDEX `avaliacoes_estabelecimento_id_idx`(`estabelecimento_id`),
    INDEX `avaliacoes_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `filas_espera` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `nome_cliente` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `quantidade_pessoas` INTEGER NOT NULL,
    `status` ENUM('aguardando', 'chamado', 'sentado', 'cancelado') NOT NULL DEFAULT 'aguardando',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `filas_espera_estabelecimento_id_idx`(`estabelecimento_id`),
    INDEX `filas_espera_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `nome_cliente` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `quantidade_pessoas` INTEGER NOT NULL,
    `data_hora` DATETIME(3) NOT NULL,
    `observacoes` TEXT NULL,
    `status` ENUM('pendente', 'confirmada', 'cancelada', 'concluida') NOT NULL DEFAULT 'pendente',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reservas_estabelecimento_id_idx`(`estabelecimento_id`),
    INDEX `reservas_data_hora_idx`(`data_hora`),
    INDEX `reservas_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_plano_id_fkey` FOREIGN KEY (`plano_id`) REFERENCES `planos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credenciais_gateway` ADD CONSTRAINT `credenciais_gateway_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos_parciais` ADD CONSTRAINT `pagamentos_parciais_comanda_id_fkey` FOREIGN KEY (`comanda_id`) REFERENCES `comandas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacoes` ADD CONSTRAINT `avaliacoes_comanda_id_fkey` FOREIGN KEY (`comanda_id`) REFERENCES `comandas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacoes` ADD CONSTRAINT `avaliacoes_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacoes` ADD CONSTRAINT `avaliacoes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `filas_espera` ADD CONSTRAINT `filas_espera_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
