import { Router } from 'express'
import { calculateNatalChart, generatePaidChart, getMyCharts, getCurrentSky } from '../controllers/astrologyController.js'
import { requireClerkAuth } from '../middleware/clerkAuth.js'

const router = Router()

// Endpoint pubblico (nessuna auth) - Cielo attuale per la landing
router.get('/current-sky', getCurrentSky)

// Endpoint gratuito per iscritti
router.post('/calculate-free', requireClerkAuth, calculateNatalChart)

// Endpoints a pagamento e di log
router.post('/generate-paid', requireClerkAuth, generatePaidChart)
router.get('/my-charts', requireClerkAuth, getMyCharts)

export default router
