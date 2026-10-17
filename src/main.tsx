import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './state/store'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root was not found')

createRoot(container).render(
  <StrictMode>
    <HashRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </HashRouter>
  </StrictMode>
)
