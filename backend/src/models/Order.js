import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:     { type: String, required: true },
  brand:    { type: String },
  category: { type: String },
  image:    { type: String },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
})

const shippingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true },
  phone:    { type: String },
  address:  { type: String, required: true },
  city:     { type: String, required: true },
  zip:      { type: String },
  country:  { type: String, required: true },
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = guest checkout
    },
    items: [orderItemSchema],
    shipping: { type: shippingSchema, required: true },
    subtotal:     { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount:     { type: Number, default: 0 },
    promoCode:    { type: String, default: null },
    total:        { type: Number, required: true },
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Processing',
    },
    returnReason: {
      type: String,
      enum: ['No Answer', 'Refused', 'Unreachable', 'Wrong Address', null],
      default: null,
    },
    statusHistory: [
      {
        status:    { type: String },
        changedAt: { type: Date, default: Date.now },
        note:      { type: String },
      },
    ],
    paymentMethod: {
      type: String,
      default: 'On Delivery',
    },
  },
  { timestamps: true }
)

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const prefix = 'SV'
    const timestamp = Date.now().toString(36).toUpperCase()
    this.orderNumber = `${prefix}-${timestamp}`
  }
  next()
})

// Track status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({ status: this.status })
  }
  next()
})

orderSchema.index({ 'shipping.email': 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

export default mongoose.model('Order', orderSchema)
