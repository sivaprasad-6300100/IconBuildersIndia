import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react'

const LINKS = {
  Platform: [['Home','/'],['Cost Estimator','/estimator'],['Login','/login']],
  Services: [['New Construction','/#services'],['Renovation','/#services'],['Commercial','/#services'],['Interior Design','/#services']],
  Company:  [['About Us','/#about'],['Our Projects','/#projects'],['How It Works','/#how-it-works'],['Contact','/#contact']],
}

export default function Footer() {
  const year = new Date().getFullYear()
  const scrollTo = (href) => { if (href.startsWith('/#')) document.getElementById(href.replace('/#',''))?.scrollIntoView({ behavior:'smooth' }) }

  return (
    <footer className="bg-navy-mid border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gold/20 rounded-lg rotate-45 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-gold font-black text-sm">R</span></div>
              </div>
              <div>
                <div className="font-black text-xl tracking-tight leading-none"><span className="text-cream">RELIA</span><span className="text-gold">STATE</span></div>
                <div className="text-[0.5rem] tracking-[0.2em] text-slate-soft uppercase mt-0.5">AI-Powered Platform</div>
              </div>
            </Link>
            <p className="text-slate-soft text-sm leading-relaxed mb-6 max-w-xs">India's first AI-powered construction management platform. Building trust through transparency, technology, and timely delivery.</p>
            <div className="space-y-2 mb-6">
              {[[Phone,'+91 98765 43210'],[Mail,'hello@iconbuilderindia.com'],[MapPin,'Hyderabad, Telangana, India']].map(([Icon,v]) => (
                <div key={v} className="flex items-center gap-2 text-sm text-slate-soft"><Icon size={13} className="text-gold/60 flex-shrink-0" /><span>{v}</span></div>
              ))}
            </div>
            <div className="flex gap-2">
              {[[Instagram,'Instagram'],[Youtube,'YouTube'],[Linkedin,'LinkedIn'],[Twitter,'Twitter']].map(([Icon,label]) => (
                <a key={label} href="#" aria-label={label} className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-slate-soft hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-cream font-bold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('/#')
                      ? <button onClick={() => scrollTo(href)} className="text-slate-soft text-sm hover:text-gold transition-colors hover:translate-x-1 transform inline-block">{label}</button>
                      : <Link to={href} className="text-slate-soft text-sm hover:text-gold transition-colors hover:translate-x-1 transform inline-block">{label}</Link>
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gold/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-soft text-xs">© {year} ReliaState — iconbuilderindia.com. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-soft">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
          </div>
          <p className="text-slate-soft text-xs">Built with ❤️ in Hyderabad</p>
        </div>
      </div>
    </footer>
  )
}
