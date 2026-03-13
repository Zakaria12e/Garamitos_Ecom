import React from 'react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Header() {

const [search, setSearch] = useState('')
const navigate = useNavigate()

const handleSearch = (e) => {
  e.preventDefault()

  if (search.trim()) {
    navigate('/catalog?search=' + encodeURIComponent(search.trim()))
    setSearch('')
  }
}
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-black dark:bg-white rounded flex items-center justify-center">
            <Shield size={14} className="text-white dark:text-black" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Garamitos</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 ml-4">
          <Link to="/catalog">Catalog</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/orders">Orders</Link>
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs ml-auto">
          <div className="relative w-full">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cameras, security..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-900 rounded-md border border-transparent focus:border-gray-300 dark:focus:border-gray-700 focus:outline-none transition-colors" />
          </div>
        </form>

      </div>
    </header>
  )
}