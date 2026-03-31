import React, { useEffect, useRef, useState } from 'react'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/* Deterministic gradient per name so each avatar is unique but stable */
const GRADIENTS = [
  ['#f59e0b', '#ef4444'],
  ['#3b82f6', '#8b5cf6'],
  ['#10b981', '#06b6d4'],
  ['#ec4899', '#f97316'],
  ['#6366f1', '#22d3ee'],
  ['#84cc16', '#14b8a6'],
]
function gradientForName(name = '') {
  const idx = (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % GRADIENTS.length
  return GRADIENTS[idx]
}

function StarRow({ rating = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="13" height="13" viewBox="0 0 24 24"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          className={i < rating ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ item }) {
  const initials = (item.name ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const [g1, g2] = gradientForName(item.name ?? '')

  return (
    <li className="relative w-[300px] md:w-[360px] max-w-full flex-shrink-0 group">

      {/* Card shell */}
      <div
        className="relative h-full rounded-2xl overflow-hidden
                   bg-white dark:bg-zinc-950
                   border border-zinc-100 dark:border-zinc-800
                   transition-all duration-300
                   group-hover:border-zinc-300 dark:group-hover:border-zinc-600
                   group-hover:shadow-xl group-hover:shadow-black/5 dark:group-hover:shadow-black/40"
      >

        {/* Decorative gradient top bar */}
        <div
          className="absolute top-0 inset-x-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${g1}, ${g2})` }}
        />

        {/* Large background quote mark */}
        <div
          className="absolute -top-3 -right-1 text-[9rem] font-serif leading-none
                     text-zinc-100 dark:text-zinc-900 select-none pointer-events-none
                     transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1"
          aria-hidden
        >
          &ldquo;
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col gap-5">

          {/* Stars + badge row */}
          <div className="flex items-center justify-between">
            <StarRow rating={item.rating} />
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider
                             text-emerald-600 dark:text-emerald-400
                             bg-emerald-50 dark:bg-emerald-950/40
                             border border-emerald-100 dark:border-emerald-900
                             px-2.5 py-1 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Verified
            </span>
          </div>

          {/* Quote */}
          <blockquote>
            <p className="text-sm leading-[1.7] text-zinc-600 dark:text-zinc-300 line-clamp-4 italic">
              &ldquo;{item.quote}&rdquo;
            </p>
          </blockquote>

          {/* Divider */}
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* Author row */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                         text-white text-xs font-black shadow-sm"
              style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {item.name}
              </p>
              {item.title && (
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                  {item.title}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </li>
  )
}

export function InfiniteMovingCards({
  items,
  direction = 'left',
  speed = 'normal',
  pauseOnHover = true,
  className,
}) {
  const containerRef = useRef(null)
  const scrollerRef  = useRef(null)
  const [start, setStart] = useState(false)

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      Array.from(scrollerRef.current.children).forEach(item => {
        scrollerRef.current.appendChild(item.cloneNode(true))
      })
      containerRef.current.style.setProperty(
        '--animation-direction',
        direction === 'left' ? 'forwards' : 'reverse'
      )
      const dur = speed === 'fast' ? '20s' : speed === 'slow' ? '80s' : '40s'
      containerRef.current.style.setProperty('--animation-duration', dur)
      setStart(true)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-20 overflow-hidden',
        '[mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]',
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          'flex min-w-full shrink-0 gap-4 py-6 w-max flex-nowrap items-stretch',
          start && 'animate-scroll',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {items.map((item, idx) => (
          <ReviewCard key={item.name ?? idx} item={item} />
        ))}
      </ul>
    </div>
  )
}
