import { useLayoutEffect } from 'react'
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom'
import CookieConsent from 'react-cookie-consent'
import CosmicBackground from './components/CosmicBackground'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import About from './components/About'
import Gallery from './components/Gallery'
import HowItWorks from './components/HowItWorks'
import Reviews from './components/Reviews'
import TarotAppPromo from './components/TarotAppPromo'
import AstrologyPromo from './components/AstrologyPromo'
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
import BiWheelPage from './pages/dashboard/BiWheelPage'
import MentorePage from './pages/dashboard/MentorePage'
import SynastryPage from './pages/SynastryPage'

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
      <AstrologyPromo />
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
            <Route path="/crescita-personale" element={<PersonalGrowthPage />} />
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
            <Route path="/area-personale/bi-wheel" element={<BiWheelPage />} />
            <Route path="/area-personale/mentore" element={<MentorePage />} />
            <Route path="/cielo" element={<CurrentSkyPage />} />

            <Route path="/sessione/:id" element={<LiveSessionPage />} />
            <Route path="/affinita-di-coppia" element={<SynastryPage />} />
      </Routes>
    </RouteErrorBoundary>
  )
}

export default function App() {
  const { pathname } = useLocation()
  
  // Hub Immersivo: Staff e Clienti vedono un'area pulita senza Navbar/Footer globali
  const isDashboardArea = pathname.startsWith('/area-personale')
  const isStaffArea = pathname.startsWith('/control-room') || pathname.startsWith('/gestione-')
  const isImmersiveHub = isDashboardArea || isStaffArea

  return (
    <div className="relative min-h-screen bg-dark-500 text-white overflow-x-hidden">
      <ScrollToTop />
      <CosmicBackground />
      {!isImmersiveHub && <Navbar />}
      <main className={`relative z-0 ${isImmersiveHub ? 'pt-0' : 'pt-24 md:pt-28'}`}>
        <div className={isImmersiveHub ? 'w-full' : 'max-w-7xl mx-auto px-4'}>
          {!isImmersiveHub && <Breadcrumbs />}
          <AppRoutes />
        </div>
      </main>

      {!isImmersiveHub && <Footer />}

      <CookieConsent
        location="bottom"
        buttonText="Accetto"
        declineButtonText="Rifiuta"
        enableDeclineButton={true}
        cookieName="valeria_landing_consent"
        style={{ 
          background: "rgba(10, 26, 47, 0.95)",
          color: "#f5f0e8",
          fontSize: "13px",
          borderTop: "1px solid rgba(212, 160, 23, 0.3)",
          backdropFilter: "blur(8px)",
          alignItems: "center",
          padding: "12px 24px",
          zIndex: 9999
        }}
        buttonStyle={{ 
          background: "linear-gradient(90deg, #d4a017, #b8860b)",
          color: "#0a1a2f",
          fontSize: "13px",
          fontWeight: "600",
          borderRadius: "6px",
          padding: "8px 24px",
          cursor: "pointer",
          margin: "5px"
        }}
        declineButtonStyle={{
          background: "transparent",
          color: "rgba(245, 240, 232, 0.5)",
          fontSize: "13px",
          borderRadius: "6px",
          border: "1px solid rgba(245, 240, 232, 0.2)",
          padding: "8px 24px",
          cursor: "pointer",
          margin: "5px"
        }}
        expires={30}
      >
        Noi utilizziamo cookie tecnici e di terze parti (Stripe, Clerk) per garantirti la migliore esperienza di consulenza e sicurezza. 
        Proseguendo la navigazione o cliccando su Accetto, acconsenti al loro utilizzo. 
        Leggi la nostra <Link to="/cookie" className="text-gold-400 hover:underline">Cookie Policy</Link> per maggiori dettagli.
      </CookieConsent>
    </div>
  )
}
