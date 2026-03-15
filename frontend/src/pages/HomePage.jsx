import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Truck, RotateCcw, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { productsApi, normaliseProduct } from '../lib/api'
import { useSettings } from '../context/SettingsContext'
import ProductCard from '../components/ui/ProductCard'

const CATEGORY_ICONS = {
  default: '📦',
  // construction / droguerie
  tools:       '🔧',
  plumbing:    '🚿',
  electrical:  '💡',
  paint:       '🎨',
  cement:      '🏗️',
  wood:        '🪵',
  hardware:    '⚙️',
  safety:      '🦺',
}

function getCategoryIcon(name = '') {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return CATEGORY_ICONS.default
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function ProductSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-gray-900" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded w-1/2" />
      </div>
    </div>
  )
}

const STATS = [
  { key: 'products', value: '500+' },
  { key: 'brands',   value: '80+' },
  { key: 'customers', value: '12k+' },
  { key: 'support',  value: '24/7' },
]

export default function HomePage() {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [featured, setFeatured]     = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [email, setEmail]           = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    Promise.all([
      productsApi.featured(),
      productsApi.list({ sort: 'newest', limit: 4 }),
      productsApi.categories(),
    ]).then(([featuredRes, newRes, catsRes]) => {
      setFeatured((featuredRes.products || []).map(normaliseProduct))
      setNewArrivals((newRes.products || []).map(normaliseProduct))
      setCategories(catsRes.categories || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) setSubscribed(true)
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="border-b border-gray-200 dark:border-gray-800 overflow-hidden relative min-h-[400px] md:min-h-[480px]">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full font-medium mb-6"
            >
              🏗️ {t('home.hero.badge')}
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-none">
              {t('home.hero.title')}<br />
              <span className="text-gray-400">{t('home.hero.titleHighlight')}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/catalog" className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                {t('home.hero.shopBtn')} <ArrowRight size={14} />
              </Link>
              <Link to="/catalog" className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-800 px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                {t('home.hero.viewProducts')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ key, value }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t(`home.stats.${key}`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider">{t('home.sections.categories')}</h2>
            <Link to="/catalog" className="text-xs text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1">
              {t('home.sections.viewAll')} <ArrowRight size={11} />
            </Link>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {categories.map((cat) => {
              const name = cat?.name ?? cat
              return (
                <motion.div key={cat?._id ?? cat} variants={itemVariants}>
                  <Link
                    to={'/catalog?category=' + encodeURIComponent(name)}
                    className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-950 transition-all text-center"
                  >
                    <motion.span className="text-2xl" whileHover={{ scale: 1.2 }} transition={{ type: 'spring', stiffness: 300 }}>
                      {getCategoryIcon(name)}
                    </motion.span>
                    <span className="text-xs font-medium leading-snug">{name}</span>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </section>
      )}

      {/* ── Top Picks / Spotlight ── */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider">{t('home.sections.spotlight')}</h2>
          <Link to="/catalog" className="text-xs text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1">
            {t('home.sections.viewAll')} <ArrowRight size={11} />
          </Link>
        </div>
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : featured.slice(0, 4).map((p) => (
              <motion.div key={p.id} variants={itemVariants} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                <ProductCard product={p} />
              </motion.div>
            ))
          }
        </motion.div>
      </section>

      {/* ── Trust badges ── */}
      <motion.section className="border-t border-gray-200 dark:border-gray-800" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: BadgeCheck, titleKey: 'warrantyTitle', descKey: 'warrantyDesc',  descVars: {} },
            { icon: Truck,      titleKey: 'shippingTitle', descKey: 'shippingDesc',  descVars: { amount: settings.freeShippingAt, currency: t('common.currency') } },
            { icon: RotateCcw,  titleKey: 'returnsTitle',  descKey: 'returnsDesc',   descVars: {} },
          ].map(({ icon: Icon, titleKey, descKey, descVars }, i) => (
            <motion.div key={titleKey} className="flex items-center gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">{t(`home.trust.${titleKey}`)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t(`home.trust.${descKey}`, descVars)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── New Arrivals ── */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider">{t('home.sections.newArrivals')}</h2>
          <Link to="/catalog?sort=newest" className="text-xs text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1">
            {t('home.sections.viewAll')} <ArrowRight size={11} />
          </Link>
        </div>
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : newArrivals.map((p) => (
              <motion.div key={p.id} variants={itemVariants} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                <ProductCard product={p} />
              </motion.div>
            ))
          }
        </motion.div>
      </section>

      {/* ── Reviews ── */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-6 text-center">{t('home.reviews.title')}</h2>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { name: 'Karim B.', text: 'Livraison rapide et matériaux de très bonne qualité. Le ciment Portland que j\'ai commandé était exactement ce qu\'il me fallait pour mon chantier.', rating: 5 },
              { name: 'Hassan M.', text: 'Grande sélection d\'outillage électroportatif. J\'ai trouvé la perceuse que je cherchais depuis longtemps à un prix compétitif.', rating: 5 },
              { name: 'Fatima Z.', text: 'Service client excellent, ils m\'ont aidé à choisir les bons tuyaux pour ma plomberie. Je recommande vivement.', rating: 4 },
            ].map((review) => (
              <motion.div key={review.name} variants={itemVariants} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={11} className="fill-black dark:fill-white text-black dark:text-white" />
                  ))}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">"{review.text}"</p>
                <p className="text-xs font-semibold">— {review.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-lg font-bold mb-1">{t('home.newsletter.title')}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">{t('home.newsletter.subtitle')}</p>
            {subscribed ? (
              <p className="text-sm font-medium text-green-600 dark:text-green-400">✓ {t('settings.profile.saved')}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('home.newsletter.placeholder')}
                  className="flex-1 text-xs border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <button
                  type="submit"
                  className="text-xs font-medium bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  {t('home.newsletter.btn')}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
