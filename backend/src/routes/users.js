import express from 'express'
import User from '../models/User.js'
import Order from '../models/Order.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// GET /api/users  (admin)
router.get('/', protect, adminOnly, async (req, res, next) => {
try {
    const { page = 1, limit = 20, search } = req.query
    const filter = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }
    const skip = (Number(page) - 1) * Number(limit)
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ])
    res.json({ success: true, total, users })
  } catch (err) {
    next(err)
  }
})