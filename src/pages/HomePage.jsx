import HeroSection     from '../components/home/HeroSection'
import AboutSection    from '../components/home/AboutSection'
import ServicesSection from '../components/home/ServicesSection'
import HowItWorks      from '../components/home/HowItWorks'
import ProjectShowcase from '../components/home/ProjectShowcase'
import ContactSection  from '../components/home/ContactSection'
import Footer          from '../components/layout/Footer'

export default function HomePage() {
  return (
    <div className="bg-navy">
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <HowItWorks />
      <ProjectShowcase />
      <ContactSection />
      <Footer />
    </div>
  )
}
