import express from "express";
import 'dotenv/config'
import { connectDB } from './config/db.js'
import authRoutes     from './routes/auth.js'
import productRoutes  from './routes/products.js'
import orderRoutes    from './routes/orders.js'
import promoRoutes    from './routes/promo.js'
import userRoutes     from './routes/users.js'
import settingsRoutes from './routes/settings.js'
import reviewRoutes   from './routes/reviews.js'


await connectDB()
const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/promo',    promoRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/products/:productId/reviews', reviewRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});