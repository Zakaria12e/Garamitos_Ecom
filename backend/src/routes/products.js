import express from 'express'
import { body, query, validationResult } from 'express-validator'
import Product from '../models/Product.js'
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

    // Category — support multiple categories via comma-separated values
    if (category) {
      const cats = category.split(',').map(c => c.trim())
      filter.category = cats.length === 1 ? cats[0] : { $in: cats }
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
      Product.find(filter).sort(sortQuery).skip(skip).limit(Number(limit)),
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
    const products = await Product.find({ featured: true, isActive: true }).limit(8)
    res.json({ success: true, products })
  } catch (err) {
    next(err)
  }
})