import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OrderConfirmation({ orderNumber, email }) {
  const { t } = useTranslation()
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-14 h-14 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={24} className="text-white dark:text-black" />
      </div>
      <h1 className="text-xl font-bold mb-2">{t('checkout.orderConfirmed')}</h1>
      <p className="text-sm text-gray-500 mb-1">
        {t('checkout.orderLabel')} <span className="font-mono font-semibold text-black dark:text-white">{orderNumber}</span>
      </p>
      <p className="text-xs text-gray-400 mb-6">{t('checkout.confirmationSent', { email })}</p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="text-sm border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
          {t('nav.home')}
        </Link>
        <Link to="/orders" className="text-sm bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
          {t('checkout.viewOrders')}
        </Link>
      </div>
    </div>
  )
}
