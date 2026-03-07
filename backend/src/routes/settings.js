import express from 'express'
import Settings from '../models/Settings.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// ── GET /api/settings ──────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const settings = await Settings.getGlobal()
    res.json({
      success: true,
      settings: {
        shippingPrice:  settings.shippingPrice,
        freeShippingAt: settings.freeShippingAt,
      },
    })
  } catch (err) {
    next(err)
  }
})