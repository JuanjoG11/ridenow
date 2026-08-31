import React from 'react'

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px 0 rgba(37,99,235,0.4)',
  },
  secondary: {
    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px 0 rgba(236,72,153,0.4)',
  },
  outline: {
    background: 'transparent',
    color: '#2563eb',
    border: '2px solid #2563eb',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: '#6b7280',
    border: 'none',
    boxShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px 0 rgba(239,68,68,0.4)',
  }
}

const sizes = {
  sm: { padding: '8px 16px', fontSize: '13px', height: '36px', borderRadius: '10px' },
  md: { padding: '12px 24px', fontSize: '15px', height: '48px', borderRadius: '12px' },
  lg: { padding: '16px 32px', fontSize: '16px', height: '56px', borderRadius: '14px' },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...v,
        ...s,
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        letterSpacing: '-0.01em',
        ...style
      }}
      onMouseDown={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'scale(0.97)'
        }
      }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      {...props}
    >
      {loading ? (
        <span style={{
          width: 18, height: 18,
          border: '2.5px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block'
        }} />
      ) : children}
    </button>
  )
}
