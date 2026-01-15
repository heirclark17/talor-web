import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { getUserId } from './utils/userSession'
import { ThemeProvider } from './contexts/ThemeContext'

// Initialize user session on app load
getUserId()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
