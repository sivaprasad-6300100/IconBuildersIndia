import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-black text-gold/20 mb-4">404</div>
      <h1 className="text-3xl font-bold text-cream mb-2">Page Not Found</h1>
      <p className="text-slate-soft text-sm mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-gold text-navy font-bold text-sm rounded-lg
                   hover:bg-gold-light transition-all duration-200
                   shadow-[0_0_20px_rgba(201,168,76,0.3)]"
      >
        Back to Home
      </button>
    </div>
  )
}
