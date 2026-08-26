import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'
import 'leaflet/dist/leaflet.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d2035',
              color: '#e8d5a3',
              border: '1px solid rgba(201,168,76,0.3)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
            },
            success: {
              iconTheme: { primary: '#c9a84c', secondary: '#0d2035' },
            },
            error: {
              iconTheme: { primary: '#e07a7a', secondary: '#0d2035' },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
