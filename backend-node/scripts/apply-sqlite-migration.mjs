/**
 * Aplica alterações no SQLite (novas colunas em Noticia + tabela Media)
 * sem usar db push (evita erro "index associated with UNIQUE or PRIMARY KEY cannot be dropped").
 * Uso: node scripts/apply-sqlite-migration.mjs
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const statements = [
  'ALTER TABLE Noticia ADD COLUMN destaqueOrdem INTEGER',
  'ALTER TABLE Noticia ADD COLUMN metaTitle TEXT',
  'ALTER TABLE Noticia ADD COLUMN metaDescription TEXT',
  'ALTER TABLE Noticia ADD COLUMN metaKeywords TEXT',
  'ALTER TABLE Noticia ADD COLUMN observacaoRevisao TEXT',
  `CREATE TABLE IF NOT EXISTS Media (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    size INTEGER NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploadedById INTEGER REFERENCES User(id)
  )`,
  // Índices para performance
  'CREATE INDEX IF NOT EXISTS idx_noticia_status ON Noticia(status)',
  'CREATE INDEX IF NOT EXISTS idx_noticia_slug ON Noticia(slug)',
  'CREATE INDEX IF NOT EXISTS idx_noticia_updatedAt ON Noticia(updatedAt)',
  'CREATE INDEX IF NOT EXISTS idx_noticia_editoriaId ON Noticia(editoriaId)',
  'CREATE INDEX IF NOT EXISTS idx_noticia_autorId ON Noticia(autorId)',
  'CREATE INDEX IF NOT EXISTS idx_noticia_publishedAt ON Noticia(publishedAt)',
  'CREATE INDEX IF NOT EXISTS idx_user_email ON User(email)',
  'CREATE INDEX IF NOT EXISTS idx_user_role ON User(role)',
]

async function main() {
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql)
      console.log('OK:', sql.slice(0, 60) + (sql.length > 60 ? '...' : ''))
    } catch (e) {
      if (e.message?.includes('duplicate column name') || e.message?.includes('already exists')) {
        console.log('(já existe) ', sql.slice(0, 50) + '...')
      } else {
        console.error('Erro:', e.message)
        throw e
      }
    }
  }
  console.log('Migração aplicada.')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
