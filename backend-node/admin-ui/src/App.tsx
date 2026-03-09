import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AdminLayout } from '@/components/Layout/AdminLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Login } from '@/pages/Login'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Code splitting - lazy load de páginas
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const NoticiasList = lazy(() => import('@/pages/NoticiasList').then(m => ({ default: m.NoticiasList })))
const NoticiaEdit = lazy(() => import('@/pages/NoticiaEdit').then(m => ({ default: m.NoticiaEdit })))
const Midias = lazy(() => import('@/pages/Midias').then(m => ({ default: m.Midias })))
const UsuariosList = lazy(() => import('@/pages/UsuariosList').then(m => ({ default: m.UsuariosList })))
const UsuarioEdit = lazy(() => import('@/pages/UsuarioEdit').then(m => ({ default: m.UsuarioEdit })))
const UsuarioPerfil = lazy(() => import('@/pages/UsuarioPerfil').then(m => ({ default: m.UsuarioPerfil })))
const Perfil = lazy(() => import('@/pages/Perfil').then(m => ({ default: m.Perfil })))
const Configuracoes = lazy(() => import('@/pages/Configuracoes').then(m => ({ default: m.Configuracoes })))
const NotasEditoriais = lazy(() => import('@/pages/NotasEditoriais').then(m => ({ default: m.NotasEditoriais })))
const Suporte = lazy(() => import('@/pages/Suporte').then(m => ({ default: m.Suporte })))

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter basename="/admin">
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
                <Route path="noticias" element={<Suspense fallback={<LoadingSpinner />}><NoticiasList /></Suspense>} />
                <Route path="noticias/nova" element={<Suspense fallback={<LoadingSpinner />}><NoticiaEdit /></Suspense>} />
                <Route path="noticias/:id/editar" element={<Suspense fallback={<LoadingSpinner />}><NoticiaEdit /></Suspense>} />
                <Route path="midias" element={<Suspense fallback={<LoadingSpinner />}><Midias /></Suspense>} />
                <Route path="usuarios" element={<Suspense fallback={<LoadingSpinner />}><UsuariosList /></Suspense>} />
                <Route path="usuarios/:id" element={<Suspense fallback={<LoadingSpinner />}><UsuarioPerfil /></Suspense>} />
                <Route path="usuarios/:id/editar" element={<Suspense fallback={<LoadingSpinner />}><UsuarioEdit /></Suspense>} />
                <Route path="perfil" element={<Suspense fallback={<LoadingSpinner />}><Perfil /></Suspense>} />
                <Route path="configuracoes" element={<Suspense fallback={<LoadingSpinner />}><Configuracoes /></Suspense>} />
                <Route path="notas-editoriais" element={<Suspense fallback={<LoadingSpinner />}><NotasEditoriais /></Suspense>} />
                <Route path="suporte" element={<Suspense fallback={<LoadingSpinner />}><Suporte /></Suspense>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
