import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Field = ({ label, type = 'text', show, onToggle, ...props }) => (
  <div>
    <label className="block text-xs font-medium mb-1.5">{label}</label>
    <div className="relative">
      <input
        type={show !== undefined ? (show ? 'text' : 'password') : type}
        {...props}
        className="w-full text-sm border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white transition-colors pr-10"
      />
      {onToggle && (
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  </div>
)

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, user } = useAuth()
  const navigate = useNavigate()

  return <div />
}
