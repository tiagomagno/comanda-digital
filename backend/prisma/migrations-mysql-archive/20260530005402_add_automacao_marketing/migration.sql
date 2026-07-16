-- CreateTable
CREATE TABLE `regras_automacao` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` ENUM('apos_entrega', 'cliente_inativo') NOT NULL,
    `delay_minutos` INTEGER NOT NULL DEFAULT 30,
    `dias_inatividade` INTEGER NULL,
    `acao` JSON NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `regras_automacao_estabelecimento_id_idx`(`estabelecimento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `execucoes_automacao` (
    `id` VARCHAR(191) NOT NULL,
    `regra_id` VARCHAR(191) NOT NULL,
    `referencia` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pendente',
    `resultado` JSON NULL,
    `criado_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `execucoes_automacao_regra_id_idx`(`regra_id`),
    INDEX `execucoes_automacao_referencia_idx`(`referencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `regras_automacao` ADD CONSTRAINT `regras_automacao_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `execucoes_automacao` ADD CONSTRAINT `execucoes_automacao_regra_id_fkey` FOREIGN KEY (`regra_id`) REFERENCES `regras_automacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
