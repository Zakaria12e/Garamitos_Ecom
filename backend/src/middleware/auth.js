import jwt from 'jsonwebtoken'
import User from '../models/User.js'


// Protect — must be logged in
export async function protect(req, res, next) {
let token;

 if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

 if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' })
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' })
    }
    next()
}

// Admin only
export function adminOnly(req, res, next) {

  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' })
  }
  next()
}