-- Criar tabelas
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

-- Inserir Editorias
INSERT OR IGNORE INTO Editoria (nome, slug) VALUES 
('Política', 'politica'),
('Economia', 'economia'),
('Amazonas', 'amazonas'),
('Brasil', 'brasil'),
('Mundo', 'mundo'),
('Entretenimento', 'entretenimento'),
('Esporte', 'esporte');

-- Inserir Autores
INSERT OR IGNORE INTO Autor (nome, email, avatar, bio) VALUES 
('Redação 360', 'redacao@noticias360.com.br', 'https://i.pravatar.cc/150?u=redacao', NULL),
('Carlos Eduardo', 'carlos@noticias360.com.br', 'https://i.pravatar.cc/150?u=carlos', 'Jornalista especializado em Política'),
('Ana Maria', 'ana@noticias360.com.br', 'https://i.pravatar.cc/150?u=ana', 'Analista de Economia'),
('Roberto Silva', 'roberto@noticias360.com.br', 'https://i.pravatar.cc/150?u=roberto', 'Comentarista Esportivo');

-- Inserir Notícias (10 por editoria)
INSERT INTO Noticia (titulo, slug, subtitulo, conteudo, imagemDestaque, editoriaId, autorId) VALUES
-- Política
('Governador anuncia pacote de obras para o interior', 'governador-anuncia-pacote-politica-1', 'Investimentos chegam a R$ 500 milhões', '<p>O governador anunciou hoje um amplo pacote de obras...</p>', 'https://picsum.photos/seed/pol1/800/600', 1, 2),
('Nova lei de transparência é aprovada', 'nova-lei-transparencia-politica-2', 'Medida visa combater corrupção', '<p>A Assembleia Legislativa aprovou...</p>', 'https://picsum.photos/seed/pol2/800/600', 1, 2),
('Prefeitura lança programa de habitação', 'prefeitura-programa-habitacao-politica-3', '5 mil famílias serão beneficiadas', '<p>O programa habitacional...</p>', 'https://picsum.photos/seed/pol3/800/600', 1, 1),
('Debate sobre reforma administrativa', 'debate-reforma-administrativa-politica-4', 'Servidores protestam contra mudanças', '<p>Servidores públicos realizaram...</p>', 'https://picsum.photos/seed/pol4/800/600', 1, 2),
('Eleições municipais têm data definida', 'eleicoes-municipais-data-politica-5', 'Votação será em outubro', '<p>O Tribunal Eleitoral definiu...</p>', 'https://picsum.photos/seed/pol5/800/600', 1, 1),
('Secretário de Saúde pede demissão', 'secretario-saude-demissao-politica-6', 'Crise no setor motivou saída', '<p>Após meses de crise...</p>', 'https://picsum.photos/seed/pol6/800/600', 1, 2),
('Câmara aprova orçamento para 2026', 'camara-orcamento-2026-politica-7', 'Valor total é de R$ 2 bilhões', '<p>Os vereadores aprovaram...</p>', 'https://picsum.photos/seed/pol7/800/600', 1, 1),
('Novo partido é registrado no estado', 'novo-partido-registrado-politica-8', 'Legenda terá foco em meio ambiente', '<p>O Tribunal Regional Eleitoral...</p>', 'https://picsum.photos/seed/pol8/800/600', 1, 2),
('Governo anuncia concurso público', 'governo-concurso-publico-politica-9', '500 vagas para diversas áreas', '<p>O edital será lançado...</p>', 'https://picsum.photos/seed/pol9/800/600', 1, 1),
('Aliança política surpreende analistas', 'alianca-politica-surpreende-politica-10', 'Partidos rivais se unem', '<p>Em movimento inesperado...</p>', 'https://picsum.photos/seed/pol10/800/600', 1, 2),

-- Economia
('Mercado financeiro reage positivamente', 'mercado-financeiro-positivo-economia-1', 'Bolsa sobe 3% no dia', '<p>Os investidores reagiram...</p>', 'https://picsum.photos/seed/eco1/800/600', 2, 3),
('Startup local recebe aporte milionário', 'startup-aporte-milionario-economia-2', 'Investimento de R$ 10 milhões', '<p>A empresa de tecnologia...</p>', 'https://picsum.photos/seed/eco2/800/600', 2, 3),
('Setor de turismo cresce 15%', 'setor-turismo-cresce-economia-3', 'Números superam expectativas', '<p>O setor turístico registrou...</p>', 'https://picsum.photos/seed/eco3/800/600', 2, 1),
('Exportações batem recorde histórico', 'exportacoes-recorde-historico-economia-4', 'Agronegócio lidera vendas', '<p>As exportações do estado...</p>', 'https://picsum.photos/seed/eco4/800/600', 2, 3),
('Novo shopping inaugura na zona norte', 'novo-shopping-zona-norte-economia-5', '200 lojas e 3 mil empregos', '<p>O empreendimento comercial...</p>', 'https://picsum.photos/seed/eco5/800/600', 2, 1),
('Indústria aposta em carros elétricos', 'industria-carros-eletricos-economia-6', 'Montadora anuncia nova fábrica', '<p>A empresa automotiva...</p>', 'https://picsum.photos/seed/eco6/800/600', 2, 3),
('Programa de incentivo fiscal é lançado', 'programa-incentivo-fiscal-economia-7', 'Pequenas empresas serão beneficiadas', '<p>O governo estadual lançou...</p>', 'https://picsum.photos/seed/eco7/800/600', 2, 1),
('Fusão bilionária no setor de varejo', 'fusao-bilionaria-varejo-economia-8', 'Duas grandes redes se unem', '<p>As empresas anunciaram...</p>', 'https://picsum.photos/seed/eco8/800/600', 2, 3),
('Tecnologia impacta setor industrial', 'tecnologia-setor-industrial-economia-9', 'Automação gera debate', '<p>A implementação de novas...</p>', 'https://picsum.photos/seed/eco9/800/600', 2, 1),
('Inflação recua pelo terceiro mês', 'inflacao-recua-terceiro-mes-economia-10', 'Índice fica em 0,3%', '<p>Os dados divulgados hoje...</p>', 'https://picsum.photos/seed/eco10/800/600', 2, 3);

-- Inserir Publicidades
INSERT INTO Publicidade (nome, posicao, imagem, link, ativo) VALUES
('Banner Sidebar Top', 'sidebar_top', 'https://via.placeholder.com/300x250', '#', 1),
('Banner Feed 1', 'feed_posicao_1', 'https://via.placeholder.com/970x150', '#', 1),
('Banner Feed 2', 'feed_posicao_2', 'https://via.placeholder.com/970x150', '#', 1);
