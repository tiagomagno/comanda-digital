-- AlterTable
ALTER TABLE `pedidos` ADD COLUMN `em_expedicao_at` DATETIME(3) NULL,
    MODIFY `status` ENUM('criado', 'aguardando_pagamento', 'pago', 'em_preparo', 'pronto', 'em_expedicao', 'entregue', 'cancelado') NOT NULL DEFAULT 'criado';
