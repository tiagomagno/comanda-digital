import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'dev.db'));

console.log('📊 Analisando estrutura do banco de dados...\n');

// Listar todas as tabelas
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('📋 Tabelas encontradas:');
tables.forEach(t => console.log(`  - ${t.name}`));

console.log('\n🔍 Estrutura da tabela Noticia:');
const noticiaInfo = db.prepare("PRAGMA table_info(Noticia)").all();
noticiaInfo.forEach(col => {
    console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});

console.log('\n📈 Estatísticas:');
const stats = {
    noticias: db.prepare("SELECT COUNT(*) as count FROM Noticia").get(),
    editorias: db.prepare("SELECT COUNT(*) as count FROM Editoria").get(),
    autores: db.prepare("SELECT COUNT(*) as count FROM Autor").get(),
    publicidades: db.prepare("SELECT COUNT(*) as count FROM Publicidade").get()
};

console.log(`  Notícias: ${stats.noticias.count}`);
console.log(`  Editorias: ${stats.editorias.count}`);
console.log(`  Autores: ${stats.autores.count}`);
console.log(`  Publicidades: ${stats.publicidades.count}`);

db.close();
