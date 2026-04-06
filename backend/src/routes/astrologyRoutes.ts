import { Router } from 'express'
import { calculateNatalChart, generatePaidChart, getMyCharts, getCurrentSky, syncNatal, generateSummaryForExistingChart } from '../controllers/astrologyController.js'
import { requireClerkAuth } from '../middleware/clerkAuth.js'

const router = Router()

// Endpoint pubblico (nessuna auth) - Cielo attuale per la landing
router.get('/current-sky', getCurrentSky)

// Endpoint gratuito (ora pubblico per calcolo Ascendente ospiti)
router.post('/calculate-free', calculateNatalChart)

// Sincronizzazione post-login
router.post('/sync-natal', requireClerkAuth, syncNatal)

// Endpoints a pagamento e di log
router.post('/generate-paid', requireClerkAuth, generatePaidChart)
router.get('/my-charts', requireClerkAuth, getMyCharts)
router.post('/generate-summary', requireClerkAuth, generateSummaryForExistingChart)

export default router
