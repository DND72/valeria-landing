import { Router } from 'express'
import { 
  calculateNatalChart, generatePaidChart, getMyCharts, getCurrentSky, syncNatal, 
  generateSummaryForExistingChart, getLatestChart, generateStaffChart,
  getPendingCharts, approveChart, getLatestHoroscope, generateFirstHoroscope, approveHoroscope
} from '../controllers/astrologyController.js'
import { requireClerkAuth, optionalClerkAuth, requireStaff } from '../middleware/clerkAuth.js'

const router = Router()

// Endpoint pubblico (nessuna auth) - Cielo attuale per la landing
router.get('/current-sky', getCurrentSky)

// Endpoint gratuito (ora con Auth Opzionale per catturare l'ID se l'utente è loggato)
router.post('/calculate-free', optionalClerkAuth, calculateNatalChart)

// Sincronizzazione post-login
router.post('/sync-natal', requireClerkAuth, syncNatal)
router.get('/latest', requireClerkAuth, getLatestChart)

// Endpoints a pagamento e di log
router.post('/generate-paid', requireClerkAuth, generatePaidChart)
router.get('/my-charts', requireClerkAuth, getMyCharts)
router.post('/generate-summary', requireClerkAuth, generateSummaryForExistingChart)

// Staff Management
router.post('/generate-staff', requireClerkAuth, requireStaff, generateStaffChart)
router.get('/staff/pending', requireClerkAuth, requireStaff, getPendingCharts)
router.post('/staff/approve', requireClerkAuth, requireStaff, approveChart)
router.get('/latest-horoscope', requireClerkAuth, getLatestHoroscope)
router.post('/generate-first-horoscope', requireClerkAuth, generateFirstHoroscope)
router.post('/staff/horoscope/approve', requireClerkAuth, requireStaff, approveHoroscope)

export default router
