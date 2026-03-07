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



export default router

