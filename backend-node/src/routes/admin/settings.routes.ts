import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../..', '..')
const themePath = path.join(rootDir, 'data', 'theme.json')

const DEFAULT_THEME = { primary: '#E30613', secondary: '#004796' }

function readTheme(): { primary: string; secondary: string } {
  try {
    const raw = fs.readFileSync(themePath, 'utf-8')
    const parsed = JSON.parse(raw) as { primary?: string; secondary?: string }
    if (parsed.primary && parsed.secondary) return { primary: parsed.primary, secondary: parsed.secondary }
  } catch {
    // arquivo não existe ou inválido
  }
  return { ...DEFAULT_THEME }
}

function writeTheme(theme: { primary: string; secondary: string }): void {
  const dir = path.dirname(themePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(themePath, JSON.stringify(theme, null, 2), 'utf-8')
}

export async function settingsRoutes(app: FastifyInstance) {
  // GET público para a tela de login e o app carregarem o tema salvo
  app.get('/api/admin/settings/theme', async () => {
    return { data: readTheme() }
  })

  app.patch('/api/admin/settings/theme', {
    preHandler: [authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          primary: { type: 'string' },
          secondary: { type: 'string' },
        },
        required: ['primary', 'secondary'],
      },
    },
  }, async (request, reply) => {
    const body = request.body as { primary: string; secondary: string }
    const theme = { primary: String(body.primary).trim(), secondary: String(body.secondary).trim() }
    writeTheme(theme)
    return { data: theme }
  })
}
