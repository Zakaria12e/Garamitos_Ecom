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

// POST /api/products/:productId/reviews
router.post(
  '/',
  optionalAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('body').trim().isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg })
      }

      const { productId } = req.params
      const { name, email, rating, title, body: reviewBody } = req.body

      // Check for duplicate
      const existing = await Review.findOne({ product: productId, email: email.toLowerCase() })
      if (existing) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this product.' })
      }

      // Check if verified buyer
      const order = await Order.findOne({
        'shipping.email': email.toLowerCase(),
        'items.productId': productId,
        status: { $in: ['Delivered', 'Shipped'] },
      })

      const review = await Review.create({
        product:  productId,
        user:     req.user?._id || null,
        name:     name.trim(),
        email:    email.toLowerCase(),
        rating:   Number(rating),
        title:    (title || '').trim(),
        body:     reviewBody.trim(),
        verified: !!order,
      })

      res.status(201).json({ success: true, review })
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this product.' })
      }
      next(err)
    }
  }
)

// DELETE /api/products/:productId/reviews/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      product: req.params.productId,
    })
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' })
    res.json({ success: true, message: 'Review deleted.' })
  } catch (err) {
    next(err)
  }
})
// PUT /api/products/:productId/reviews/:id/approve (admin)
router.put('/:id/approve', protect, adminOnly, async (req, res, next) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, product: req.params.productId },
      { approved: req.body.approved ?? true },
      { new: true }
    )
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' })
    res.json({ success: true, review })
  } catch (err) {
    next(err)
  }
})


export default router
