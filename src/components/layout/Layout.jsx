import Navbar from './Navbar'
import ChatWidget from '../chatbot/ChatWidget'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <main>{children}</main>
      <ChatWidget />
    </div>
  )
}
