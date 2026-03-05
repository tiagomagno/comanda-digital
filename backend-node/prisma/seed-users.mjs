/**
 * Lista todos os usuários e, se houver apenas admin (ou nenhum de outro perfil),
 * cria 1 usuário por perfil para testar as visualizações no painel.
 * Senha de teste para todos: senha123
 */
import 'dotenv/config'
import { createHash } from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SENHA_TESTE = 'senha123'

const PERFIS = [
  { role: 'GESTOR', nome: 'Gestor Teste', email: 'gestor@noticias360.com.br' },
  { role: 'EDITOR_CHEFE', nome: 'Editor Chefe Teste', email: 'editor@noticias360.com.br' },
  { role: 'MARKETING_SEO', nome: 'Marketing SEO Teste', email: 'marketing@noticias360.com.br' },
  { role: 'JORNALISTA', nome: 'Jornalista Teste', email: 'jornalista@noticias360.com.br' },
]

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('👤 Usuários no banco:\n')

  const usuarios = await prisma.user.findMany({
    orderBy: { nome: 'asc' },
    select: { id: true, email: true, nome: true, role: true },
  })

  if (usuarios.length === 0) {
    console.log('   (nenhum usuário)\n')
  } else {
    usuarios.forEach((u) => {
      console.log(`   ${u.id} | ${u.email} | ${u.nome} | ${u.role}`)
    })
    console.log('')
  }

  const rolesExistentes = new Set(usuarios.map((u) => u.role))
  const criar = PERFIS.filter((p) => !rolesExistentes.has(p.role))

  if (criar.length === 0) {
    console.log('✅ Já existe pelo menos um usuário de cada perfil. Nada a criar.\n')
    return
  }

  console.log(`📝 Criando ${criar.length} usuário(s) de teste (senha: ${SENHA_TESTE}):\n`)
  const hash = hashPassword(SENHA_TESTE)

  for (const { role, nome, email } of criar) {
    const existente = await prisma.user.findUnique({ where: { email } })
    if (existente) {
      console.log(`   ⏭ ${email} já existe`)
      continue
    }
    await prisma.user.create({
      data: { email, nome, role, passwordHash: hash },
    })
    console.log(`   ✓ ${nome} (${email}) – ${role}`)
  }

  console.log('\n✅ Pronto! Use a senha "' + SENHA_TESTE + '" para logar com qualquer um dos e-mails acima.\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
