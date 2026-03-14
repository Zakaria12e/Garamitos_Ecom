import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <Icon size={14} className="text-gray-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-lg font-bold">Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your account and preferences</p>
        </div>
      </motion.div>
    </div>
  )
}

export { SectionCard }
