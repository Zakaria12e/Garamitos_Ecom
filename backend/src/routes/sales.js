import express from 'express'
import Sale from '../models/Sale.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// GET /api/sales/active — public, returns the currently running sale
router.get('/active', async (req, res, next) => {
  try {
    const now = new Date()
    const sale = await Sale.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate:   { $gte: now },
    })
    res.json({ success: true, sale: sale || null })
  } catch (err) {
    next(err)
  }
})

// GET /api/sales — admin, list all sales
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const sales = await Sale.find().sort({ startDate: -1 })
    res.json({ success: true, sales })
  } catch (err) {
    next(err)
  }
})

// POST /api/sales — admin, create sale
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.endDate) {
      const d = new Date(body.endDate)
      d.setHours(23, 59, 59, 999)
      body.endDate = d
    }
    const sale = await Sale.create(body)
    res.status(201).json({ success: true, sale })
  } catch (err) {
    next(err)
  }
})

// PUT /api/sales/:id — admin, update sale
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.endDate) {
      const d = new Date(body.endDate)
      d.setHours(23, 59, 59, 999)
      body.endDate = d
    }
    const sale = await Sale.findByIdAndUpdate(req.params.id, body, { new: true })
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found.' })
    res.json({ success: true, sale })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/sales/:id — admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await Sale.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
