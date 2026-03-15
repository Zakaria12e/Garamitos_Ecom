import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, User, Lock, Globe, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../lib/api'

const LANGS = [
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

function Field({ label, type = 'text', value, onChange, required, showToggle, ...props }) {
  const [show, setShow] = useState(false)
  const inputType = showToggle ? (show ? 'text' : 'password') : type
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute inset-y-0 end-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  )
}

function SaveButton({ loading, saved, label, savedLabel }) {
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
      {saved ? <><CheckCircle size={12} /> {savedLabel}</> : label}
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
  const { user, updateProfile } = useAuth()
  const { t, i18n } = useTranslation()

  const [profile, setProfile]             = useState({ name: user?.name || '', email: user?.email || '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)
  const [profileError, setProfileError]   = useState('')

  const [passwords, setPasswords]         = useState({ current: '', next: '', confirm: '' })
  const [passSaving, setPassSaving]       = useState(false)
  const [passSaved, setPassSaved]         = useState(false)
  const [passError, setPassError]         = useState('')

  if (!user) return <Navigate to="/login" replace />

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSaving(true)
    try {
      await updateProfile({ name: profile.name, email: profile.email })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (err) {
      setProfileError(err.message || t('settings.profile.error'))
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPassError('')
    if (passwords.next !== passwords.confirm) {
      setPassError(t('settings.security.mismatch'))
      return
    }
    setPassSaving(true)
    try {
      await authApi.changePassword({ currentPassword: passwords.current, newPassword: passwords.next })
      setPasswords({ current: '', next: '', confirm: '' })
      setPassSaved(true)
      setTimeout(() => setPassSaved(false), 2500)
    } catch (err) {
      setPassError(err.message || t('settings.security.error'))
    } finally {
      setPassSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-lg font-bold">{t('settings.title')}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{t('settings.subtitle')}</p>
        </div>

        <SectionCard icon={User} title={t('settings.profile.title')}>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label={t('settings.profile.name')}
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                required
              />
              <Field
                label={t('settings.profile.email')}
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            {profileError && <p className="text-xs text-red-500">{profileError}</p>}
            <div className="flex justify-end">
              <SaveButton
                loading={profileSaving}
                saved={profileSaved}
                label={t('settings.profile.save')}
                savedLabel={t('settings.profile.saved')}
              />
            </div>
          </form>
        </SectionCard>

        <SectionCard icon={Lock} title={t('settings.security.title')}>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Field
              label={t('settings.security.current')}
              showToggle
              value={passwords.current}
              onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label={t('settings.security.new')}
                showToggle
                value={passwords.next}
                onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                required
              />
              <Field
                label={t('settings.security.confirm')}
                showToggle
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                required
              />
            </div>
            {passError && <p className="text-xs text-red-500">{passError}</p>}
            <div className="flex justify-end">
              <SaveButton
                loading={passSaving}
                saved={passSaved}
                label={t('settings.security.save')}
                savedLabel={t('settings.security.saved')}
              />
            </div>
          </form>
        </SectionCard>

        <SectionCard icon={Globe} title={t('settings.preferences.title')}>
          <div>
            <p className="text-xs font-medium mb-3">{t('settings.preferences.language')}</p>
            <div className="grid grid-cols-3 gap-3">
              {LANGS.map(({ code, label, flag }) => (
                <button
                  key={code}
                  onClick={() => i18n.changeLanguage(code)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    i18n.language === code
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-medium'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="text-base">{flag}</span>
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

      </motion.div>
    </div>
  )
}
