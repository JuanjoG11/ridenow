import React from 'react'
import { User } from 'lucide-react'

export default function Avatar({ name, size = 40, src, online = false }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const colors = [
    ['#dbeafe', '#2563eb'], ['#fce7f3', '#db2777'],
    ['#d1fae5', '#059669'], ['#fef3c7', '#d97706'],
    ['#ede9fe', '#7c3aed'], ['#fee2e2', '#dc2626'],
  ]
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  const [bg, fg] = colors[idx]

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        overflow: 'hidden',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid #fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        flexShrink: 0
      }}>
        {src ? (
          <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : name ? (
          <span style={{ fontSize: size * 0.36, fontWeight: 700, color: fg }}>{initials}</span>
        ) : (
          <User size={size * 0.5} color={fg} />
        )}
      </div>
      {online && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28,
          borderRadius: '50%',
          background: '#22c55e',
          border: '2px solid #fff'
        }} />
      )}
    </div>
  )
}
