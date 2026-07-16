-- AlterTable: adiciona coluna metodo_pagamento em comandas
-- Valores possíveis: pix | dinheiro | cartao_credito | cartao_debito
ALTER TABLE `comandas` ADD COLUMN `metodo_pagamento` VARCHAR(50) NULL;
