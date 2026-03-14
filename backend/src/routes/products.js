import express from 'express'
import { body, query, validationResult } from 'express-validator'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      featured,
      page = 1,
      limit = 20,
    } = req.query

    const filter = { isActive: true }

    // Full-text search
    if (search) {
      filter.$text = { $search: search }
    }

    // Category — accept comma-separated slugs or ObjectIds
    if (category) {
      const values = category.split(',').map(c => c.trim())
      const isObjectId = v => /^[a-f\d]{24}$/i.test(v)
      const categoryIds = values.every(isObjectId)
        ? values
        : (await Category.find({ slug: { $in: values }, isActive: true }).select('_id')).map(c => c._id)
      filter.category = categoryIds.length === 1 ? categoryIds[0] : { $in: categoryIds }
    }

    // Brand — comma-separated too
    if (brand) {
      const brands = brand.split(',').map(b => b.trim())
      filter.brand = brands.length === 1 ? brands[0] : { $in: brands }
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    // Featured filter
    if (featured === 'true') filter.featured = true

    // Sort options
    const sortMap = {
      price_asc:   { price: 1 },
      price_desc:  { price: -1 },
      rating:      { rating: -1 },
      newest:      { createdAt: -1 },
      name:        { name: 1 },
    }
    const sortQuery = sortMap[sort] || { createdAt: -1 }

    const skip = (Number(page) - 1) * Number(limit)
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sortQuery).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ])

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/featured
router.get('/featured', async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true, isActive: true }).populate('category', 'name slug').limit(8)
    res.json({ success: true, products })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true })
    res.json({ success: true, categories })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/brands
router.get('/brands', async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true })
    res.json({ success: true, brands })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate('category', 'name slug')
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' })
    }
    res.json({ success: true, product })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id/related
router.get('/:id/related', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' })

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    }).populate('category', 'name slug').limit(4)

    res.json({ success: true, products: related })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
    body('stock').isInt({ min: 0 }).withMessage('Valid stock required'),
    body('image').notEmpty().withMessage('Image URL required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg })
      }

      const product = await Product.create(req.body)
      res.status(201).json({ success: true, product })
    } catch (err) {
      next(err)
    }
  }
)

// PUT /api/products/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' })
    res.json({ success: true, product })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/products/:id (admin — soft delete)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' })
    res.json({ success: true, message: 'Product removed.' })
  } catch (err) {
    next(err)
  }
})

export default router