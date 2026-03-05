export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'

    // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ')
  }

   // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue)[0]
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`
  }

    // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }

    // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token.'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired.'
  }

    res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })

}


// 404 handler
export function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.originalUrl}`)
  err.statusCode = 404
  next(err)
}