import mongoose from 'mongoose'

const saleSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    discount:    { type: Number, required: true, min: 1, max: 99 },
    startDate:   { type: Date, required: true },
    endDate:     { type: Date, required: true },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model('Sale', saleSchema)
