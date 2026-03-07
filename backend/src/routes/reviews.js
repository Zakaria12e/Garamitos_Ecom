import express from 'express'
import { body, validationResult } from 'express-validator'
import Review from '../models/Review.js'
import Order from '../models/Order.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'

const router = express.Router({ mergeParams: true }) // inherits :productId

// GET /api/products/:productId/reviews
router.get('/', async (req, res, next) => {
  try {
    const { productId } = req.params
    const { page = 1, limit = 10, sort = 'newest' } = req.query

    const sortMap = {
      newest:  { createdAt: -1 },
      oldest:  { createdAt:  1 },
      highest: { rating: -1 },
      lowest:  { rating:  1 },
    }

    const skip = (Number(page) - 1) * Number(limit)
    const filter = { product: productId, approved: true }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(Number(limit))
        .select('-email -__v'),
      Review.countDocuments(filter),
    ])

    // Rating breakdown
    const breakdown = await Review.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ])
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    breakdown.forEach(b => { ratingBreakdown[b._id] = b.count })

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      ratingBreakdown,
      reviews,
    })
  } catch (err) {
    next(err)
  }
})

export default router
