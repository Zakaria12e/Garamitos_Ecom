import express from 'express'
import { body, validationResult } from 'express-validator'
import Category from '../models/Category.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
    res.json({ success: true, categories })
  } catch (err) {
    next(err)
  }
})

// GET /api/categories/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true }).populate(
      'parent',
      'name slug'
    )
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' })
    }
    res.json({ success: true, category })
  } catch (err) {
    next(err)
  }
})

// PUT /api/categories/:id (admin)
router.put(
  '/:id',
  protect,
  adminOnly,
  [
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    body('parent').optional({ nullable: true }).isMongoId().withMessage('Invalid parent category ID'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg })
      }

      // Re-generate slug when name changes
      if (req.body.name) {
        req.body.slug = req.body.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }

      const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate('parent', 'name slug')

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found.' })
      }

      res.json({ success: true, category })
    } catch (err) {
      next(err)
    }
  }
)

// DELETE /api/categories/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    // Block deletion if subcategories exist
    const hasChildren = await Category.exists({ parent: req.params.id })
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a category that has subcategories. Remove them first.',
      })
    }

    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' })
    }

    res.json({ success: true, message: 'Category deleted.' })
  } catch (err) {
    next(err)
  }
})

// POST /api/categories (admin)
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    body('parent').optional({ nullable: true }).isMongoId().withMessage('Invalid parent category ID'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg })
      }
      const category = await Category.create(req.body)
      res.status(201).json({ success: true, category })
    } catch (err) {
      next(err)
    }
  }
)

export default router
