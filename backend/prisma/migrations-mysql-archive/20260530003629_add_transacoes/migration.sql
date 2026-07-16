-- CreateTable
CREATE TABLE `transacoes` (
    `id` VARCHAR(191) NOT NULL,
    `comanda_id` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pendente', 'processando', 'pago', 'falhou', 'reembolsado', 'cancelado', 'chargeback') NOT NULL DEFAULT 'pendente',
    `metodo` VARCHAR(191) NULL,
    `provedor` VARCHAR(191) NULL,
    `provider_id` VARCHAR(191) NULL,
    `observacao` TEXT NULL,
    `criado_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_at` DATETIME(3) NOT NULL,

    INDEX `transacoes_comanda_id_idx`(`comanda_id`),
    INDEX `transacoes_status_idx`(`status`),
    INDEX `transacoes_provider_id_idx`(`provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transacoes` ADD CONSTRAINT `transacoes_comanda_id_fkey` FOREIGN KEY (`comanda_id`) REFERENCES `comandas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
