// Script simplificado de seed que não depende do Prisma Client gerado
import Database from 'better-sqlite3';
import slugify from 'slugify';

const db = new Database('./prisma/dev.db');

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS Editoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Autor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    bio TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Noticia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitulo TEXT,
    conteudo TEXT,
    imagemDestaque TEXT,
    editoriaId INTEGER NOT NULL,
    autorId INTEGER NOT NULL,
    publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (editoriaId) REFERENCES Editoria(id),
    FOREIGN KEY (autorId) REFERENCES Autor(id)
  );

  CREATE TABLE IF NOT EXISTS Publicidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    posicao TEXT NOT NULL,
    imagem TEXT NOT NULL,
    link TEXT,
    ativo BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('🌱 Iniciando seed do banco de dados...');

// Limpar dados existentes
db.exec('DELETE FROM Noticia');
db.exec('DELETE FROM Editoria');
db.exec('DELETE FROM Autor');
db.exec('DELETE FROM Publicidade');

// Editorias
const editorias = [
    { nome: 'Política', slug: 'politica' },
    { nome: 'Economia', slug: 'economia' },
    { nome: 'Amazonas', slug: 'amazonas' },
    { nome: 'Brasil', slug: 'brasil' },
    { nome: 'Mundo', slug: 'mundo' },
    { nome: 'Entretenimento', slug: 'entretenimento' },
    { nome: 'Esporte', slug: 'esporte' },
];

console.log('📂 Criando editorias...');
const insertEditoria = db.prepare('INSERT INTO Editoria (nome, slug) VALUES (?, ?)');
editorias.forEach(e => {
    insertEditoria.run(e.nome, e.slug);
    console.log(`  ✓ ${e.nome}`);
});

// Autores
const autores = [
    { nome: 'Redação 360', email: 'redacao@noticias360.com.br', avatar: 'https://i.pravatar.cc/150?u=redacao' },
    { nome: 'Carlos Eduardo', email: 'carlos@noticias360.com.br', avatar: 'https://i.pravatar.cc/150?u=carlos', bio: 'Jornalista especializado em Política' },
    { nome: 'Ana Maria', email: 'ana@noticias360.com.br', avatar: 'https://i.pravatar.cc/150?u=ana', bio: 'Analista de Economia' },
    { nome: 'Roberto Silva', email: 'roberto@noticias360.com.br', avatar: 'https://i.pravatar.cc/150?u=roberto', bio: 'Comentarista Esportivo' },
];

console.log('👤 Criando autores...');
const insertAutor = db.prepare('INSERT INTO Autor (nome, email, avatar, bio) VALUES (?, ?, ?, ?)');
autores.forEach(a => {
    insertAutor.run(a.nome, a.email, a.avatar, a.bio || null);
    console.log(`  ✓ ${a.nome}`);
});

// Títulos de exemplo
const titulos = [
    'Governador anuncia pacote de obras para o interior do estado',
    'Festival de Parintins tem datas confirmadas para o próximo ano',
    'Novo shopping center inaugura na zona norte com 200 lojas',
    'Prefeitura inicia campanha de vacinação contra a gripe',
    'Time local vence campeonato regional após disputa acirrada',
    'Universidade abre inscrições para vestibular unificado',
    'Acidente no centro causa congestionamento nesta manhã',
    'Previsão do tempo indica chuvas fortes para o fim de semana',
    'Feira de artesanato reúne produtores de todo o estado',
    'Nova lei de trânsito entra em vigor a partir de hoje',
    'Mercado financeiro reage positivamente aos novos índices',
    'Grandes empresas anunciam fusão bilionária no setor de varejo',
    'Startup local recebe aporte de fundo internacional',
    'Indústria automotiva aposta em carros elétricos mais acessíveis',
    'Impacto das novas tecnologias no setor industrial brasileiro',
    'Setor de turismo registra crescimento de 15% no último trimestre',
    'Exportações do Amazonas batem recorde histórico',
    'Governo federal anuncia novo programa de incentivo fiscal',
];

// Notícias
console.log('📰 Criando notícias...');
const insertNoticia = db.prepare(`
  INSERT INTO Noticia (titulo, slug, subtitulo, conteudo, imagemDestaque, editoriaId, autorId, publishedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let totalNoticias = 0;
for (let editoriaId = 1; editoriaId <= 7; editoriaId++) {
    for (let i = 0; i < 10; i++) {
        const titulo = titulos[Math.floor(Math.random() * titulos.length)];
        const slug = slugify(`${titulo}-${editoriaId}-${i}`, { lower: true, strict: true });
        const subtitulo = `Análise completa sobre ${titulo.toLowerCase()}`;
        const conteudo = `<p>Este é o conteúdo completo da notícia sobre ${titulo}.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>`;
        const imagemDestaque = `https://picsum.photos/seed/${editoriaId}${i}/800/600`;
        const autorId = Math.floor(Math.random() * 4) + 1;
        const publishedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

        insertNoticia.run(titulo, slug, subtitulo, conteudo, imagemDestaque, editoriaId, autorId, publishedAt);
        totalNoticias++;
    }
    console.log(`  ✓ Editoria ${editoriaId}: 10 notícias`);
}

// Publicidades
console.log('📢 Criando publicidades...');
const publicidades = [
    { nome: 'Banner Sidebar Top', posicao: 'sidebar_top', imagem: 'https://via.placeholder.com/300x250', link: '#' },
    { nome: 'Banner Feed 1', posicao: 'feed_posicao_1', imagem: 'https://via.placeholder.com/970x150', link: '#' },
    { nome: 'Banner Feed 2', posicao: 'feed_posicao_2', imagem: 'https://via.placeholder.com/970x150', link: '#' },
];

const insertPublicidade = db.prepare('INSERT INTO Publicidade (nome, posicao, imagem, link, ativo) VALUES (?, ?, ?, ?, ?)');
publicidades.forEach(p => {
    insertPublicidade.run(p.nome, p.posicao, p.imagem, p.link, 1);
    console.log(`  ✓ ${p.nome}`);
});

console.log(`\n✅ Seed concluído com sucesso!`);
console.log(`📊 Resumo:`);
console.log(`   - ${editorias.length} editorias`);
console.log(`   - ${autores.length} autores`);
console.log(`   - ${totalNoticias} notícias`);
console.log(`   - ${publicidades.length} publicidades`);

db.close();
