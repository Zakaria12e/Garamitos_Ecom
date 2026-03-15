import React from 'react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  const categories = [
    { key: 'tools',       slug: 'Power Tools' },
    { key: 'plumbing',    slug: 'Plumbing' },
    { key: 'electrical',  slug: 'Electrical' },
    { key: 'paint',       slug: 'Paint & Finishing' },
  ]

  const accountLinks = [
    { key: 'orders',   path: '/orders' },
    { key: 'wishlist', path: '/wishlist' },
    { key: 'compare',  path: '/compare' },
    { key: 'cart',     path: '/cart' },
  ]

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
              <Shield size={12} className="text-white dark:text-black" />
            </div>
            <span className="font-semibold text-sm">Garamitos</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('footer.tagline')}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider">{t('footer.shopTitle')}</h4>
          {categories.map(({ key, slug }) => (
            <Link key={key} to={"/catalog?category=" + encodeURIComponent(slug)} className="block text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-1.5 transition-colors">
              {t(`footer.categories.${key}`)}
            </Link>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider">{t('footer.accountTitle')}</h4>
          {accountLinks.map(({ key, path }) => (
            <Link key={path} to={path} className="block text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-1.5 transition-colors">
              {t(`footer.links.${key}`)}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 py-4 px-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Garamitos. {t('footer.copyright')}
      </div>
    </footer>
  )
}
