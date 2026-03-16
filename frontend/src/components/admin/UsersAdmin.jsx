import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Trash2, ShieldCheck, User, Loader2, Users } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'
import { usersApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const PAGE_SIZE = 10

function DeleteModal({ user, onConfirm, onClose, loading }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <Trash2 size={16} className="text-red-500" />
          </div>
          <h2 className="text-sm font-semibold">{t('admin.users.deleteTitle')}</h2>
        </div>
        <p className="text-xs mb-1">
          {t('admin.users.deleteConfirm')} <span className="font-semibold">{user.name}</span>?
        </p>
        <p className="text-xs text-red-400 mb-5">{t('admin.users.deleteWarning')}</p>
        <div className="flex gap-2">
          <button onClick={onClose} disabled={loading}
            className="flex-1 border border-gray-200 dark:border-gray-800 py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors">
            {t('admin.common.cancel')}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5">
            {loading && <Loader2 size={12} className="animate-spin" />}
            {t('admin.common.del')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersAdmin() {
  const { t } = useTranslation()
  const { user: me } = useAuth()
  const [users, setUsers]           = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [toDelete, setToDelete]     = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  const load = (q = '', p = 1) => {
    setLoading(true)
    usersApi.list({ search: q, page: p, limit: PAGE_SIZE })
      .then(d => { setUsers(d.users || []); setTotal(d.total || 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = e => { const q = e.target.value; setSearch(q); setPage(1); load(q, 1) }
  const handlePageChange = p => { setPage(p); load(search, p) }

  const handleRoleToggle = async (u) => {
    setTogglingId(u._id)
    try {
      const data = await usersApi.setRole(u._id, u.role === 'admin' ? 'user' : 'admin')
      setUsers(prev => prev.map(x => x._id === u._id ? data.user : x))
    } catch (err) { console.error(err) }
    finally { setTogglingId(null) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await usersApi.delete(toDelete._id); setToDelete(null); load(search, page) }
    catch (err) { console.error(err) }
    finally { setDeleting(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-4">
      {toDelete && (
        <DeleteModal user={toDelete} onConfirm={handleDelete} onClose={() => setToDelete(null)} loading={deleting} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Users size={15} />
          <h2 className="text-sm font-semibold">{t('admin.users.title')}</h2>
          <span className="text-[10px] font-semibold bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full">{total}</span>
        </div>
        <div className="relative w-full sm:w-56">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={handleSearch}
            placeholder={t('admin.users.searchPlaceholder')}
            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none focus:border-black dark:focus:border-white w-full bg-transparent transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">{t('admin.users.name')}</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 font-semibold">{t('admin.users.email')}</th>
                <th className="text-left px-4 py-3 font-semibold">{t('admin.users.role')}</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 font-semibold">{t('admin.users.joined')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Skeleton className="w-7 h-7 rounded-full shrink-0" /><Skeleton className="h-3 w-28" /></div></td>
                    <td className="hidden sm:table-cell px-4 py-3"><Skeleton className="h-3 w-40" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="hidden sm:table-cell px-4 py-3"><Skeleton className="h-3 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-6 rounded" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-sm">{t('admin.users.noUsers')}</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-white dark:text-black">{u.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium truncate max-w-[120px]">{u.name}</span>
                            {u._id === me?._id && (
                              <span className="text-[9px] font-semibold text-blue-500 border border-blue-300 dark:border-blue-700 px-1.5 py-0.5 rounded-full shrink-0">you</span>
                            )}
                          </div>
                          {/* Email shown below name on mobile only */}
                          <p className="sm:hidden text-[10px] text-gray-400 truncate max-w-[150px] mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Email — desktop only */}
                    <td className="hidden sm:table-cell px-4 py-3 truncate max-w-[180px]">{u.email}</td>
                    {/* Role badge + toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        disabled={!!togglingId || u._id === me?._id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                          u.role === 'admin'
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/30'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
                        }`}
                      >
                        {togglingId === u._id
                          ? <Loader2 size={9} className="animate-spin" />
                          : u.role === 'admin' ? <ShieldCheck size={9} /> : <User size={9} />
                        }
                        {u.role === 'admin' ? t('admin.users.roleAdmin') : t('admin.users.roleUser')}
                      </button>
                    </td>
                    {/* Joined — desktop only */}
                    <td className="hidden sm:table-cell px-4 py-3 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                    {/* Delete */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setToDelete(u)}
                        disabled={u._id === me?._id}
                        className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
            className="border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-md hover:border-black dark:hover:border-white disabled:opacity-40 transition-colors">
            {t('admin.orders.prev')}
          </button>
          <span>{t('admin.orders.page', { current: page, total: totalPages })}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}
            className="border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-md hover:border-black dark:hover:border-white disabled:opacity-40 transition-colors">
            {t('admin.orders.next')}
          </button>
        </div>
      )}
    </div>
  )
}
