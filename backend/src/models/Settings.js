import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },

    shippingPrice:     { type: Number, default: 30 },   
    freeShippingAt:    { type: Number, default: 500 },  
  },
  { timestamps: true }
)

settingsSchema.statics.getGlobal = async function () {
  let doc = await this.findOne({ key: 'global' })
  if (!doc) doc = await this.create({ key: 'global' })
  return doc
}

export default mongoose.model('Settings', settingsSchema)
