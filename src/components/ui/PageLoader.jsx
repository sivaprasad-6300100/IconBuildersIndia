export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-navy flex flex-col items-center justify-center z-50">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-4xl font-black tracking-tight">
          <span className="text-cream">RELIA</span>
          <span className="text-gold">STATE</span>
        </div>
        <div className="text-xs text-slate-soft tracking-widest mt-1 uppercase">
          AI-Powered Platform
        </div>
      </div>

      {/* Spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-gold/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-gold rounded-full animate-spin" />
      </div>

      <p className="text-slate-soft text-xs mt-4 tracking-widest uppercase animate-pulse">
        Loading...
      </p>
    </div>
  )
}
