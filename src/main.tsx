import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App tasks={[]} onClose={function (): void {
      throw new Error('Function not implemented.')
    } } generalTasks={[]} />
  </StrictMode>,
)
