import { HashRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/* ── Global error handlers — catch async/network/import errors ── */
window.addEventListener('error', (e) => {
  /* ChunkLoadError and dynamic import failures */
  if (e.message?.includes('dynamically imported module') || e.message?.includes('Loading chunk')) {
    console.error('[Archive] Import error:', e.message)
  }
})

window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason
  if (reason instanceof Error) {
    console.error('[Archive] Unhandled rejection:', reason.message)
  }
})

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found (expected #root in index.html)')
createRoot(rootEl).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
