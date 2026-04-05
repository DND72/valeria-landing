import { Router } from 'express'
import { calculateNatalChart, generatePaidChart, getMyCharts } from '../controllers/astrologyController.js'
import { requireClerkAuth } from '../middleware/clerkAuth.js'

const router = Router()

// Endpoint gratuito as API
router.post('/calculate-free', requireClerkAuth, calculateNatalChart)

// Endpoints a pagamento e di log
router.post('/generate-paid', requireClerkAuth, generatePaidChart)
router.get('/my-charts', requireClerkAuth, getMyCharts)

export default router
