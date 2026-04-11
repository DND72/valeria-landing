import { useLayoutEffect } from 'react'
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom'
import CookieConsent from 'react-cookie-consent'
import CosmicBackground from './components/CosmicBackground'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import AstrologyPromo from './components/AstrologyPromo'
import ServicesGrid from './components/ServicesGrid'
import HomeFaq from './components/HomeFaq'
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
import FaqPage from './pages/FaqPage'
import TermsOfService from './pages/legal/TermsOfService'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import CookiePolicy from './pages/legal/CookiePolicy'
import ProfilePage from './pages/ProfilePage'
import WalletPage from './pages/WalletPage'
import NatalChartPage from './pages/NatalChartPage'
import PaidNatalCharts from './pages/PaidNatalCharts'
import MyConsultsPage from './pages/MyConsultsPage'
import CurrentSkyPage from './pages/CurrentSkyPage'
import RouteErrorBoundary from './components/RouteErrorBoundary'
import StaffGuard from './components/StaffGuard'
import Breadcrumbs from './components/Breadcrumbs'
import LiveSessionPage from './pages/LiveSessionPage'
import LiveVideoPage from './pages/LiveVideoPage'
import VideoTestPage from './pages/VideoTestPage'
import MentorePage from './pages/dashboard/MentorePage'
import SynastryPage from './pages/SynastryPage'
import HeartTidesPage from './pages/HeartTidesPage'
import MyLiveConsultsPage from './pages/dashboard/MyLiveConsultsPage'
import StanzaSicuraPage from './pages/StanzaSicuraPage'
import AboutPage from './pages/AboutPage'
import TarocchiPage from './pages/TarocchiPage'
import TarocchiAmorePage from './pages/verticals/TarocchiAmore'
import TarocchiLavoroPage from './pages/verticals/TarocchiLavoro'
import TarocchiEvolutiviPage from './pages/verticals/TarocchiEvolutivi'
import TarocchiOnlinePage from './pages/verticals/TarocchiOnline'

import TrustPayments from './components/TrustPayments'

function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <AstrologyPromo />
      <TrustPayments />
      <ServicesGrid />
      <HomeFaq />
      <BookingSection />
    </>
  )
}

function AppRoutes() {
  const { pathname } = useLocation()

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
            <Route path="/dashboard" element={<Navigate to="/area-personale" replace />} />
            <Route path="/area-personale" element={<Dashboard />} />
            <Route path="/area-personale/astrologia" element={<Dashboard />} />

            <Route path="/area-personale/miei-consulti" element={<Navigate to="/area-personale/i-miei-consulti" replace />} />
            <Route path="/control-room" element={<StaffGuard><ControlRoom /></StaffGuard>} />
            <Route path="/gestione-clienti" element={<StaffGuard><ClientManagementPage /></StaffGuard>} />
            <Route path="/gestione-clienti/:email" element={<StaffGuard><ClientDetailPage /></StaffGuard>} />
            <Route path="/gestione-recensioni" element={<StaffGuard><StaffReviewsPage /></StaffGuard>} />
            <Route path="/gestione-commenti-blog" element={<StaffGuard><StaffBlogCommentsPage /></StaffGuard>} />
            <Route path="/grazie" element={<GraziePage />} />
            <Route path="/tarocchi" element={<TarocchiPage />} />
            <Route path="/crescita-personale" element={<PersonalGrowthPage />} />
            <Route path="/stanza-sicura" element={<StanzaSicuraPage />} />
            <Route path="/chi-sono" element={<AboutPage />} />
            <Route path="/tarocchi-amore" element={<TarocchiAmorePage />} />
            <Route path="/tarocchi-lavoro" element={<TarocchiLavoroPage />} />
            <Route path="/tarocchi-evolutivi" element={<TarocchiEvolutiviPage />} />
            <Route path="/tarocchi-online" element={<TarocchiOnlinePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticlePage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/termini" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cookie" element={<CookiePolicy />} />
            <Route path="/area-personale/profilo" element={<ProfilePage />} />
            <Route path="/area-personale/wallet" element={<WalletPage />} />
            <Route path="/area-personale/tema-natale" element={<NatalChartPage />} />
            <Route path="/area-personale/i-miei-temi" element={<PaidNatalCharts />} />
            <Route path="/area-personale/i-miei-consulti" element={<MyConsultsPage />} />
            <Route path="/area-personale/live" element={<MyLiveConsultsPage />} />
            <Route path="/area-personale/bi-wheel" element={<Navigate to="/affinita-di-coppia" replace />} />
            <Route path="/area-personale/mentore" element={<MentorePage />} />
            <Route path="/cielo" element={<CurrentSkyPage />} />

            <Route path="/sessione/:id" element={<LiveSessionPage />} />
            <Route path="/video-session/:id" element={<LiveVideoPage />} />
            <Route path="/video-test" element={<VideoTestPage />} />
            <Route path="/affinita-di-coppia" element={<SynastryPage />} />
            <Route path="/maree-del-cuore" element={<HeartTidesPage />} />
      </Routes>
    </RouteErrorBoundary>
  )
}

export default function App() {
  const { pathname } = useLocation()
  
  const isDashboardArea = pathname.startsWith('/area-personale')
  const isStaffArea = pathname.startsWith('/control-room') || pathname.startsWith('/gestione-')
  const isSessionArea = pathname.startsWith('/sessione') || pathname.startsWith('/video-session')
  const isVideoTest = pathname === '/video-test'
  
  const showGlobalUI = !isDashboardArea && !isStaffArea && !isSessionArea && !isVideoTest

  return (
    <div className="relative min-h-screen bg-dark-500 font-sans text-white overflow-x-hidden selection:bg-gold-500/30 selection:text-gold-200">
      <CosmicBackground />
      <ScrollToTop />
      
      {showGlobalUI && <Navbar />}

      <main className="relative z-10">
        {!isDashboardArea && !isStaffArea && !isSessionArea && !isVideoTest && <Breadcrumbs />}
        <AppRoutes />
      </main>

      {showGlobalUI && <Footer />}

      <CookieConsent
        location="bottom"
        buttonText="Accetto"
        cookieName="nonsolotarocchi-cookies"
        style={{ 
          background: "rgba(18, 18, 18, 0.95)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(212, 160, 23, 0.2)",
          color: "#fff",
          fontSize: "14px",
          zIndex: 2147483647
        }}
        buttonStyle={{ 
          backgroundColor: "#d4a017", 
          color: "#000", 
          fontSize: "13px", 
          fontWeight: "bold",
          borderRadius: "9999px",
          padding: "8px 25px"
        }}
      >
        Utilizziamo i cookie per migliorare la tua esperienza e analizzare il traffico. Cliccando "Accetto", acconsenti al loro utilizzo.{" "}
        <Link to="/cookie" className="text-gold-500 underline">Info</Link>
      </CookieConsent>
    </div>
  )
}
