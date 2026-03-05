import prisma from '../lib/prisma'
import { getCached, setCached, CACHE_KEYS } from '../lib/cache'

export async function getEditorias() {
  const cached = getCached<{ id: number; nome: string; slug: string }[]>(CACHE_KEYS.editorias)
  if (cached) return cached

  const data = await prisma.editoria.findMany({
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true, slug: true },
  })

  setCached(CACHE_KEYS.editorias, data)
  return data
}

export function invalidateEditoriasCache() {
  return deleteCached(CACHE_KEYS.editorias)
}
