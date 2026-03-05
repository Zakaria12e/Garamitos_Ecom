import jwt from 'jsonwebtoken'
import User from '../models/User.js'


// Protect — must be logged in
export async function protect(req, res, next) {}

// Admin only
export function adminOnly(req, res, next) {

  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' })
  }
  next()
}