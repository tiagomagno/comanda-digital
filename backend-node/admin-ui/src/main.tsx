import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/react-query'
import { Toaster } from 'sonner'
import { loadTheme, applyThemeToDocument, applyDarkModeToDocument } from './lib/theme'
import './index.css'
import App from './App.tsx'

try {
  const theme = loadTheme()
  applyThemeToDocument(theme)
  applyDarkModeToDocument(theme.darkMode ?? false)
} catch {
  // ignora falha no tema (localStorage ou CSS)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
        <App />
      </Suspense>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  </StrictMode>,
)
