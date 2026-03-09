-- Referência: alterações aplicadas pelo script scripts/apply-sqlite-migration.mjs

-- Novas colunas em Noticia (uma por vez; SQLite não permite várias em um ALTER)
ALTER TABLE Noticia ADD COLUMN destaqueOrdem INTEGER;
ALTER TABLE Noticia ADD COLUMN metaTitle TEXT;
ALTER TABLE Noticia ADD COLUMN metaDescription TEXT;
ALTER TABLE Noticia ADD COLUMN metaKeywords TEXT;

-- Tabela Media
CREATE TABLE IF NOT EXISTS Media (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  size INTEGER NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  uploadedById INTEGER,
  FOREIGN KEY (uploadedById) REFERENCES User(id)
);
