import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export type ContentHeaderProps = {
  title: string
  subtitle: string
  /** Placeholder da busca; se não informado, a busca não é exibida. */
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  /** Chamado ao pressionar Enter na busca (ex.: redirecionar para listagem com query). */
  onSearchSubmit?: () => void
}

/**
 * Bloco global do topo do conteúdo: título, subtítulo, busca personalizada e ícone do usuário com menu.
 * Usar em todas as páginas do painel para consistência.
 */
export function ContentHeader({
  title,
  subtitle,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
}: ContentHeaderProps) {
  const { user, logout } = useAuth()
  const profileRef = useRef<HTMLDivElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 pl-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-medium font-sans tracking-wide mb-2 text-primary truncate">
          {title}
        </h1>
        <p className="text-[13px] text-muted-foreground font-medium tracking-wide">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto flex-shrink-0">
        {searchPlaceholder != null && (
          <div className="relative w-full md:w-72 flex-shrink">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl pointer-events-none">search</span>
            <input
              type="text"
              value={searchValue}
              onChange={e => onSearchChange?.(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onSearchSubmit?.())}
              placeholder={searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-card rounded-full text-[13px] font-sans text-foreground focus:ring-1 focus:ring-primary focus:outline-none placeholder-muted-foreground border border-input shadow-sm dark:bg-accent dark:border-border"
              aria-label="Buscar"
            />
          </div>
        )}

        <button
          type="button"
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-secondary hover:ring-2 hover:ring-primary ring-offset-2 ring-offset-background transition-all shadow-sm shrink-0 border border-input dark:bg-accent dark:border-border dark:ring-offset-background"
          aria-label="Notificações"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>

        <div className="relative shrink-0" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary ring-offset-2 ring-offset-background transition-all dark:ring-offset-background"
            aria-label="Menu do perfil"
          >
            {user?.avatar ? (
              <img alt="" className="w-10 h-10 rounded-full ring-2 ring-card shadow-sm object-cover dark:ring-card" src={user.avatar} />
            ) : (
              <div className="w-10 h-10 rounded-full ring-2 ring-card shadow-sm bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm dark:ring-card">
                {user?.nome?.substring(0, 1).toUpperCase() || 'A'}
              </div>
            )}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-lg py-2 z-[100] dark:bg-card dark:border-border">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-medium text-card-foreground truncate">{user?.nome || 'Admin'}</p>
                <p className="text-[12px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Link
                to="/perfil"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-foreground hover:bg-accent dark:hover:bg-accent"
              >
                <User className="w-4 h-4" /> Perfil
              </Link>
              <button
                type="button"
                onClick={() => { setProfileOpen(false); logout(); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-foreground hover:bg-secondary/10 hover:text-secondary dark:hover:bg-secondary/20"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
