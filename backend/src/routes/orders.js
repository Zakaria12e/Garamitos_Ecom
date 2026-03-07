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

    }catch(err){
        next(err)
    }
   }
)

