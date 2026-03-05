import prisma from '../lib/prisma'
import { getCached, setCached, CACHE_KEYS } from '../lib/cache'

export async function getAutores() {
  const cached = getCached<{ id: number; nome: string }[]>(CACHE_KEYS.autores)
  if (cached) return cached

  const data = await prisma.autor.findMany({
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true },
  })

  setCached(CACHE_KEYS.autores, data)
  return data
}

export function invalidateAutoresCache() {
  return deleteCached(CACHE_KEYS.autores)
}
