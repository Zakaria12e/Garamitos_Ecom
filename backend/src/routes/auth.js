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
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg })
      }

      const { name, email, password } = req.body
      const exists = await User.findOne({ email })
      if (exists) {
        return res.status(409).json({ success: false, message: 'Email already registered.' })
      }

      const user = await User.create({ name, email, password })
      sendToken(user, 201, res)
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/auth/login
router.post(
   '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg })
      }

      const { email, password } = req.body
      const user = await User.findOne({ email }).select('+password')
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' })
      }

      sendToken(user, 200, res)
    } catch (err) {
      next(err)
    }
  }
)

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
router.post(
   '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg })
      }

      const user = await User.findById(req.user._id).select('+password')
      const { currentPassword, newPassword } = req.body

      if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' })
      }

      user.password = newPassword
      await user.save()
      res.json({ success: true, message: 'Password changed successfully.' })
    } catch (err) {
      next(err)
    }
  }
)

export default router
