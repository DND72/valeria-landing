import { Routes, Route } from 'react-router-dom'
import StarField from './components/StarField'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import About from './components/About'
import Gallery from './components/Gallery'
import HowItWorks from './components/HowItWorks'
import Reviews from './components/Reviews'
import TarotAppPromo from './components/TarotAppPromo'
import BookingSection from './components/BookingSection'
import Footer from './components/Footer'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import Dashboard from './pages/Dashboard'

function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <About />
      <Gallery />
      <HowItWorks />
      <Reviews />
      <TarotAppPromo />
      <BookingSection />
    </>
  )
}

export default function App() {
  return (
    <div className="relative min-h-screen bg-dark-500 text-white overflow-x-hidden">
      <StarField />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/accedi" element={<SignInPage />} />
          <Route path="/registrati" element={<SignUpPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
