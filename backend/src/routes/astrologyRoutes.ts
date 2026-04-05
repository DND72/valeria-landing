import { Router } from 'express'
import { calculateNatalChart } from '../controllers/astrologyController.js'
import { requireClerkAuth } from '../middleware/clerkAuth.js'

const router = Router()

// Endpoint for calculating the birth chart (Ascendant)
// We protect it with Clerk authentication
router.post('/calculate', requireClerkAuth, calculateNatalChart)

export default router
