import HeroSection     from '../components/home/HeroSection'
import AboutSection    from '../components/home/AboutSection'
import ServicesSection from '../components/home/ServicesSection'
import HowItWorks      from '../components/home/HowItWorks'
import ProjectShowcase from '../components/home/ProjectShowcase'
import ContactSection  from '../components/home/ContactSection'
import Footer          from '../components/layout/Footer'
import ParticleField   from '../components/home/ParticleField'

export default function HomePage() {
  return (
    <div className="bg-navy relative">
      <ParticleField />
      
      <div className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <HowItWorks />
        <ProjectShowcase />
        <ContactSection />
        <Footer />
      </div>
    </div>
  )
}