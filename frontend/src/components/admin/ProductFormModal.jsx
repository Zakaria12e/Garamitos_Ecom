import { motion, AnimatePresence } from 'framer-motion'

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-400 mb-1">{label}</label>
      <input
        {...props}
        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
      />
    </div>
  )
}

export default function ProductFormModal({ show, editing, onClose }) {
  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5"
        >
          <h3 className="text-sm font-semibold mb-4">{editing ? 'Edit Product' : 'New Product'}</h3>

          <div className="flex gap-2 mt-4">
            <button onClick={onClose} className="flex-1 border border-gray-200 dark:border-gray-800 py-2 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
