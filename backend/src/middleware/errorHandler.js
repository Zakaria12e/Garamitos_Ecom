export function errorHandler(err, req, res, next) {

    
}


// 404 handler
export function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.originalUrl}`)
  err.statusCode = 404
  next(err)
}