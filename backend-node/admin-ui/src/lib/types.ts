// Tipos centralizados para evitar duplicação

export type UserRole = 'JORNALISTA' | 'EDITOR_CHEFE' | 'MARKETING_SEO' | 'GESTOR'

export type NoticiaRow = {
  id: number
  titulo: string
  slug: string
  subtitulo?: string
  conteudo?: string
  status?: string
  observacaoRevisao?: string | null
  imagemDestaque?: string
  destaqueOrdem?: number | null
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string | null
  editoria?: { id: number; nome: string; slug: string }
  autor?: { id: number; nome: string }
  updatedAt?: string
  publishedAt?: string | null
}

export type UsuarioRow = {
  id: number
  email: string
  nome: string
  role: string
  createdAt?: string
  updatedAt?: string
}

export type MediaRow = {
  id: number
  filename: string
  path: string
  mimeType: string
  size: number
  createdAt: string
}

export type NoticiasFilters = {
  editoriaId?: string
  autorId?: string
  dataInicio?: string
  dataFim?: string
  q?: string
  page?: string
  pageSize?: string
}

export type NoticiasListMeta = {
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export type CreateNoticiaPayload = {
  titulo: string
  slug?: string
  subtitulo?: string
  conteudo: string
  imagemDestaque?: string
  editoriaId: number
  autorId: number
  status?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}
