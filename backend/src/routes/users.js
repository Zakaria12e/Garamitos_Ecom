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

// GET /api/users/:id  (admin)
router.get('/:id', protect, adminOnly, async (req, res, next) => {
     try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(10)
    res.json({ success: true, user, orders })
  } catch (err) {
    next(err)
  }
})

// PUT /api/users/:id/role (admin)
router.put('/:id/role', protect, adminOnly, async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' })
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/users/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' })
    }
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted.' })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/me/wishlist
router.get('/me/wishlist', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist')
    res.json({ success: true, wishlist: user.wishlist })
  } catch (err) {
    next(err)
  }
})

// POST /api/users/me/wishlist/:productId
router.post('/me/wishlist/:productId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const pid = req.params.productId
    const idx = user.wishlist.indexOf(pid)

    if (idx === -1) {
      user.wishlist.push(pid)
    } else {
      user.wishlist.splice(idx, 1)
    }
    await user.save()
    res.json({ success: true, wishlist: user.wishlist })
  } catch (err) {
    next(err)
  }
})

export default router