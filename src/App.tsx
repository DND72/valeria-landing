import { useLayoutEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
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
import PersonalGrowthPage from './pages/PersonalGrowthPage'
import ArticlePage from './pages/ArticlePage'
import GraziePage from './pages/GraziePage'
import ControlRoom from './pages/ControlRoom'
import ClientManagementPage from './pages/ClientManagementPage'
import ClientDetailPage from './pages/ClientDetailPage'
import StaffBlogCommentsPage from './pages/StaffBlogCommentsPage'
import StaffReviewsPage from './pages/StaffReviewsPage'
import RouteErrorBoundary from './components/RouteErrorBoundary'

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

function AppRoutes() {
  const { pathname } = useLocation()

  // Clerk / widget esterni a volte lasciano overflow:hidden o position:fixed sul body.
  // Ripristina lo scroll quando si cambia pagina (es. uscita da Dashboard / modali).
  useLayoutEffect(() => {
    const body = document.body
    const html = document.documentElement
    body.style.removeProperty('overflow')
    html.style.removeProperty('overflow')
    body.style.removeProperty('position')
    body.style.removeProperty('width')
    body.style.removeProperty('height')
    body.style.removeProperty('padding-right')
  }, [pathname])

  return (
    <RouteErrorBoundary key={pathname}>
      <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/accedi/*" element={<SignInPage />} />
            <Route path="/registrati/*" element={<SignUpPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/control-room" element={<ControlRoom />} />
            <Route path="/gestione-clienti" element={<ClientManagementPage />} />
            <Route path="/gestione-clienti/:email" element={<ClientDetailPage />} />
            <Route path="/gestione-recensioni" element={<StaffReviewsPage />} />
            <Route path="/gestione-commenti-blog" element={<StaffBlogCommentsPage />} />
            <Route path="/grazie" element={<GraziePage />} />
            <Route path="/crescita-personale" element={<PersonalGrowthPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticlePage />} />
      </Routes>
    </RouteErrorBoundary>
  )
}

export default function App() {
  return (
    <div className="relative min-h-screen bg-dark-500 text-white overflow-x-hidden">
      <CosmicBackground />
      <Navbar />
      <main className="relative z-0">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  )
}
