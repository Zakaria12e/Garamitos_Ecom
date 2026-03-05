import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'


const router = express.Router()

// Helper: generate JWT
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function sendToken(user, statusCode, res) {
  const token = signToken(user._id)
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

// POST /api/auth/register
router.post()

// POST /api/auth/login
router.post()

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user })
})

// PUT /api/auth/me
router.put(
  '/me',
  protect,
  [body('name').optional().trim().notEmpty()],
  async (req, res, next) => {
    try {
      const { name } = req.body
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { ...(name && { name }) },
        { new: true, runValidators: true }
      )
      res.json({ success: true, user })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/auth/change-password
router.post()

export default router
