-- AlterTable: adiciona 'superadmin' ao enum TipoUsuario
ALTER TABLE `usuarios` MODIFY COLUMN `tipo` ENUM('cliente', 'garcom', 'entregador', 'cozinha', 'bar', 'admin', 'superadmin') NOT NULL;
