import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'dev.db'));

console.log('📊 Verificando status das notícias...\n');

const statusCount = db.prepare(`
  SELECT status, COUNT(*) as count 
  FROM Noticia 
  GROUP BY status
`).all();

console.log('Status das notícias:');
statusCount.forEach(s => {
    console.log(`  ${s.status}: ${s.count} notícias`);
});

console.log('\n📰 Primeiras 5 notícias:');
const noticias = db.prepare(`
  SELECT id, titulo, status, publishedAt 
  FROM Noticia 
  LIMIT 5
`).all();

noticias.forEach(n => {
    console.log(`  [${n.id}] ${n.titulo}`);
    console.log(`      Status: ${n.status}, Published: ${n.publishedAt || 'null'}`);
});

db.close();
