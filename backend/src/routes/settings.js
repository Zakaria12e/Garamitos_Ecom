import express from 'express'
import Settings from '../models/Settings.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// GET /api/settings
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

// PUT /api/settings
// Admin only — update shipping settings
router.put('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { shippingPrice, freeShippingAt } = req.body

    const update = {}
    if (shippingPrice  !== undefined) update.shippingPrice  = shippingPrice
    if (freeShippingAt !== undefined) update.freeShippingAt = freeShippingAt

    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: update },
      { upsert: true, new: true }
    )

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

export default router