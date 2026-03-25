import { Routes, Route } from 'react-router-dom'
import CosmicBackground from './components/CosmicBackground'
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
import BlogPage from './pages/BlogPage'
import ArticlePage from './pages/ArticlePage'
import GraziePage from './pages/GraziePage'

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
      <CosmicBackground />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/accedi/*" element={<SignInPage />} />
          <Route path="/registrati/*" element={<SignUpPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grazie" element={<GraziePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
