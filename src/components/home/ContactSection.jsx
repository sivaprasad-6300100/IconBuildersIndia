import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Phone, Mail, MapPin, MessageCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const INQUIRY_TYPES = ['New Construction', 'Renovation', 'Commercial', 'Interior Design', 'Other']

export default function ContactSection() {
  const [form, setForm] = useState({ name:'', phone:'', email:'', city:'', inquiryType:'New Construction', plotSize:'', message:'' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) { toast.error('Please fill name and phone number'); return }
    if (form.phone.length < 10) { toast.error('Enter a valid 10-digit phone number'); return }
    setLoading(true)
    try {
      await fetch('/api/inquiries', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    } catch {}
    setTimeout(() => { setLoading(false); setSubmitted(true); toast.success("Inquiry submitted! We'll call you within 24 hours.") }, 800)
  }

  return (
    <section id="contact" className="section-pad bg-navy relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none" style={{ background:'radial-gradient(ellipse, rgba(201,168,76,0.05) 0%, transparent 70%)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">Contact Us</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream mb-4">Let's Build Your<br /><span className="text-shimmer">Dream Together</span></h2>
          <p className="text-slate-soft text-lg max-w-2xl mx-auto">Share your requirements and our team will get back within 24 hours with a free cost estimate.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          {/* Left info */}
          <motion.div initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="lg:col-span-2 space-y-4">
            {[
              { icon: Phone,         label:'Call Us',    value:'+91 98765 43210',           sub:'Mon–Sat, 9AM–7PM' },
              { icon: MessageCircle, label:'WhatsApp',   value:'+91 98765 43210',           sub:'Quick response guaranteed' },
              { icon: Mail,          label:'Email',      value:'hello@iconbuilderindia.com', sub:'Reply within 4 hours' },
              { icon: MapPin,        label:'Office',     value:'Hyderabad, Telangana',       sub:'Serving all of India' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }}
                className="glass border border-white/8 rounded-xl p-4 flex items-start gap-4 hover:border-gold/20 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                  <item.icon size={18} className="text-gold" />
                </div>
                <div>
                  <div className="text-xs text-slate-soft uppercase tracking-wider mb-0.5">{item.label}</div>
                  <div className="text-cream font-semibold text-sm">{item.value}</div>
                  <div className="text-slate-soft text-xs mt-0.5">{item.sub}</div>
                </div>
              </motion.div>
            ))}
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] font-bold text-sm hover:bg-[#25D366]/20 transition-all duration-300 hover:-translate-y-0.5">
              <MessageCircle size={18} /> Chat on WhatsApp Now
            </a>
          </motion.div>

          {/* Right form */}
          <motion.div initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="lg:col-span-3">
            <div className="glass border border-gold/15 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/8 rounded-full blur-3xl pointer-events-none" />
              {submitted ? (
                <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-400/10 border border-green-400/25 flex items-center justify-center mb-6">
                    <CheckCircle size={36} className="text-green-400" />
                  </div>
                  <h3 className="text-cream font-bold text-2xl mb-3">Inquiry Received!</h3>
                  <p className="text-slate-soft text-sm max-w-xs leading-relaxed">Our team will call you within 24 hours with a detailed plan and free cost estimate.</p>
                  <div className="mt-6 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold">
                    Reference: REL-{Math.floor(Math.random()*9000)+1000}
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  <h3 className="text-cream font-bold text-xl mb-6">Send Us Your Requirements</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[['name','Full Name *','Your full name'],['phone','Phone Number *','10-digit mobile']].map(([n,l,p]) => (
                      <div key={n}><label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">{l}</label>
                        <input name={n} value={form[n]} onChange={handleChange} placeholder={p} maxLength={n==='phone'?10:undefined}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 focus:bg-gold/5 transition-all" /></div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[['email','Email Address','your@email.com'],['city','City','Hyderabad, Mumbai...']].map(([n,l,p]) => (
                      <div key={n}><label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">{l}</label>
                        <input name={n} value={form[n]} onChange={handleChange} placeholder={p} type={n==='email'?'email':'text'}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 focus:bg-gold/5 transition-all" /></div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Inquiry Type</label>
                      <select name="inquiryType" value={form.inquiryType} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-navy-mid border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/40 transition-all">
                        {INQUIRY_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Plot Size (sqft)</label>
                      <input name="plotSize" value={form.plotSize} onChange={handleChange} placeholder="e.g. 1200"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 focus:bg-gold/5 transition-all" /></div>
                  </div>
                  <div><label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your dream project..." rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted resize-none focus:outline-none focus:border-gold/40 focus:bg-gold/5 transition-all" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-4 rounded-xl btn-gold text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? <><div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Submitting...</> : <><Send size={15} />Send My Inquiry — It's Free</>}
                  </button>
                  <p className="text-center text-xs text-slate-soft">🔒 Your details are safe. No spam. We call within 24 hours.</p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
