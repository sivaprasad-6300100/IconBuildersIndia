import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Phone, Mail, MapPin, MessageCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const INQUIRY_TYPES = ['New Construction', 'Renovation', 'Commercial', 'Interior Design', 'Other']

const CONTACT_INFO = [
  { icon: Phone,         label: 'Call Us',  value: '+91 98765 43210',           sub: 'Mon–Sat, 9AM–7PM' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+91 98765 43210',           sub: 'Quick response guaranteed' },
  { icon: Mail,          label: 'Email',    value: 'hello@iconbuilderindia.com', sub: 'Reply within 4 hours' },
  { icon: MapPin,        label: 'Office',   value: 'Hyderabad, Telangana',       sub: 'Serving all of India' },
]

export default function ContactSection() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: '',
    inquiryType: 'New Construction', plotSize: '', message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) { toast.error('Please fill name and phone number'); return }
    if (form.phone.length < 10) { toast.error('Enter a valid 10-digit phone number'); return }
    setLoading(true)
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } catch {}
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      toast.success("Inquiry submitted! We'll call you within 24 hours.")
    }, 800)
  }

  return (
    <section id="contact" className="cont">
      <style>{`
        .cont {
          position: relative;
          overflow: hidden;
          background: rgba(13, 24, 38, 0.55);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          padding: 6rem 1.5rem;
        }

        .cont__glow {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 400px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%);
        }

        .cont__inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── Title ── */
        .cont__title-wrap {
          text-align: center;
          margin-bottom: 4rem;
        }
        .cont__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.06);
          margin-bottom: 1rem;
        }
        .cont__badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #c9a84c; }
        .cont__badge-text {
          color: #c9a84c; font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
        }
        .cont__heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 2rem;
          line-height: 1.2;
          color: #e8d5a3;
          margin: 0 0 1rem;
        }
        .cont__heading-accent { color: #c9a84c; }
        @media (min-width: 640px)  { .cont__heading { font-size: 2.75rem; } }
        @media (min-width: 1024px) { .cont__heading { font-size: 3.25rem; } }
        .cont__subtitle {
          color: #8fa3b8;
          font-size: 1rem;
          max-width: 42rem;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Layout ── */
        .cont__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .cont__grid { grid-template-columns: 2fr 3fr; gap: 2.5rem; }
        }

        /* ── Left info column ── */
        .cont__info-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cont__info-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.85rem;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.3s ease;
        }
        .cont__info-card:hover { border-color: rgba(201,168,76,0.25); }

        .cont__info-icon {
          flex-shrink: 0;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.75rem;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cont__info-label {
          color: #8fa3b8;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }
        .cont__info-value {
          color: #e8d5a3;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .cont__info-sub {
          color: #6b8099;
          font-size: 0.75rem;
          margin-top: 0.15rem;
        }

        .cont__whatsapp {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          width: 100%;
          padding: 1rem;
          margin-top: 0.5rem;
          border-radius: 0.85rem;
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.3);
          color: #25D366;
          font-weight: 700;
          font-size: 0.875rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .cont__whatsapp:hover {
          background: rgba(37,211,102,0.18);
          transform: translateY(-2px);
        }

        /* ── Right form column ── */
        .cont__form-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 1.25rem;
          padding: 1.75rem;
          overflow: hidden;
        }

        .cont__form-glow {
          position: absolute;
          top: -2.5rem;
          right: -2.5rem;
          width: 10rem;
          height: 10rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.08);
          filter: blur(48px);
          pointer-events: none;
        }

        .cont__form-title {
          position: relative;
          color: #e8d5a3;
          font-weight: 700;
          font-size: 1.25rem;
          margin: 0 0 1.5rem;
        }

        .cont__form {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cont__row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .cont__row { grid-template-columns: 1fr 1fr; }
        }

        .cont__field-label {
          display: block;
          color: #8fa3b8;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }

        .cont__input,
        .cont__select,
        .cont__textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e8d5a3;
          font-size: 0.875rem;
          font-family: inherit;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .cont__input::placeholder,
        .cont__textarea::placeholder {
          color: #55708a;
        }
        .cont__input:focus,
        .cont__select:focus,
        .cont__textarea:focus {
          outline: none;
          border-color: rgba(201,168,76,0.45);
          background: rgba(201,168,76,0.05);
        }
        .cont__select option {
          background: #0d1826;
          color: #e8d5a3;
        }
        .cont__textarea { resize: none; }

        .cont__submit {
          width: 100%;
          padding: 1rem;
          border-radius: 0.85rem;
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .cont__submit:hover:not(:disabled) { box-shadow: 0 0 24px rgba(201,168,76,0.35); }
        .cont__submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .cont__spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(7,20,34,0.3);
          border-top-color: #071422;
          border-radius: 50%;
          animation: cont-spin 0.7s linear infinite;
        }
        @keyframes cont-spin { to { transform: rotate(360deg); } }

        .cont__privacy {
          text-align: center;
          color: #6b8099;
          font-size: 0.72rem;
          margin: 0;
        }

        /* ── Success state ── */
        .cont__success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1rem;
        }
        .cont__success-icon {
          width: 5rem;
          height: 5rem;
          border-radius: 50%;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .cont__success-title {
          color: #e8d5a3;
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0 0 0.75rem;
        }
        .cont__success-text {
          color: #8fa3b8;
          font-size: 0.875rem;
          max-width: 20rem;
          line-height: 1.6;
        }
        .cont__success-ref {
          margin-top: 1.5rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.25);
          color: #c9a84c;
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* ══════════════════════════════════════════
           MOBILE (≤640px)
           ══════════════════════════════════════════ */
        @media (max-width: 640px) {
          .cont { padding: 3.5rem 1rem; }
          .cont__title-wrap { margin-bottom: 2.5rem; }
          .cont__heading { font-size: 1.6rem; margin-bottom: 0.75rem; }
          .cont__subtitle { font-size: 0.875rem; }
          .cont__grid { gap: 1.75rem; }
          .cont__form-card { padding: 1.25rem; }
          .cont__form-title { font-size: 1.1rem; }
          .cont__info-card { padding: 0.85rem; }
        }

        @media (max-width: 380px) {
          .cont__heading { font-size: 1.4rem; }
        }
      `}</style>

      <div className="cont__glow" />

      <div className="cont__inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="cont__title-wrap"
        >
          <div className="cont__badge">
            <span className="cont__badge-dot" />
            <span className="cont__badge-text">Contact Us</span>
          </div>
          <h2 className="cont__heading">
            Let's Build Your
            <br />
            <span className="cont__heading-accent">Dream Together</span>
          </h2>
          <p className="cont__subtitle">
            Share your requirements and our team will get back within 24 hours
            with a free cost estimate.
          </p>
        </motion.div>

        <div className="cont__grid">
          {/* Left — contact info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="cont__info-list"
          >
            {CONTACT_INFO.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="cont__info-card"
              >
                <div className="cont__info-icon">
                  <item.icon size={18} color="#c9a84c" />
                </div>
                <div>
                  <div className="cont__info-label">{item.label}</div>
                  <div className="cont__info-value">{item.value}</div>
                  <div className="cont__info-sub">{item.sub}</div>
                </div>
              </motion.div>
            ))}

            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cont__whatsapp"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp Now
            </a>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="cont__form-card">
              <div className="cont__form-glow" />

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="cont__success"
                >
                  <div className="cont__success-icon">
                    <CheckCircle size={36} color="#4ade80" />
                  </div>
                  <h3 className="cont__success-title">Inquiry Received!</h3>
                  <p className="cont__success-text">
                    Our team will call you within 24 hours with a detailed plan
                    and free cost estimate.
                  </p>
                  <div className="cont__success-ref">
                    Reference: REL-{Math.floor(Math.random() * 9000) + 1000}
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="cont__form">
                  <h3 className="cont__form-title">Send Us Your Requirements</h3>

                  <div className="cont__row">
                    <div>
                      <label className="cont__field-label">Full Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="cont__input"
                      />
                    </div>
                    <div>
                      <label className="cont__field-label">Phone Number *</label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        className="cont__input"
                      />
                    </div>
                  </div>

                  <div className="cont__row">
                    <div>
                      <label className="cont__field-label">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="cont__input"
                      />
                    </div>
                    <div>
                      <label className="cont__field-label">City</label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Hyderabad, Mumbai..."
                        className="cont__input"
                      />
                    </div>
                  </div>

                  <div className="cont__row">
                    <div>
                      <label className="cont__field-label">Inquiry Type</label>
                      <select
                        name="inquiryType"
                        value={form.inquiryType}
                        onChange={handleChange}
                        className="cont__select"
                      >
                        {INQUIRY_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="cont__field-label">Plot Size (sqft)</label>
                      <input
                        name="plotSize"
                        value={form.plotSize}
                        onChange={handleChange}
                        placeholder="e.g. 1200"
                        className="cont__input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="cont__field-label">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your dream project..."
                      rows={3}
                      className="cont__textarea"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="cont__submit">
                    {loading ? (
                      <>
                        <div className="cont__spinner" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Send My Inquiry — It's Free
                      </>
                    )}
                  </button>

                  <p className="cont__privacy">
                    🔒 Your details are safe. No spam. We call within 24 hours.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}