import mongoose from 'mongoose'

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percent', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    label: { type: String },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model('PromoCode', promoCodeSchema)
