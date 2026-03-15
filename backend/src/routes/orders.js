import express from 'express'
import { body, validationResult } from 'express-validator'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import PromoCode from '../models/PromoCode.js'
import Settings from '../models/Settings.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// POST /api/orders
// Place a new order (guest or logged-in user)
router.post(
     '/',
  optionalAuth,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.productId').notEmpty().withMessage('Each item must have a productId'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shipping.fullName').trim().notEmpty().withMessage('Full name is required'),
    body('shipping.email').isEmail().withMessage('Valid email is required'),
    body('shipping.address').trim().notEmpty().withMessage('Address is required'),
    body('shipping.city').trim().notEmpty().withMessage('City is required'),
    body('shipping.country').trim().notEmpty().withMessage('Country is required'),
  ],
   async (req, res, next) => {
    try{

    const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg })
      }
    const { items, shipping, promoCode, shippingCost: clientShippingCost } = req.body

    // Validate products & compute subtotal
      const productIds = items.map(i => i.productId)
      const products = await Product.find({ _id: { $in: productIds }, isActive: true })

      if (products.length !== productIds.length) {
        return res.status(400).json({ success: false, message: 'One or more products are unavailable.' })
      }

      const orderItems = []
      let subtotal = 0

      for (const item of items) {
        const product = products.find(p => p._id.toString() === item.productId)
        if (!product) continue

        if (product.stock < item.qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
          })
        }

        orderItems.push({
          productId: product._id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          image: product.image,
          price: product.price,
          qty: item.qty,
        })
        subtotal += product.price * item.qty
      }

        // Shipping cost (read from DB settings)
      const siteSettings = await Settings.getGlobal()
      const shippingCost = subtotal >= siteSettings.freeShippingAt
        ? 0
        : siteSettings.shippingPrice

         // Promo code
      let discount = 0
      let validatedPromo = null

      if (promoCode) {
        const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true })
        if (promo) {
          if (promo.expiresAt && promo.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Promo code has expired.' })
          }
          if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
            return res.status(400).json({ success: false, message: 'Promo code usage limit reached.' })
          }
          discount = promo.type === 'percent'
            ? (subtotal * promo.value) / 100
            : promo.value

          promo.usageCount += 1
          await promo.save()
          validatedPromo = promo.code
        }
      }

      const total = Math.max(0, subtotal + shippingCost - discount)

       // Create order
      const order = await Order.create({
        user: req.user?._id || null,
        items: orderItems,
        shipping,
        subtotal,
        shippingCost,
        discount,
        promoCode: validatedPromo,
        total,
        statusHistory: [{ status: 'Processing' }],
      })

      // Decrement stock
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } })
      }

      res.status(201).json({ success: true, order })

    }catch(err){
        next(err)
    }
   }
)

// GET /api/orders/lookup?email=x
// Public — guest order lookup by email
router.get('/lookup', async (req, res, next) => {
  try {
    const { email } = req.query
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' })
    }

    const orders = await Order.find({ 'shipping.email': email.toLowerCase() })
      .sort({ createdAt: -1 })

    res.json({ success: true, orders })
  } catch (err) {
    next(err)
  }
})

// GET /api/orders/my
// Auth user — their own orders
router.get('/my', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, orders })
  } catch (err) {
    next(err)
  }
})

// GET /api/orders/my/:id
router.get('/my/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
    res.json({ success: true, order })
  } catch (err) {
    next(err)
  }
})

// PUT /api/orders/my/:id/cancel
// Auth user — cancel their own order (only if still Processing)
router.put('/my/:id/cancel', protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })

    if (order.status !== 'Processing') {
      return res.status(400).json({
        success: false,
        message: 'Only orders in Processing status can be cancelled.',
      })
    }

    // Restore stock for each item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } })
    }

    order.status = 'Cancelled'
    order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by customer', changedAt: new Date() })
    await order.save()

    res.json({ success: true, order })
  } catch (err) {
    next(err)
  }
})

// GET /api/orders (admin)
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query
    const filter = {}

    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shipping.email': { $regex: search, $options: 'i' } },
        { 'shipping.fullName': { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
    const total = await Order.countDocuments(filter)

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/orders/admin/stats (admin)
router.get('/admin/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const [statusCounts, revenueAgg, recentOrders] = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: 'Delivered' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' },
          },
        },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).select('orderNumber status total createdAt shipping.fullName shipping.email'),
    ])

    const byStatus = {}
    for (const s of statusCounts) byStatus[s._id] = s.count

    const { totalRevenue = 0, totalOrders = 0, avgOrderValue = 0 } = revenueAgg[0] || {}

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        byStatus,
        recentOrders,
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/orders/admin/revenue?period=day|month|year (admin)
router.get('/admin/revenue', protect, adminOnly, async (req, res, next) => {
  try {
    const { period = 'month' } = req.query

    const now = new Date()
    let startDate, dateFormat, labelFn

    if (period === 'day') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 29)
      dateFormat = '%Y-%m-%d'
      labelFn = (str) => {
        const [, m, d] = str.split('-')
        return `${d}/${m}`
      }
    } else if (period === 'year') {
      startDate = new Date(now)
      startDate.setFullYear(now.getFullYear() - 4)
      dateFormat = '%Y'
      labelFn = (str) => str
    } else {
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 11)
      dateFormat = '%Y-%m'
      labelFn = (str) => {
        const [y, m] = str.split('-')
        return `${new Date(y, m - 1).toLocaleString('en', { month: 'short' })} ${y}`
      }
    }

    startDate.setHours(0, 0, 0, 0)

    const data = await Order.aggregate([
      { $match: { status: 'Delivered', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id:     { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const points = data.map(d => ({
      label:   labelFn(d._id),
      revenue: parseFloat(d.revenue.toFixed(2)),
      orders:  d.orders,
    }))

    res.json({ success: true, points })
  } catch (err) {
    next(err)
  }
})

// GET /api/orders/:id (admin)
router.get('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
    res.json({ success: true, order })
  } catch (err) {
    next(err)
  }
})

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, note } = req.body
    const allowed = ['Processing', 'Shipped', 'Delivered', 'Cancelled']

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })

    order.status = status
    order.statusHistory.push({ status, note: note || '', changedAt: new Date() })
    await order.save()

    res.json({ success: true, order })
  } catch (err) {
    next(err)
  }
})

export default router

