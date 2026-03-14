import express from 'express'
import Category from '../models/Category.js'

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

export default router
