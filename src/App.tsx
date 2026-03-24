import StarField from './components/StarField'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import About from './components/About'
import HowItWorks from './components/HowItWorks'
import Reviews from './components/Reviews'
import TarotAppPromo from './components/TarotAppPromo'
import BookingSection from './components/BookingSection'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="relative min-h-screen bg-dark-500 text-white overflow-x-hidden">
      <StarField />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <HowItWorks />
        <Reviews />
        <TarotAppPromo />
        <BookingSection />
      </main>
      <Footer />
    </div>
  )
}
