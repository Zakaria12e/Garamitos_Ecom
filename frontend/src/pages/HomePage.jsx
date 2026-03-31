import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { ArrowRight, BadgeCheck, Truck, RotateCcw, Star, ChevronDown, Wrench, Droplets, Zap, Paintbrush, Building2, TreePine, SlidersHorizontal, ShieldCheck, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { productsApi, reviewsApi, normaliseProduct } from '../lib/api'
import { useSettings } from '../context/SettingsContext'
import ProductCard from '../components/ui/ProductCard'
import { Spotlight } from '../components/ui/spotlight'
import { InfiniteMovingCards } from '../components/ui/infinite-moving-cards'

function getCategoryIcon(name = '') {
  const n = name.toLowerCase()
  if (n.includes('tool'))     return Wrench
  if (n.includes('plumb'))    return Droplets
  if (n.includes('electr'))   return Zap
  if (n.includes('paint'))    return Paintbrush
  if (n.includes('cement'))   return Building2
  if (n.includes('wood'))     return TreePine
  if (n.includes('hardware')) return SlidersHorizontal
  if (n.includes('safety'))   return ShieldCheck
  return null
}

const containerVariants = {
  hidden:  { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 36, scale: 0.96, filter: 'blur(5px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

/* ── Vertical light beams along grid lines ── */
const V_BEAMS = [
  { left: 128,  dur: 22, delay: 0  },
  { left: 256,  dur: 28, delay: 6  },
  { left: 384,  dur: 20, delay: 12 },
  { left: 512,  dur: 32, delay: 3  },
  { left: 640,  dur: 25, delay: 9  },
  { left: 768,  dur: 30, delay: 15 },
  { left: 896,  dur: 23, delay: 5  },
  { left: 1024, dur: 27, delay: 18 },
]

function GridBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {V_BEAMS.map((b, i) => (
        <div
          key={i}
          className="beam-y"
          style={{ left: b.left, animationDuration: b.dur + 's', animationDelay: b.delay + 's' }}
        />
      ))}
    </div>
  )
}

/* 3-D tilt card — follows cursor on desktop, neutral on touch */
function TiltCard({ children }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-32, 32], [7, -7])
  const rotateY = useTransform(x, [-32, 32], [-7, 7])
  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 700 }}
      whileHover={{ scale: 1.06 }}
      transition={{ scale: { type: 'spring', stiffness: 380, damping: 22 } }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set(e.clientX - r.left - r.width  / 2)
        y.set(e.clientY - r.top  - r.height / 2)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════
    TOOL CONSTELLATION — ambient hero art
    Icons orbit at different radii/speeds,
    zero stats, zero text, pure craft.
══════════════════════════════════════════ */
const LEFT_TOOLS = [
  { Icon: Wrench,     r: 72, dur: 28, cw: true,  phase: 0.00 },
  { Icon: Droplets,   r: 46, dur: 17, cw: false, phase: 0.22 },
  { Icon: Zap,        r: 90, dur: 38, cw: true,  phase: 0.45 },
  { Icon: Paintbrush, r: 58, dur: 23, cw: false, phase: 0.67 },
  { Icon: Package,    r: 30, dur: 20, cw: true,  phase: 0.85 },
]

const RIGHT_TOOLS = [
  { Icon: SlidersHorizontal, r: 68, dur: 32, cw: false, phase: 0.10 },
  { Icon: ShieldCheck,       r: 46, dur: 19, cw: true,  phase: 0.35 },
  { Icon: Building2,         r: 88, dur: 26, cw: false, phase: 0.58 },
  { Icon: TreePine,          r: 30, dur: 14, cw: true,  phase: 0.75 },
  { Icon: Wrench,            r: 78, dur: 34, cw: true,  phase: 0.92 },
]

/*
  Nested-rotation trick (GPU-friendly):
    outer div  → rotates, carries the icon around the orbit
    inner div  → counter-rotates so the icon stays upright
    innermost  → breathes opacity
*/
function OrbitRing({ Icon, r, dur, cw, phase, breatheOffset }) {
  const sweep = cw ? 360 : -360
  const sharedTrans = { duration: dur, repeat: Infinity, ease: 'linear', delay: -(dur * phase) }

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{ width: 0, height: 0 }}
      animate={{ rotate: sweep }}
      transition={sharedTrans}
    >
      <div style={{ position: 'absolute', left: r, top: 0, transform: 'translate(-50%, -50%)' }}>
        <motion.div animate={{ rotate: -sweep }} transition={sharedTrans}>
          <motion.div
            animate={{ opacity: [0.18, 0.55, 0.18] }}
            transition={{ duration: 3.5 + breatheOffset, repeat: Infinity, ease: 'easeInOut', delay: breatheOffset * 0.6 }}
          >
            <Icon size={13} strokeWidth={1.2} className="text-zinc-400 dark:text-zinc-600" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

const CONSTELLATION_SIZE = 220
const CC = CONSTELLATION_SIZE / 2  // center coordinate

function ToolConstellation({ tools, side }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 2 }}
      className={`absolute pointer-events-none z-10 hidden xl:block
                  top-1/2 -translate-y-1/2
                  ${side === 'left' ? 'left-4 xl:left-8 2xl:left-20' : 'right-4 xl:right-8 2xl:right-20'}`}
      style={{ width: CONSTELLATION_SIZE, height: CONSTELLATION_SIZE }}
    >
      {/* SVG orbit trail rings + center crosshair */}
      <svg
        viewBox={`0 0 ${CONSTELLATION_SIZE} ${CONSTELLATION_SIZE}`}
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        {tools.map(({ r }, i) => (
          <circle
            key={i}
            cx={CC} cy={CC} r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.55"
            strokeDasharray="2 11"
            className="text-zinc-200 dark:text-zinc-800"
          />
        ))}
        <line x1={CC - 6} y1={CC} x2={CC + 6} y2={CC} stroke="currentColor" strokeWidth="0.6" className="text-zinc-300 dark:text-zinc-700" />
        <line x1={CC} y1={CC - 6} x2={CC} y2={CC + 6} stroke="currentColor" strokeWidth="0.6" className="text-zinc-300 dark:text-zinc-700" />
        <circle cx={CC} cy={CC} r="1.5" fill="currentColor" className="text-zinc-300 dark:text-zinc-700" />
      </svg>

      {/* Orbiting icons */}
      <div className="absolute inset-0">
        {tools.map(({ Icon, r, dur, cw, phase }, i) => (
          <OrbitRing
            key={i}
            Icon={Icon}
            r={r}
            dur={dur}
            cw={cw}
            phase={phase}
            breatheOffset={i * 0.75}
          />
        ))}
      </div>
    </motion.div>
  )
}


function ProductSkeleton() {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-900" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded w-3/4" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [featured, setFeatured]       = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories]   = useState([])
  const [reviews, setReviews]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [email, setEmail]             = useState('')
  const [subscribed, setSubscribed]   = useState(false)

  useEffect(() => {
    Promise.all([
      productsApi.featured(),
      productsApi.list({ sort: 'newest', limit: 4 }),
      productsApi.categories(),
    ]).then(([featuredRes, newRes, catsRes]) => {
      const featuredList = (featuredRes.products || []).map(normaliseProduct)
      setFeatured(featuredList)
      setNewArrivals((newRes.products || []).map(normaliseProduct))
      setCategories(catsRes.categories || [])
      const ids = featuredList.slice(0, 3).map(p => p._id || p.id).filter(Boolean)
      return Promise.all(ids.map(id => reviewsApi.list(id, { limit: 1, sort: 'highest' })))
    }).then(results => {
      setReviews(results.flatMap(r => r.reviews || []).slice(0, 3))
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) setSubscribed(true)
  }

  return (
    <div className="bg-white dark:bg-black">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-black">

        {/* Grid pattern */}
        <div className="absolute inset-0 hero-grid-bg pointer-events-none" />

        {/* Aceternity Spotlight — dark mode */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20 hidden dark:block"
          fill="white"
          fillOpacity={0.21}
        />
        {/* CSS spotlight — light mode (SVG blur doesn't render well on white) */}
        <div
          className="dark:hidden pointer-events-none absolute z-[1] animate-spotlight opacity-0"
          style={{
            top: '-10%',
            left: '-5%',
            width: '70%',
            height: '80%',
            background: 'radial-gradient(ellipse at 30% 20%, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.03) 35%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Snaking light beams */}
        <GridBeams />

        {/* Radial vignette — fades grid at edges so it doesn't look harsh */}
        <div className="absolute inset-0 pointer-events-none [background:radial-gradient(ellipse_85%_65%_at_50%_50%,transparent_35%,white_100%)] dark:[background:radial-gradient(ellipse_85%_65%_at_50%_50%,transparent_35%,black_100%)]" />

        {/* Top edge line */}
        <div className="absolute top-0 inset-x-0 h-px bg-zinc-100 dark:bg-zinc-900" />

        {/* ── Content ── */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-5 py-20 md:py-28 text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-black">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-pulse" />
              🏗️ {t('home.hero.badge')}
            </span>
          </motion.div>

          {/* ── Headline ── massive, gradient, centered */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="gradient-heading font-black tracking-tighter leading-[1.06] mb-5
                       text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            {t('home.hero.title')}
            <br />
            {t('home.hero.titleHighlight')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto mb-10"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black
                         px-7 py-3.5 rounded-xl text-sm font-semibold
                         hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-all duration-200
                         shadow-lg shadow-black/10 dark:shadow-white/5"
            >
              {t('home.hero.shopBtn')} <ArrowRight size={14} />
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2
                         border border-zinc-200 dark:border-zinc-800
                         px-7 py-3.5 rounded-xl text-sm font-semibold
                         text-zinc-600 dark:text-zinc-300
                         hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all duration-200"
            >
              {t('home.hero.viewProducts')}
            </Link>
          </motion.div>

        </div>{/* end content div */}

        <ToolConstellation tools={LEFT_TOOLS}  side="left"  />
        <ToolConstellation tools={RIGHT_TOOLS} side="right" />

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={18} className="text-zinc-300 dark:text-zinc-700" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          MARQUEE — scrolling category names
      ══════════════════════════════════════════ */}
      {categories.length > 0 && (
        <div className="border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 overflow-hidden py-3 select-none">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, ri) => (
              <div key={ri} className="flex items-center shrink-0">
                {categories.map((cat) => {
                  const name = cat?.name ?? cat
                  return (
                    <span
                      key={`${ri}-${name}`}
                      className="inline-flex items-center gap-2 px-8 text-xs font-medium text-zinc-400 dark:text-zinc-600"
                    >
                      <span className="text-[8px] text-zinc-200 dark:text-zinc-800">◆</span>
                      {name}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex justify-end mb-5">
            <Link
              to="/catalog"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              {t('home.sections.viewAll')} <ArrowRight size={11} />
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {categories.map((cat) => {
              const name = cat?.name ?? cat
              const Icon = getCategoryIcon(name)
              return (
                <motion.div key={cat?._id ?? cat} variants={itemVariants}>
                  <Link
                    to={'/catalog?category=' + encodeURIComponent(name)}
                    className="group flex items-center gap-3.5 px-4 py-3.5
                               rounded-xl border border-zinc-100 dark:border-zinc-900
                               hover:border-zinc-300 dark:hover:border-zinc-700
                               hover:bg-zinc-50 dark:hover:bg-zinc-950
                               transition-all duration-200"
                  >
                    {Icon && (
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900
                                      flex items-center justify-center shrink-0
                                      group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800
                                      transition-colors duration-200">
                        <Icon
                          size={15}
                          className="text-zinc-500 dark:text-zinc-400
                                     group-hover:text-zinc-900 dark:group-hover:text-white
                                     transition-colors duration-200"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium flex-1 leading-none truncate">
                      {name}
                    </span>
                    <ArrowRight
                      size={13}
                      className="text-zinc-200 dark:text-zinc-800 shrink-0
                                 group-hover:text-zinc-400 dark:group-hover:text-zinc-500
                                 group-hover:translate-x-0.5
                                 transition-all duration-200"
                    />
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          FEATURED / SPOTLIGHT
      ══════════════════════════════════════════ */}
      <section className="border-t border-zinc-100 dark:border-zinc-900 max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 mb-1.5">
              Hand-picked
            </p>
            <h2 className="text-2xl font-black tracking-tight">{t('home.sections.spotlight')}</h2>
          </div>
          <Link to="/catalog" className="text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
            {t('home.sections.viewAll')} <ArrowRight size={11} />
          </Link>
        </div>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : featured.slice(0, 4).map((p) => (
              <motion.div key={p.id} variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 280 }}>
                <ProductCard product={p} />
              </motion.div>
            ))
          }
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST BADGES — horizontal strip
      ══════════════════════════════════════════ */}
      <section className="border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
        <motion.div
          className="max-w-7xl mx-auto px-4 py-0 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-900"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {[
            { icon: BadgeCheck, titleKey: 'warrantyTitle', descKey: 'warrantyDesc',  descVars: {} },
            { icon: Truck,      titleKey: 'shippingTitle', descKey: 'shippingDesc',  descVars: { amount: settings.freeShippingAt, currency: t('common.currency') } },
            { icon: RotateCcw,  titleKey: 'returnsTitle',  descKey: 'returnsDesc',   descVars: {} },
          ].map(({ icon: Icon, titleKey, descKey, descVars }) => (
            <motion.div
              key={titleKey}
              variants={itemVariants}
              className="flex items-center gap-4 py-7 px-6"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <p className="text-sm font-bold">{t(`home.trust.${titleKey}`)}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t(`home.trust.${descKey}`, descVars)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          NEW ARRIVALS
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 mb-1.5">
              Just in
            </p>
            <h2 className="text-2xl font-black tracking-tight">{t('home.sections.newArrivals')}</h2>
          </div>
          <Link to="/catalog?sort=newest" className="text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
            {t('home.sections.viewAll')} <ArrowRight size={11} />
          </Link>
        </div>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : newArrivals.map((p) => (
              <motion.div key={p.id} variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 280 }}>
                <ProductCard product={p} />
              </motion.div>
            ))
          }
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          REVIEWS — Aceternity InfiniteMovingCards
      ══════════════════════════════════════════ */}
      {reviews.length > 0 && (
        <section className="border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 py-16 overflow-hidden">
          <div className="text-center mb-10 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 mb-1.5">
              What customers say
            </p>
            <h2 className="text-2xl font-black tracking-tight">{t('home.reviews.title')}</h2>
          </div>
          <InfiniteMovingCards
            items={reviews.map(r => ({
              quote: r.body,
              name: r.name,
              rating: r.rating,
            }))}
            direction="left"
            speed="slow"
            pauseOnHover
          />
        </section>
      )}

      {/* ══════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════ */}
      <section className="border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 mb-3">
              Stay in the loop
            </p>
            <h2 className="text-2xl font-black tracking-tight mb-2">
              {t('home.newsletter.title')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
              {t('home.newsletter.subtitle')}
            </p>
            {subscribed ? (
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                ✓ {t('settings.profile.saved')}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('home.newsletter.placeholder')}
                  className="flex-1 text-xs rounded-xl px-4 py-3
                             bg-white dark:bg-black
                             border border-zinc-200 dark:border-zinc-800
                             text-zinc-900 dark:text-white
                             placeholder-zinc-400 dark:placeholder-zinc-600
                             focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600
                             transition"
                />
                <button
                  type="submit"
                  className="text-xs font-semibold px-5 py-3 rounded-xl whitespace-nowrap
                             bg-zinc-900 dark:bg-white text-white dark:text-black
                             hover:bg-zinc-700 dark:hover:bg-zinc-100
                             transition-all"
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
