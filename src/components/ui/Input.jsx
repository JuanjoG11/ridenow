import React, { useState } from 'react'

export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  type = 'text',
  ...props
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label style={{
          fontSize: '13px',
          fontWeight: 600,
          color: focused ? '#2563eb' : '#374151',
          transition: 'color 0.2s',
          letterSpacing: '-0.01em'
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: focused ? '#2563eb' : '#9ca3af',
            transition: 'color 0.2s',
            display: 'flex', alignItems: 'center'
          }}>
            <Icon size={18} />
          </span>
        )}
        <input
          type={type}
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e) }}
          onBlur={e => { setFocused(false); props.onBlur?.(e) }}
          style={{
            width: '100%',
            height: 50,
            padding: `0 ${RightIcon ? 44 : 16}px 0 ${Icon ? 44 : 16}px`,
            border: `2px solid ${error ? '#ef4444' : focused ? '#2563eb' : '#e5e7eb'}`,
            borderRadius: 12,
            fontSize: 15,
            color: '#111827',
            background: focused ? '#eff6ff' : '#f9fafb',
            outline: 'none',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            ...(props.style || {})
          }}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0
            }}
          >
            <RightIcon size={18} />
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{hint}</span>
      )}
    </div>
  )
}
