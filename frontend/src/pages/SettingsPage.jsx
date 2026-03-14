import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, User, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../lib/api'

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full text-sm border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-black dark:focus:border-white transition-colors"
      />
    </div>
  )
}

function SaveButton({ loading, saved, label = 'Save Changes' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        saved
          ? 'bg-green-600 text-white'
          : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
      }`}
    >
      {loading && <Loader2 size={12} className="animate-spin" />}
      {saved ? <><CheckCircle size={12} /> Saved!</> : label}
    </button>
  )
}

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
  const { user, setUser } = useAuth()

  const [profile, setProfile]             = useState({ name: user?.name || '', email: user?.email || '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)
  const [profileError, setProfileError]   = useState('')

  if (!user) return <Navigate to="/login" replace />

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSaving(true)
    try {
      const res = await authApi.updateMe({ name: profile.name, email: profile.email })
      if (setUser) setUser(res.user)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-lg font-bold">Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your account and preferences</p>
        </div>

        <SectionCard icon={User} title="Profile">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
              <Field label="Email Address" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} required />
            </div>
            {profileError && <p className="text-xs text-red-500">{profileError}</p>}
            <div className="flex justify-end">
              <SaveButton loading={profileSaving} saved={profileSaved} />
            </div>
          </form>
        </SectionCard>
      </motion.div>
    </div>
  )
}

export { SectionCard }
