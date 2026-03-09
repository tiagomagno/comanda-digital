import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, FileText, Image, Users, PanelLeftClose, PanelLeft, LogOut, Edit3, Settings, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useEditorias } from '@/hooks/useEditorias'

const SIDEBAR_COLLAPSED_KEY = 'n360_sidebar_collapsed'

export function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()
  const { data: editorias = [] } = useEditorias()
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0')
    } catch { }
  }, [collapsed])

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '5rem' : '16rem')
  }, [collapsed])

  const isNoticias = location.pathname.startsWith('/noticias')
  const isMidias = location.pathname.startsWith('/midias')
  const isUsuarios = location.pathname.startsWith('/usuarios')

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col transition-[width] duration-300 z-50 bg-card border-r border-border',
        'dark:bg-card dark:border-border',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* ─── Logo / Topo ─── */}
      <div className="h-20 flex items-center justify-center lg:justify-start px-4 py-3 relative group shrink-0">
        <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
          <img
            src="/admin/logo-noticias360.webp"
            alt="Notícias 360"
            className="w-auto transition-all duration-300"
            style={{
              height: collapsed ? '44px' : '48px',
              display: 'block',
              flexShrink: 0,
            }}
          />
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-card border border-border text-muted-foreground hover:text-secondary hover:border-secondary/30 shadow-md transition-all z-50 flex items-center justify-center opacity-100 dark:bg-accent dark:border-border"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <PanelLeft className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {/* ─── NAVEGAÇÃO PRINCIPAL ─── */}
      <div className="flex-1 px-4 py-3 min-h-0 overflow-hidden flex flex-col gap-3">
        <div>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/admin"
                active={location.pathname === '/admin' || location.pathname === '/'}
                collapsed={collapsed}
                icon={<Home className="w-[18px] h-[18px] shrink-0" />}
                label="Dashboard"
              />
            </li>
            <li>
              <NavLink
                to="/noticias"
                active={isNoticias}
                collapsed={collapsed}
                icon={<FileText className="w-[18px] h-[18px] shrink-0" />}
                label="Notícias"
              />
            </li>
            <li>
              <NavLink
                to="/usuarios"
                active={isUsuarios}
                collapsed={collapsed}
                icon={<Users className="w-[18px] h-[18px] shrink-0" />}
                label="Jornalistas"
              />
            </li>
            <li>
              <NavLink
                to="/midias"
                active={isMidias}
                collapsed={collapsed}
                icon={<Image className="w-[18px] h-[18px] shrink-0" />}
                label="Mídias"
              />
            </li>
            <li>
              <NavLink
                to="/notas-editoriais"
                active={location.pathname.startsWith('/notas-editoriais')}
                collapsed={collapsed}
                icon={<Edit3 className="w-[18px] h-[18px] shrink-0" />}
                label="Notas Editoriais"
              />
            </li>
          </ul>
        </div>

        {/* ─── EDITORIAS (categorias do site) ─── */}
        {!collapsed && (
          <div className="px-1 shrink-0">
            <span
              className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3 block"
            >
              Categorias
            </span>
            <ul className="space-y-1">
              {editorias.map((editoria) => (
                <li key={editoria.id}>
                  <Link
                    to={`/noticias?editoriaId=${editoria.id}`}
                    className="block px-2 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-secondary tracking-wider font-medium transition-all dark:text-muted-foreground dark:hover:text-secondary"
                  >
                    {editoria.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ─── CONFIG & SUPORTE E RODAPÉ ─── */}
        <div className="mt-auto shrink-0 flex flex-col pb-3">
          <div className="space-y-1">
            <NavLink
              to="/configuracoes"
              active={location.pathname.startsWith('/configuracoes')}
              collapsed={collapsed}
              icon={<Settings className="w-[18px] h-[18px] shrink-0" />}
              label="Configurações"
            />
            <NavLink
              to="/suporte"
              active={location.pathname.startsWith('/suporte')}
              collapsed={collapsed}
              icon={<HelpCircle className="w-[18px] h-[18px] shrink-0" />}
              label="Suporte"
            />
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <button
              type="button"
              onClick={logout}
              className={cn(
                "flex items-center gap-4 rounded-full font-medium transition-all text-[13px] tracking-wider text-muted-foreground hover:text-secondary hover:bg-secondary/5 w-full dark:hover:bg-accent",
                collapsed ? "justify-center p-3" : "justify-start px-4 py-3 group"
              )}
              title="Sair da conta"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0 group-hover:-translate-x-1 transition-transform" />
              {!collapsed && <span className="font-semibold">Sair da conta</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ─── NavLink auxiliar ─── */
function NavLink({
  to, active, collapsed, icon, label,
}: {
  to: string
  active: boolean
  collapsed: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-4 rounded-full font-medium transition-all text-[13px] tracking-wider",
        collapsed ? "justify-center p-3" : "justify-start px-4 py-3",
        active
          ? "text-primary bg-primary/5 hover:text-secondary hover:bg-secondary/5 hover:ring-2 hover:ring-primary/30 dark:bg-primary/10 dark:hover:bg-primary/15"
          : "text-muted-foreground hover:text-secondary hover:bg-accent/50 hover:ring-2 hover:ring-primary/20 dark:hover:bg-accent"
      )}
    >
      {icon}
      {!collapsed && <span className="font-semibold">{label}</span>}
    </Link>
  )
}
