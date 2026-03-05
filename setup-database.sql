-- ============================================
-- SETUP DATABASE PARA NOTICIAS360 (STRAPI)
-- ============================================
-- Execute este script no MySQL do Laragon
-- via phpMyAdmin, HeidiSQL ou linha de comando

-- 1) Criar banco de dados
CREATE DATABASE IF NOT EXISTS noticias360
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2) Criar usuário dedicado (recomendado para segurança)
CREATE USER IF NOT EXISTS 'strapi_user'@'localhost' IDENTIFIED BY 'strapi_pass_2026';

-- 3) Conceder todas as permissões no banco noticias360
GRANT ALL PRIVILEGES ON noticias360.* TO 'strapi_user'@'localhost';

-- 4) Aplicar mudanças
FLUSH PRIVILEGES;

-- 5) Verificar
SELECT User, Host FROM mysql.user WHERE User = 'strapi_user';

-- ============================================
-- ALTERNATIVA SIMPLES (usar root sem senha)
-- ============================================
-- Se preferir usar root (apenas para DEV local):
-- - Host: 127.0.0.1
-- - Port: 3306
-- - User: root
-- - Password: (vazio ou conforme seu Laragon)
-- - Database: noticias360
--
-- Neste caso, apenas crie o banco:
-- CREATE DATABASE IF NOT EXISTS noticias360
--   CHARACTER SET utf8mb4
--   COLLATE utf8mb4_unicode_ci;
