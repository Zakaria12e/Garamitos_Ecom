export const STATUS_COLORS = {
  Processing: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400',
  Shipped:    'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  Delivered:  'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  Cancelled:  'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
  Returned:   'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400',
}

export const EMPTY_PRODUCT_FORM = {
  name: '', brand: '', category: '',
  price: '', originalPrice: '', stock: '', description: '',
  image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
  rating: 4.5, reviews: 0, featured: false,
}

export const EMPTY_PROMO_FORM = {
  code: '', type: 'percent', value: '',
  label: '', isActive: true, usageLimit: '',
}

export const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned']

export const RETURN_REASONS = ['No Answer', 'Refused', 'Unreachable', 'Wrong Address']

// Which statuses can be transitioned to from the current one
export const ALLOWED_TRANSITIONS = {
  Processing: ['Shipped', 'Cancelled'],
  Shipped:    ['Delivered', 'Returned', 'Cancelled'],
  Delivered:  [],
  Cancelled:  [],
  Returned:   [],
}
