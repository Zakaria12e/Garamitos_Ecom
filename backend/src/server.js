import express from "express";
import 'dotenv/config'
import { connectDB } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import cors from 'cors'

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

// Security & Logging
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))

// CORS
app.use(
  cors({
    origin: [ process.env.CLIENT_URL || 'http://localhost:5173'],
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)


app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/promo',    promoRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/products/:productId/reviews', reviewRoutes)

app.use(notFound)
app.use(errorHandler)

export default app;