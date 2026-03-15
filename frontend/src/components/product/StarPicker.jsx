import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={
              (hovered || value) >= n
                ? 'fill-black dark:fill-white text-black dark:text-white'
                : 'text-gray-300 dark:text-gray-700'
            }
          />
        </button>
      ))}
      <span className="text-xs text-gray-400 ml-2">
        {(hovered || value) ? t(`productPage.reviews.stars.${hovered || value}`) : ''}
      </span>
    </div>
  )
}
