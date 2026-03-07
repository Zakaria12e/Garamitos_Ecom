import express from 'express'
import PromoCode from '../models/PromoCode.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// POST /api/promo/validate
router.post('/validate', async (req, res, next) => {
  try {
    const { code, subtotal } = req.body
    if (!code) return res.status(400).json({ success: false, message: 'Code is required.' })

    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true })

    if (!promo) {
      return res.status(404).json({ success: false, message: 'Invalid promo code.' })
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Promo code has expired.' })
    }
    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'Promo code usage limit reached.' })
    }

    const discount = promo.type === 'percent'
      ? ((subtotal || 0) * promo.value) / 100
      : promo.value

    res.json({
      success: true,
      promo: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        label: promo.label,
        discount,
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/promo (admin)
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const codes = await PromoCode.find().sort({ createdAt: -1 })
    res.json({ success: true, codes })
  } catch (err) {
    next(err)
  }
})

// POST /api/promo (admin)
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const code = await PromoCode.create(req.body)
    res.status(201).json({ success: true, code })
  } catch (err) {
    next(err)
  }
})

// PUT /api/promo/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const code = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!code) return res.status(404).json({ success: false, message: 'Promo code not found.' })
    res.json({ success: true, code })
  } catch (err) {
    next(err)
  }
})