import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'dev.db'));

console.log('🌱 Iniciando seed do banco de dados...');

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS Editoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS Autor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS Noticia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    subtitulo TEXT,
    conteudo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    imagemDestaque TEXT,
    publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    editoriaId INTEGER NOT NULL,
    autorId INTEGER NOT NULL,
    FOREIGN KEY (editoriaId) REFERENCES Editoria(id),
    FOREIGN KEY (autorId) REFERENCES Autor(id)
  );

  CREATE TABLE IF NOT EXISTS Publicidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    posicao TEXT NOT NULL,
    imagem TEXT NOT NULL,
    link TEXT,
    ativo INTEGER DEFAULT 1
  );
`);

// Limpar dados existentes
db.exec('DELETE FROM Noticia');
db.exec('DELETE FROM Editoria');
db.exec('DELETE FROM Autor');
db.exec('DELETE FROM Publicidade');

// Inserir Editorias (mesmo conjunto que o frontend e o menu esperam)
console.log('📂 Criando editorias...');
const editorias = [
    ['Política', 'politica'],
    ['Economia', 'economia'],
    ['Amazonas', 'amazonas'],
    ['Brasil', 'brasil'],
    ['Mundo', 'mundo'],
    ['Entretenimento', 'entretenimento'],
    ['Esporte', 'esporte'],
    ['Vídeos', 'videos'],
    ['Polícia', 'policia']
];

const insertEditoria = db.prepare('INSERT INTO Editoria (nome, slug) VALUES (?, ?)');
editorias.forEach(([nome, slug]) => {
    insertEditoria.run(nome, slug);
    console.log(`  ✓ ${nome}`);
});

// Inserir Autores
console.log('👤 Criando autores...');
const autores = [
    ['Redação 360', 'redacao@noticias360.com.br', 'https://i.pravatar.cc/150?u=redacao', null],
    ['Carlos Eduardo', 'carlos@noticias360.com.br', 'https://i.pravatar.cc/150?u=carlos', 'Jornalista especializado em Política'],
    ['Ana Maria', 'ana@noticias360.com.br', 'https://i.pravatar.cc/150?u=ana', 'Analista de Economia'],
    ['Roberto Silva', 'roberto@noticias360.com.br', 'https://i.pravatar.cc/150?u=roberto', 'Comentarista Esportivo']
];

const insertAutor = db.prepare('INSERT INTO Autor (nome, email, avatar, bio) VALUES (?, ?, ?, ?)');
autores.forEach(([nome, email, avatar, bio]) => {
    insertAutor.run(nome, email, avatar, bio);
    console.log(`  ✓ ${nome}`);
});

// Inserir Notícias
console.log('📰 Criando notícias...');
const noticias = [
    // Política (editoriaId: 1)
    ['Governador anuncia pacote de obras para o interior', 'governador-anuncia-pacote-politica-1', 'Investimentos chegam a R$ 500 milhões', '<p>O governador anunciou hoje um amplo pacote de obras...</p>', 'https://picsum.photos/seed/pol1/800/600', 1, 2],
    ['Nova lei de transparência é aprovada', 'nova-lei-transparencia-politica-2', 'Medida visa combater corrupção', '<p>A Assembleia Legislativa aprovou...</p>', 'https://picsum.photos/seed/pol2/800/600', 1, 2],
    ['Prefeitura lança programa de habitação', 'prefeitura-programa-habitacao-politica-3', '5 mil famílias serão beneficiadas', '<p>O programa habitacional...</p>', 'https://picsum.photos/seed/pol3/800/600', 1, 1],
    ['Debate sobre reforma administrativa', 'debate-reforma-administrativa-politica-4', 'Servidores protestam contra mudanças', '<p>Servidores públicos realizaram...</p>', 'https://picsum.photos/seed/pol4/800/600', 1, 2],
    ['Eleições municipais têm data definida', 'eleicoes-municipais-data-politica-5', 'Votação será em outubro', '<p>O Tribunal Eleitoral definiu...</p>', 'https://picsum.photos/seed/pol5/800/600', 1, 1],
    ['Secretário de Saúde pede demissão', 'secretario-saude-demissao-politica-6', 'Crise no setor motivou saída', '<p>Após meses de crise...</p>', 'https://picsum.photos/seed/pol6/800/600', 1, 2],
    ['Câmara aprova orçamento para 2026', 'camara-orcamento-2026-politica-7', 'Valor total é de R$ 2 bilhões', '<p>Os vereadores aprovaram...</p>', 'https://picsum.photos/seed/pol7/800/600', 1, 1],
    ['Novo partido é registrado no estado', 'novo-partido-registrado-politica-8', 'Legenda terá foco em meio ambiente', '<p>O Tribunal Regional Eleitoral...</p>', 'https://picsum.photos/seed/pol8/800/600', 1, 2],
    ['Governo anuncia concurso público', 'governo-concurso-publico-politica-9', '500 vagas para diversas áreas', '<p>O edital será lançado...</p>', 'https://picsum.photos/seed/pol9/800/600', 1, 1],
    ['Aliança política surpreende analistas', 'alianca-politica-surpreende-politica-10', 'Partidos rivais se unem', '<p>Em movimento inesperado...</p>', 'https://picsum.photos/seed/pol10/800/600', 1, 2],

    // Economia (editoriaId: 2)
    ['Mercado financeiro reage positivamente', 'mercado-financeiro-positivo-economia-1', 'Bolsa sobe 3% no dia', '<p>Os investidores reagiram...</p>', 'https://picsum.photos/seed/eco1/800/600', 2, 3],
    ['Startup local recebe aporte milionário', 'startup-aporte-milionario-economia-2', 'Investimento de R$ 10 milhões', '<p>A empresa de tecnologia...</p>', 'https://picsum.photos/seed/eco2/800/600', 2, 3],
    ['Setor de turismo cresce 15%', 'setor-turismo-cresce-economia-3', 'Números superam expectativas', '<p>O setor turístico registrou...</p>', 'https://picsum.photos/seed/eco3/800/600', 2, 1],
    ['Exportações batem recorde histórico', 'exportacoes-recorde-historico-economia-4', 'Agronegócio lidera vendas', '<p>As exportações do estado...</p>', 'https://picsum.photos/seed/eco4/800/600', 2, 3],
    ['Novo shopping inaugura na zona norte', 'novo-shopping-zona-norte-economia-5', '200 lojas e 3 mil empregos', '<p>O empreendimento comercial...</p>', 'https://picsum.photos/seed/eco5/800/600', 2, 1],
    ['Indústria aposta em carros elétricos', 'industria-carros-eletricos-economia-6', 'Montadora anuncia nova fábrica', '<p>A empresa automotiva...</p>', 'https://picsum.photos/seed/eco6/800/600', 2, 3],
    ['Programa de incentivo fiscal é lançado', 'programa-incentivo-fiscal-economia-7', 'Pequenas empresas serão beneficiadas', '<p>O governo estadual lançou...</p>', 'https://picsum.photos/seed/eco7/800/600', 2, 1],
    ['Fusão bilionária no setor de varejo', 'fusao-bilionaria-varejo-economia-8', 'Duas grandes redes se unem', '<p>As empresas anunciaram...</p>', 'https://picsum.photos/seed/eco8/800/600', 2, 3],
    ['Tecnologia impacta setor industrial', 'tecnologia-setor-industrial-economia-9', 'Automação gera debate', '<p>A implementação de novas...</p>', 'https://picsum.photos/seed/eco9/800/600', 2, 1],
    ['Inflação recua pelo terceiro mês', 'inflacao-recua-terceiro-mes-economia-10', 'Índice fica em 0,3%', '<p>Os dados divulgados hoje...</p>', 'https://picsum.photos/seed/eco10/800/600', 2, 3],

    // Amazonas (3)
    ['Festival de Parintins tem datas confirmadas', 'festival-parintins-datas-amazonas-1', 'Evento em 2026', '<p>O festival...</p>', 'https://picsum.photos/seed/ama1/800/600', 3, 1],
    ['Zona Franca de Manaus amplia incentivos', 'zona-franca-incentivos-amazonas-2', 'Novas empresas no polo', '<p>O governo federal...</p>', 'https://picsum.photos/seed/ama2/800/600', 3, 2],
    ['Chuvas fortes causam alagamentos na capital', 'chuvas-alagamentos-manaus-amazonas-3', 'Defesa civil em alerta', '<p>As chuvas...</p>', 'https://picsum.photos/seed/ama3/800/600', 3, 1],
    ['Reserva indígena ganha novo posto de saúde', 'reserva-indigena-posto-saude-amazonas-4', 'Atendimento na floresta', '<p>A comunidade...</p>', 'https://picsum.photos/seed/ama4/800/600', 3, 2],

    // Brasil (4)
    ['Presidente anuncia investimentos na região Norte', 'presidente-investimentos-norte-brasil-1', 'Recursos para infraestrutura', '<p>O presidente...</p>', 'https://picsum.photos/seed/bra1/800/600', 4, 2],
    ['IBGE divulga dados do Censo na Amazônia', 'ibge-censo-amazonia-brasil-2', 'População cresce 12%', '<p>Os números...</p>', 'https://picsum.photos/seed/bra2/800/600', 4, 1],
    ['Ministério anuncia programa de saneamento', 'ministerio-saneamento-brasil-3', 'Meta para 2030', '<p>O ministério...</p>', 'https://picsum.photos/seed/bra3/800/600', 4, 3],
    ['Supremo analisa ação sobre terras indígenas', 'supremo-terras-indigenas-brasil-4', 'Julgamento histórico', '<p>O STF...</p>', 'https://picsum.photos/seed/bra4/800/600', 4, 2],

    // Mundo (5)
    ['ONU debate clima em nova cúpula', 'onu-clima-cupula-mundo-1', 'Compromissos até 2030', '<p>Líderes mundiais...</p>', 'https://picsum.photos/seed/mun1/800/600', 5, 1],
    ['Conflito no Oriente Médio gera preocupação', 'conflito-oriente-medio-mundo-2', 'Diplomacia em ação', '<p>As Nações Unidas...</p>', 'https://picsum.photos/seed/mun2/800/600', 5, 2],
    ['Mercado europeu abre em alta', 'mercado-europeu-alta-mundo-3', 'Commodities sobem', '<p>As bolsas...</p>', 'https://picsum.photos/seed/mun3/800/600', 5, 3],
    ['Nova espécie descoberta na Amazônia peruana', 'especie-amazonia-peruana-mundo-4', 'Pesquisadores celebram', '<p>Uma equipe...</p>', 'https://picsum.photos/seed/mun4/800/600', 5, 1],

    // Entretenimento (6)
    ['Festival de cinema anuncia programação', 'festival-cinema-programacao-entretenimento-1', 'Filmes nacionais em destaque', '<p>O festival...</p>', 'https://picsum.photos/seed/ent1/800/600', 6, 1],
    ['Cantor local lança clipe em Manaus', 'cantor-clipe-manaus-entretenimento-2', 'Gravação em pontos turísticos', '<p>O artista...</p>', 'https://picsum.photos/seed/ent2/800/600', 6, 2],
    ['Série sobre Amazônia estreia em streaming', 'serie-amazonia-streaming-entretenimento-3', 'Produção nacional', '<p>A plataforma...</p>', 'https://picsum.photos/seed/ent3/800/600', 6, 1],
    ['Show de comédia esgota ingressos', 'show-comedia-ingressos-entretenimento-4', 'Segunda data confirmada', '<p>O humorista...</p>', 'https://picsum.photos/seed/ent4/800/600', 6, 3],

    // Esporte (7)
    ['Time local vence clássico regional', 'time-local-classico-esporte-1', 'Torcida comemora no estádio', '<p>O jogo...</p>', 'https://picsum.photos/seed/esp1/800/600', 7, 4],
    ['Seleção sub-20 convoca atleta do estado', 'selecao-sub20-convoca-esporte-2', 'Revelação da temporada', '<p>O técnico...</p>', 'https://picsum.photos/seed/esp2/800/600', 7, 4],
    ['Campeonato estadual define semi-finalistas', 'campeonato-estadual-semi-esporte-3', 'Quatro times na disputa', '<p>Os jogos...</p>', 'https://picsum.photos/seed/esp3/800/600', 7, 4],
    ['Atleta amazonense conquista medalha em etapa nacional', 'atleta-medalha-nacional-esporte-4', 'Pódio no atletismo', '<p>O atleta...</p>', 'https://picsum.photos/seed/esp4/800/600', 7, 4],

    // Vídeos (8)
    ['Vídeo: momento exato do anúncio do governador', 'video-anuncio-governador-videos-1', 'Imagens exclusivas', '<p>Assista...</p>', 'https://picsum.photos/seed/vid1/800/600', 8, 1],
    ['Entrevista: secretário fala sobre obras', 'entrevista-secretario-obras-videos-2', 'Vídeo completo', '<p>Em entrevista...</p>', 'https://picsum.photos/seed/vid2/800/600', 8, 2],
    ['Documentário sobre vida na floresta estreia', 'documentario-floresta-videos-3', 'Produção local', '<p>O filme...</p>', 'https://picsum.photos/seed/vid3/800/600', 8, 1],
    ['Vídeo viral: fenômeno natural no rio', 'video-viral-fenomeno-rio-videos-4', 'Milhares de visualizações', '<p>As imagens...</p>', 'https://picsum.photos/seed/vid4/800/600', 8, 3],
    ['Ao vivo: cobertura do festival', 'ao-vivo-cobertura-festival-videos-5', 'Transmissão especial', '<p>Acompanhe...</p>', 'https://picsum.photos/seed/vid5/800/600', 8, 2],

    // Polícia (9)
    ['Operação apreende armas e prende suspeitos', 'operacao-armas-suspeitos-policia-1', 'Ação na zona norte', '<p>A polícia...</p>', 'https://picsum.photos/seed/pol1/800/600', 9, 2],
    ['Delegacia de crimes cibernéticos prende quadrilha', 'delegacia-cibernetica-quadrilha-policia-2', 'Estelionato na internet', '<p>Os agentes...</p>', 'https://picsum.photos/seed/pol2/800/600', 9, 1],
    ['PM apreende veículo com carga irregular', 'pm-veiculo-carga-irregular-policia-3', 'Rodovia federal', '<p>Durante blitz...</p>', 'https://picsum.photos/seed/pol3/800/600', 9, 2],
    ['Homem é preso por agredir companheira', 'homem-preso-agressao-policia-4', 'Flagrante no bairro', '<p>A polícia civil...</p>', 'https://picsum.photos/seed/pol4/800/600', 9, 1]
];

const insertNoticia = db.prepare('INSERT INTO Noticia (titulo, slug, subtitulo, conteudo, imagemDestaque, editoriaId, autorId) VALUES (?, ?, ?, ?, ?, ?, ?)');
noticias.forEach(noticia => {
    insertNoticia.run(...noticia);
});
console.log(`  ✓ ${noticias.length} notícias criadas`);

// Inserir Publicidades
console.log('📢 Criando publicidades...');
const publicidades = [
    ['Banner Sidebar Top', 'sidebar_top', 'https://via.placeholder.com/300x250', '#', 1],
    ['Banner Feed 1', 'feed_posicao_1', 'https://via.placeholder.com/970x150', '#', 1],
    ['Banner Feed 2', 'feed_posicao_2', 'https://via.placeholder.com/970x150', '#', 1]
];

const insertPublicidade = db.prepare('INSERT INTO Publicidade (nome, posicao, imagem, link, ativo) VALUES (?, ?, ?, ?, ?)');
publicidades.forEach(([nome, posicao, imagem, link, ativo]) => {
    insertPublicidade.run(nome, posicao, imagem, link, ativo);
    console.log(`  ✓ ${nome}`);
});

console.log(`\n✅ Seed concluído com sucesso!`);
console.log(`📊 Resumo:`);
console.log(`   - ${editorias.length} editorias`);
console.log(`   - ${autores.length} autores`);
console.log(`   - ${noticias.length} notícias`);
console.log(`   - ${publicidades.length} publicidades`);

db.close();
