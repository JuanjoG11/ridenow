import React, { useState } from 'react'
import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, size = 28, readonly = false }) {
  const [hover, setHover] = useState(0)

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = (hover || value) >= star
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            style={{
              background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer',
              padding: 2, display: 'flex', transition: 'transform 0.15s ease',
              transform: filled && !readonly ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <Star
              size={size}
              fill={filled ? '#f59e0b' : 'none'}
              color={filled ? '#f59e0b' : '#d1d5db'}
              strokeWidth={1.5}
            />
          </button>
        )
      })}
    </div>
  )
}
