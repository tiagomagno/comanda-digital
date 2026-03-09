import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'dev.db'));

console.log('🔍 Estrutura da tabela Editoria:');
const editoriaInfo = db.prepare("PRAGMA table_info(Editoria)").all();
editoriaInfo.forEach(col => {
    console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});

console.log('\n🔍 Estrutura da tabela Autor:');
const autorInfo = db.prepare("PRAGMA table_info(Autor)").all();
autorInfo.forEach(col => {
    console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});

console.log('\n🔍 Estrutura da tabela User:');
const userInfo = db.prepare("PRAGMA table_info(User)").all();
userInfo.forEach(col => {
    console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});

console.log('\n🔍 Estrutura da tabela Publicidade:');
const pubInfo = db.prepare("PRAGMA table_info(Publicidade)").all();
pubInfo.forEach(col => {
    console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});

console.log('\n🔍 Estrutura da tabela Media:');
const mediaInfo = db.prepare("PRAGMA table_info(Media)").all();
mediaInfo.forEach(col => {
    console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});

db.close();
