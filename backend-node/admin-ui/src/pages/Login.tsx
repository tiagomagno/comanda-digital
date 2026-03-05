import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { login, type UserRole } from '@/lib/api'
import { User, Lock, AlertCircle, Newspaper, Clock, Globe, Zap } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(identifier.trim(), password)
      const role = (data.user?.role || 'JORNALISTA') as UserRole
      setUser({ id: data.user.id, email: data.user.email, role, nome: data.user?.nome ?? undefined })
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login falhou.'
      setError(msg === 'Failed to fetch' ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando (npm run dev em backend-node).' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── PAINEL ESQUERDO: Formulário ─── */}
      <div style={{
        flex: '0 0 480px',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        boxShadow: '4px 0 24px rgba(0,0,0,.07)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ width: '100%', marginBottom: '2.5rem' }}>
          <img
            src="/admin/logo-noticias360.webp"
            alt="Notícias +360"
            style={{ height: '48px', width: 'auto', display: 'block' }}
          />
        </div>

        {/* Cabeçalho */}
        <div style={{ width: '100%', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: '0.5rem' }}>
            Bem-vindo ao Painel
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>
            Acesse com suas credenciais para gerenciar o conteúdo da{' '}
            <span style={{ color: '#E30614', fontWeight: 600 }}>Notícias +360</span>.
          </p>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap' }}>Acesso restrito</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Erro */}
        {error && (
          <div style={{
            width: '100%',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.7rem 0.9rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>

          {/* Campo: identificador */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label htmlFor="identifier" style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.4rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              E-mail ou usuário
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={15}
                color="#9ca3af"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                id="identifier"
                type="text"
                inputMode="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                placeholder="seu@email.com ou usuário"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem 0.75rem 2.5rem',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  color: '#111827',
                  background: '#fff',
                  outline: 'none',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#E30614'
                  e.target.style.boxShadow = '0 0 0 3px rgba(227,6,20,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Campo: senha */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.4rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                color="#9ca3af"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem 0.75rem 2.5rem',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  color: '#111827',
                  background: '#fff',
                  outline: 'none',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#E30614'
                  e.target.style.boxShadow = '0 0 0 3px rgba(227,6,20,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading ? '#f87171' : '#E30614',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 14px rgba(227,6,20,0.3)',
              transition: 'background .2s, box-shadow .2s, transform .1s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.background = '#b8040f'
                  ; (e.target as HTMLButtonElement).style.boxShadow = '0 6px 18px rgba(227,6,20,0.4)'
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.background = '#E30614'
                  ; (e.target as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(227,6,20,0.3)'
              }
            }}
          >
            {loading ? 'Entrando…' : 'Entrar no Painel'}
          </button>
        </form>
      </div>

      {/* ─── PAINEL DIREITO: Decorativo ─── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #004796 0%, #001f45 60%, #1a0005 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Círculo decorativo 1 */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(227,6,20,0.12)',
          top: '-150px',
          right: '-150px',
          pointerEvents: 'none',
        }} />

        {/* Círculo decorativo 2 */}
        <div style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          bottom: '-80px',
          left: '-80px',
          pointerEvents: 'none',
        }} />

        {/* Conteúdo */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '420px' }}>

          {/* Logo (invertida branca) */}
          <div style={{ marginBottom: '2.5rem' }}>
            <img
              src="/admin/logo-noticias360.webp"
              alt="Notícias +360"
              style={{
                height: '64px',
                width: 'auto',
                display: 'block',
                margin: '0 auto',
                filter: 'brightness(0) invert(1)',
                opacity: 0.9,
              }}
            />
          </div>

          <h2 style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.3,
            marginBottom: '1rem',
          }}>
            O portal de notícias que{' '}
            <em style={{ fontStyle: 'normal', color: '#fca5a5' }}>conecta</em>{' '}
            sua cidade
          </h2>

          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}>
            Gerencie todo o conteúdo editorial — notícias, categorias, mídias e muito mais — em um painel centralizado e intuitivo.
          </p>

          {/* Cards de stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { icon: <Globe size={18} color="#fca5a5" />, value: '360°', label: 'Cobertura completa' },
              { icon: <Clock size={18} color="#fca5a5" />, value: '24/7', label: 'Publicação contínua' },
              { icon: <Newspaper size={18} color="#fca5a5" />, value: '100%', label: 'Conteúdo local' },
              { icon: <Zap size={18} color="#fca5a5" />, value: '∞', label: 'Possibilidades' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                textAlign: 'left',
                backdropFilter: 'blur(6px)',
              }}>
                <div style={{ marginBottom: '0.4rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1, marginBottom: '0.25rem' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
