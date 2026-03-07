import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../src/config/db.js'
import Product from '../src/models/Product.js'
import PromoCode from '../src/models/PromoCode.js'
import User from '../src/models/User.js'

const PRODUCTS = [
  {
    name: 'Axis P3245-V Network Camera',
    brand: 'Axis',
    category: 'Surveillance Cameras',
    price: 399,
    originalPrice: 499,
    rating: 4.7,
    reviews: 128,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
    ],
    description: 'Fixed dome network camera with HDTV 1080p resolution and WDR – Forensic Capture for challenging light conditions.',
    specs: new Map([
      ['Resolution', '1920x1080 (HDTV 1080p)'],
      ['Lens', '3-9mm varifocal'],
      ['Night Vision', 'IR up to 30m'],
      ['Connectivity', 'Ethernet PoE'],
      ['IP Rating', 'IP66/IK10'],
      ['Storage', 'microSD up to 512GB'],
    ]),
    featured: true,
  },
  {
    name: 'DJI Air 3 Drone',
    brand: 'DJI',
    category: 'Drones',
    price: 1099,
    originalPrice: 1299,
    rating: 4.9,
    reviews: 342,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80',
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&q=80',
    ],
    description: 'Dual main cameras, 46-min max flight time, omnidirectional obstacle sensing, and 20km transmission range.',
    specs: new Map([
      ['Camera', 'Dual 50MP'],
      ['Flight Time', '46 minutes'],
      ['Range', '20km'],
      ['Weight', '720g'],
      ['Max Speed', '75 km/h'],
      ['Obstacle Sensing', 'Omnidirectional'],
    ]),
    featured: true,
  },
  {
    name: 'Sonos Arc Soundbar',
    brand: 'Sonos',
    category: 'Audio Equipment',
    price: 899,
    originalPrice: 999,
    rating: 4.8,
    reviews: 521,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80'],
    description: 'The premium smart soundbar for TV, movies, music, and more with Dolby Atmos support.',
    specs: new Map([
      ['Channels', '9.1.4'],
      ['Format', 'Dolby Atmos, DTS:X'],
      ['Connectivity', 'Wi-Fi, HDMI ARC, Optical'],
      ['Drivers', '11 high-performance drivers'],
      ['Dimensions', '114.2 x 8.7 x 11.7 cm'],
      ['Voice Control', 'Amazon Alexa, Google Assistant'],
    ]),
    featured: true,
  },
  {
    name: 'Ring Video Doorbell Pro 2',
    brand: 'Ring',
    category: 'Smart Home',
    price: 249,
    originalPrice: 299,
    rating: 4.5,
    reviews: 892,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80'],
    description: "3D motion detection, Bird's Eye View, Head-to-Toe HD+ Video, and dual-band wifi.",
    specs: new Map([
      ['Resolution', '1536p HD+'],
      ['Field of View', '150° horizontal, 150° vertical'],
      ['Motion Detection', "3D, Bird's Eye View"],
      ['Power', 'Wired only'],
      ['Connectivity', 'Dual-band 802.11 b/g/n'],
      ['Night Vision', 'Color with spotlight'],
    ]),
    featured: false,
  },
  {
    name: 'Nest Learning Thermostat',
    brand: 'Nest',
    category: 'Smart Home',
    price: 249,
    originalPrice: 279,
    rating: 4.6,
    reviews: 1204,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1567826722186-9ecdf689f122?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1567826722186-9ecdf689f122?w=600&q=80'],
    description: 'Learns your schedule and programs itself. Can be controlled from anywhere with your phone.',
    specs: new Map([
      ['Display', '3.3" color LCD'],
      ['Connectivity', 'Wi-Fi 802.11b/g/n'],
      ['Compatibility', 'Works with 95% of systems'],
      ['Energy Savings', 'Up to 15% on cooling'],
      ['Smart Features', 'Auto-Schedule, Home/Away'],
      ['App', 'iOS, Android, Web'],
    ]),
    featured: false,
  },
  {
    name: 'Axis Q6135-LE PTZ Camera',
    brand: 'Axis',
    category: 'Surveillance Cameras',
    price: 2499,
    originalPrice: 2799,
    rating: 4.9,
    reviews: 67,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80'],
    description: 'Full HD PTZ outdoor camera with powerful zoom and AXIS OptimizedIR illumination for long-range surveillance.',
    specs: new Map([
      ['Resolution', '1080p Full HD'],
      ['Zoom', '32x optical zoom'],
      ['Night Vision', 'OptimizedIR up to 200m'],
      ['Connectivity', 'Ethernet PoE+'],
      ['IP Rating', 'IP66/NEMA 4X/IK10'],
      ['Pan/Tilt', '360° pan, 220° tilt'],
    ]),
    featured: true,
  },
  {
    name: 'Hikvision DS-2CD2143G2 Dome',
    brand: 'Hikvision',
    category: 'Surveillance Cameras',
    price: 189,
    originalPrice: 229,
    rating: 4.4,
    reviews: 456,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80'],
    description: '4MP AcuSense outdoor dome camera with deep learning for accurate motion detection.',
    specs: new Map([
      ['Resolution', '4MP (2688×1520)'],
      ['Lens', '2.8mm fixed'],
      ['Night Vision', 'ColorVu up to 40m'],
      ['Detection', 'Human & vehicle classification'],
      ['IP Rating', 'IP67'],
      ['Compression', 'H.265+'],
    ]),
    featured: false,
  },
  {
    name: 'Arlo Pro 5S 2K Camera',
    brand: 'Arlo',
    category: 'Security Systems',
    price: 299,
    originalPrice: 349,
    rating: 4.6,
    reviews: 389,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80'],
    description: 'Wire-free 2K HDR security camera with integrated spotlight, color night vision, and 6-month battery.',
    specs: new Map([
      ['Resolution', '2K HDR'],
      ['Battery', 'Up to 6 months'],
      ['Field of View', '160° diagonal'],
      ['Night Vision', 'Color with spotlight'],
      ['Connectivity', 'Wi-Fi 6 dual-band'],
      ['Storage', 'Free cloud + local USB'],
    ]),
    featured: false,
  },
  {
    name: 'Bose QuietComfort Ultra',
    brand: 'Bose',
    category: 'Audio Equipment',
    price: 429,
    originalPrice: 449,
    rating: 4.8,
    reviews: 634,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'],
    description: 'World-class noise cancellation with immersive audio and up to 24 hours battery life.',
    specs: new Map([
      ['Noise Cancellation', 'World-class ANC'],
      ['Battery', '24 hours (ANC on)'],
      ['Connectivity', 'Bluetooth 5.3, USB-C'],
      ['Drivers', 'TriPort acoustic'],
      ['Spatial Audio', 'Immersive Audio with head tracking'],
      ['Weight', '250g'],
    ]),
    featured: true,
  },
  {
    name: 'DJI Mini 4 Pro',
    brand: 'DJI',
    category: 'Drones',
    price: 759,
    originalPrice: 799,
    rating: 4.7,
    reviews: 218,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600&q=80'],
    description: 'Under 249g foldable drone with 4K/60fps video, omnidirectional obstacle sensing, and 34-min flight time.',
    specs: new Map([
      ['Weight', '<249g'],
      ['Camera', '48MP, 1/1.3" CMOS'],
      ['Video', '4K/60fps HDR'],
      ['Flight Time', '34 minutes'],
      ['Range', '20km'],
      ['Obstacle Sensing', 'Omnidirectional'],
    ]),
    featured: false,
  },
  {
    name: 'Hikvision 8-Ch NVR System',
    brand: 'Hikvision',
    category: 'Security Systems',
    price: 349,
    originalPrice: 429,
    rating: 4.7,
    reviews: 312,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80'],
    description: '8-channel NVR with 4K resolution support, H.265+ compression, and built-in 2TB HDD for 24/7 recording.',
    specs: new Map([
      ['Channels', '8-channel'],
      ['Resolution', 'Up to 4K (8MP)'],
      ['Storage', '2TB HDD included (expandable)'],
      ['Compression', 'H.265+'],
      ['Connectivity', 'HDMI 4K, VGA, RJ45'],
      ['Smart Features', 'Human & vehicle detection'],
    ]),
    featured: false,
  },
  {
    name: 'Ring Alarm Pro 8-Piece',
    brand: 'Ring',
    category: 'Security Systems',
    price: 349,
    originalPrice: 399,
    rating: 4.5,
    reviews: 723,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80'],
    description: 'Complete home security kit with built-in eero Wi-Fi 6, contact sensors, motion detectors, and keypad.',
    specs: new Map([
      ['Pieces', '8-piece kit'],
      ['Built-in', 'eero Wi-Fi 6 router'],
      ['Sensors', 'Contact, Motion, Smoke/CO'],
      ['Monitoring', 'Professional 24/7 optional'],
      ['Connectivity', 'Wi-Fi, Z-Wave, Zigbee'],
      ['Backup', 'Cellular + battery'],
    ]),
    featured: false,
  },
]

const PROMO_CODES = [
  { code: 'SAVE10', type: 'percent', value: 10, label: '10% off', isActive: true },
  { code: 'FIRST20', type: 'percent', value: 20, label: '20% off', isActive: true },
  { code: 'FLAT50', type: 'fixed', value: 50, label: '$50 off', isActive: true },
]

async function seed() {
  await connectDB()

  console.log('  Clearing existing data...')
  await Promise.all([
    Product.deleteMany({}),
    PromoCode.deleteMany({}),
    User.deleteMany({ role: 'admin' }),
  ])

  console.log(' Seeding products...')
  const products = await Product.insertMany(PRODUCTS)
  console.log(`    ${products.length} products inserted`)

  console.log('  Seeding promo codes...')
  const promos = await PromoCode.insertMany(PROMO_CODES)
  console.log(`    ${promos.length} promo codes inserted`)

  console.log(' Creating admin user...')
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@securevault.com',
    password: 'admin123',
    role: 'admin',
  })
  console.log(`    Admin created: ${admin.email} / admin123`)

  console.log('\n Seed complete!')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
