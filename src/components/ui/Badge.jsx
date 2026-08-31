import React from 'react'

const badgeStyles = {
  blue:   { background: '#dbeafe', color: '#1d4ed8' },
  pink:   { background: '#fce7f3', color: '#9d174d' },
  green:  { background: '#d1fae5', color: '#065f46' },
  orange: { background: '#fef3c7', color: '#92400e' },
  red:    { background: '#fee2e2', color: '#991b1b' },
  gray:   { background: '#f3f4f6', color: '#374151' },
}

export default function Badge({ children, color = 'blue', style = {} }) {
  const s = badgeStyles[color] || badgeStyles.blue
  return (
    <span style={{
      ...s,
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 99,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      ...style
    }}>
      {children}
    </span>
  )
}
