import type { UserRole, NoticiaRow, UsuarioRow, MediaRow, NoticiasFilters, NoticiasListMeta, CreateNoticiaPayload } from './types'

const DEFAULT_API_ORIGIN = 'http://localhost:3001'

/** Origem da API: em dev com Vite use '' (proxy); senão VITE_API_URL ou mesma origem ou default. */
function getApiOrigin(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL as string
  if (import.meta.env.DEV) return '' // proxy em dev
  if (typeof window !== 'undefined') return window.location.origin
  return DEFAULT_API_ORIGIN
}

const API_BASE = getApiOrigin()
const TOKEN_KEY = 'noticias360_admin_token'

/** URL base para montar links de mídia (uploads). Em dev com proxy use mesma origem; em prod use origem da API. */
export function getApiUrlForAssets(): string {
  const origin = getApiOrigin()
  return origin || (typeof window !== 'undefined' ? window.location.origin : DEFAULT_API_ORIGIN)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function api<T>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  const { params, ...init } = options || {}
  const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint
  const url = API_BASE ? new URL(path, API_BASE) : new URL(path, typeof window !== 'undefined' ? window.location.origin : DEFAULT_API_ORIGIN)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init?.headers,
  }
  const token = getToken()
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  const res = await fetch(url.toString(), { ...init, headers })
  if (!res.ok) {
    if (res.status === 401) {
      clearToken()
      try {
        window.dispatchEvent(new CustomEvent('n360-unauthorized'))
      } catch {}
    }
    const err = await res.json().catch(() => ({}))
    const msg = (err as { message?: string; error?: { message?: string } })?.error?.message ?? (err as { message?: string })?.message ?? res.statusText
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export type { UserRole, NoticiaRow, UsuarioRow, MediaRow, NoticiasFilters, NoticiasListMeta, CreateNoticiaPayload } from './types'

export async function login(identifier: string, password: string) {
  const data = await api<{ jwt: string; user: { id: number; email: string; role?: UserRole; nome?: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  })
  if (data.jwt) {
    setToken(data.jwt)
  }
  return data
}

export async function getAdminNoticias(filters?: NoticiasFilters) {
  const params: Record<string, string> = {
    page: filters?.page ?? '1',
    pageSize: filters?.pageSize ?? '10',
  }
  if (filters?.editoriaId) params.editoriaId = filters.editoriaId
  if (filters?.autorId) params.autorId = filters.autorId
  if (filters?.dataInicio) params.dataInicio = filters.dataInicio
  if (filters?.dataFim) params.dataFim = filters.dataFim
  if (filters?.q) params.q = filters.q
  const res = await api<{ data: NoticiaRow[]; meta: NoticiasListMeta }>('/api/admin/noticias', { params })
  const data = res.data ?? []
  const meta = res.meta ?? { total: 0, page: 1, pageSize: 10, pageCount: 0 }
  return { data, meta }
}

export async function getNoticiaById(id: number) {
  const data = await api<{ data: NoticiaRow }>(`/api/admin/noticias/${id}`)
  return data.data
}

export async function updateNoticia(id: number, payload: Partial<CreateNoticiaPayload> & { status?: string; observacaoRevisao?: string | null; destaqueOrdem?: number | null; metaTitle?: string; metaDescription?: string; metaKeywords?: string; publishedAt?: string }) {
  const res = await api<{ data: NoticiaRow }>(`/api/admin/noticias/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: payload }),
  })
  return res.data
}

export async function getAdminStats() {
  const data = await api<{ data: { noticiasRascunho: number; noticiasEmRevisao: number; noticiasPublicadas: number; noticiasTotal: number } }>('/api/admin/stats')
  return data.data
}

export type ProfileStats = {
  artigosCriadosEstaSemana: number
  atividadePorDia: number[]
}

export async function getAdminStatsMe(): Promise<ProfileStats> {
  const data = await api<{ data: ProfileStats }>('/api/admin/stats/me')
  return data.data
}

export async function getAdminUsuarios() {
  const res = await api<{ data: UsuarioRow[] }>('/api/admin/usuarios')
  return res.data ?? []
}

export async function getUsuarioById(id: number) {
  const data = await api<{ data: UsuarioRow }>(`/api/admin/usuarios/${id}`)
  return data.data
}

export async function updateUsuario(id: number, payload: { nome?: string; email?: string; role?: string }) {
  const res = await api<{ data: UsuarioRow }>(`/api/admin/usuarios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: payload }),
  })
  return res.data
}

export async function createUsuario(payload: { nome: string; email: string; password: string; role: string }) {
  const res = await api<{ data: UsuarioRow }>('/api/admin/usuarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function getMidias() {
  const data = await api<{ data: MediaRow[] }>('/api/admin/midias')
  return data.data || []
}

export async function uploadMidia(file: File) {
  const form = new FormData()
  form.append('file', file)
  const token = getToken()
  const base = getApiUrlForAssets()
  const res = await fetch(new URL('/api/admin/midias', base).toString(), {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    if (res.status === 401) {
      clearToken()
      try {
        window.dispatchEvent(new CustomEvent('n360-unauthorized'))
      } catch {}
    }
    const err = await res.json().catch(() => ({}))
    const msg = (err as { message?: string; error?: { message?: string } })?.error?.message ?? (err as { message?: string })?.message ?? res.statusText
    throw new Error(msg)
  }
  const json = await res.json()
  return json.data as MediaRow
}

export async function deleteMidia(id: number) {
  const base = getApiUrlForAssets()
  const token = getToken()
  const res = await fetch(new URL(`/api/admin/midias/${id}`, base).toString(), {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    if (res.status === 401) {
      clearToken()
      try {
        window.dispatchEvent(new CustomEvent('n360-unauthorized'))
      } catch {}
    }
    const err = await res.json().catch(() => ({}))
    const msg = (err as { message?: string; error?: { message?: string } })?.error?.message ?? (err as { message?: string })?.message ?? res.statusText
    throw new Error(msg)
  }
}

export async function deleteMidiasBulk(ids: number[]): Promise<number> {
  const res = await api<{ deleted: number }>('/api/admin/midias/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
  return res.deleted
}

export async function getEditorias() {
  const data = await api<{ data: { id: number; nome: string; slug: string }[] }>('/editorias')
  return data.data || []
}

export async function getAutores() {
  const data = await api<{ data: { id: number; nome: string }[] }>('/autores')
  return data.data || []
}

export async function createNoticia(payload: CreateNoticiaPayload) {
  return api<{ data: unknown }>('/api/admin/noticias', {
    method: 'POST',
    body: JSON.stringify({ data: payload }),
  })
}

/** Tema (identidade visual) – GET é público; PATCH exige auth */
export async function getThemeFromApi(): Promise<{ primary: string; secondary: string }> {
  const base = getApiUrlForAssets()
  const url = `${base}/api/admin/settings/theme`
  const res = await fetch(url)
  if (!res.ok) return { primary: '#E30613', secondary: '#004796' }
  const data = await res.json() as { data?: { primary?: string; secondary?: string } }
  const t = data?.data
  if (t?.primary && t?.secondary) return { primary: t.primary, secondary: t.secondary }
  return { primary: '#E30613', secondary: '#004796' }
}

export async function saveThemeToApi(theme: { primary: string; secondary: string }): Promise<void> {
  await api<{ data: unknown }>('/api/admin/settings/theme', {
    method: 'PATCH',
    body: JSON.stringify(theme),
  })
}
