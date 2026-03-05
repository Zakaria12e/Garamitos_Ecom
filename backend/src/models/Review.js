import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // guest fields
    name:     { type: String, required: true, trim: true, maxlength: 60 },
    email:    { type: String, required: true, trim: true, lowercase: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    title:    { type: String, trim: true, maxlength: 100, default: '' },
    body:     { type: String, required: true, trim: true, maxlength: 1000 },
    verified: { type: Boolean, default: false }, // true if they actually ordered it
    approved: { type: Boolean, default: true  }, // can set false to moderate
  },
  { timestamps: true }
)

// One review per email per product
reviewSchema.index({ product: 1, email: 1 }, { unique: true })

// After save/delete — recalculate product rating & review count
async function recalcProduct(productId) {
  const Product = mongoose.model('Product')
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: productId, approved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const avg   = stats[0]?.avg   ?? 0
  const count = stats[0]?.count ?? 0
  await Product.findByIdAndUpdate(productId, {
    rating:  Math.round(avg * 10) / 10,
    reviews: count,
  })
}

reviewSchema.post('save',             doc  => recalcProduct(doc.product))
reviewSchema.post('findOneAndDelete', doc  => doc && recalcProduct(doc.product))
reviewSchema.post('deleteMany',       () => {}) // handled manually if needed

export default mongoose.model('Review', reviewSchema)
