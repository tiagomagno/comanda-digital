import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient({
    datasourceUrl: 'file:./prisma/dev.db'
})

const EDITORIAS = [
    { nome: 'Política', slug: 'politica' },
    { nome: 'Economia', slug: 'economia' },
    { nome: 'Amazonas', slug: 'amazonas' },
    { nome: 'Brasil', slug: 'brasil' },
    { nome: 'Mundo', slug: 'mundo' },
    { nome: 'Entretenimento', slug: 'entretenimento' },
    { nome: 'Esporte', slug: 'esporte' },
]

const TITULOS_EXEMPLO = [
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
]

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...')

    // 1. Criar Editorias
    console.log('📂 Criando editorias...')
    const editoriasCreated = []
    for (const editoria of EDITORIAS) {
        const created = await prisma.editoria.upsert({
            where: { slug: editoria.slug },
            update: {},
            create: editoria,
        })
        editoriasCreated.push(created)
        console.log(`  ✓ ${editoria.nome}`)
    }

    // 2. Criar Autores
    console.log('👤 Criando autores...')
    const autores = [
        { nome: 'Redação 360', email: 'redacao@noticias360.com.br', avatar: 'https://i.pravatar.cc/150?u=redacao' },
        { nome: 'Carlos Eduardo', email: 'carlos@noticias360.com.br', avatar: 'https://i.pravatar.cc/150?u=carlos', bio: 'Jornalista especializado em Política' },
        { nome: 'Ana Maria', email: 'ana@noticias360.com.br', avatar: 'https://i.pravatar.cc/150?u=ana', bio: 'Analista de Economia' },
        { nome: 'Roberto Silva', email: 'roberto@noticias360.com.br', avatar: 'https://i.pravatar.cc/150?u=roberto', bio: 'Comentarista Esportivo' },
    ]

    const autoresCreated = []
    for (const autor of autores) {
        const created = await prisma.autor.upsert({
            where: { email: autor.email },
            update: {},
            create: autor,
        })
        autoresCreated.push(created)
        console.log(`  ✓ ${autor.nome}`)
    }

    // 3. Criar Notícias (10 por editoria)
    console.log('📰 Criando notícias...')
    let totalNoticias = 0

    for (const editoria of editoriasCreated) {
        for (let i = 0; i < 10; i++) {
            const titulo = TITULOS_EXEMPLO[Math.floor(Math.random() * TITULOS_EXEMPLO.length)]
            const slug = slugify(`${titulo}-${editoria.slug}-${i}`, { lower: true, strict: true })
            const autorAleatorio = autoresCreated[Math.floor(Math.random() * autoresCreated.length)]

            await prisma.noticia.create({
                data: {
                    titulo,
                    slug,
                    subtitulo: `Análise completa sobre ${titulo.toLowerCase()} na editoria de ${editoria.nome}`,
                    conteudo: `<p>Este é o conteúdo completo da notícia sobre ${titulo}.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>`,
                    imagemDestaque: `https://picsum.photos/seed/${editoria.id}${i}/800/600`,
                    editoriaId: editoria.id,
                    autorId: autorAleatorio.id,
                    publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                }
            })
            totalNoticias++
        }
        console.log(`  ✓ ${editoria.nome}: 10 notícias`)
    }

    // 4. Criar Publicidades
    console.log('📢 Criando publicidades...')
    const publicidades = [
        { nome: 'Banner Sidebar Top', posicao: 'sidebar_top', imagem: 'https://via.placeholder.com/300x250', ativo: true },
        { nome: 'Banner Feed 1', posicao: 'feed_posicao_1', imagem: 'https://via.placeholder.com/970x150', ativo: true },
        { nome: 'Banner Feed 2', posicao: 'feed_posicao_2', imagem: 'https://via.placeholder.com/970x150', ativo: true },
    ]

    for (const pub of publicidades) {
        await prisma.publicidade.create({
            data: pub
        })
        console.log(`  ✓ ${pub.nome}`)
    }

    console.log(`\n✅ Seed concluído com sucesso!`)
    console.log(`📊 Resumo:`)
    console.log(`   - ${editoriasCreated.length} editorias`)
    console.log(`   - ${autoresCreated.length} autores`)
    console.log(`   - ${totalNoticias} notícias`)
    console.log(`   - ${publicidades.length} publicidades`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Erro no seed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
