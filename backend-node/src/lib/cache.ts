import NodeCache from 'node-cache'

const cache = new NodeCache({
  stdTTL: 300, // 5 minutos
  checkperiod: 60, // Verifica expiração a cada 1 minuto
})

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key)
}

export function setCached<T>(key: string, value: T, ttl?: number): boolean {
  return cache.set(key, value, ttl || 300)
}

export function deleteCached(key: string): number {
  return cache.del(key)
}

export function clearCache(): void {
  cache.flushAll()
}

// Helpers para dados frequentes
export const CACHE_KEYS = {
  editorias: 'editorias',
  autores: 'autores',
  publicidades: 'publicidades',
} as const
