import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type BaseProps = {
  variant?: ButtonVariant
  disabled?: boolean
  children: React.ReactNode
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined
  }

type ButtonAsAnchor = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsAnchor

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-action-primary)',
    color: 'var(--color-action-primary-text)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--color-action-secondary-bg)',
    color: 'var(--color-action-secondary-text)',
    border: '1px solid var(--color-action-secondary-border)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-action-ghost-text)',
    border: '1px solid var(--color-action-ghost-border)',
  },
}

const disabledStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-action-disabled)',
  color: 'var(--color-action-disabled)',
  border: 'none',
  pointerEvents: 'none',
  opacity: 0.6,
}

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.625rem 1.5rem',
  borderRadius: 'var(--radius-button)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-button)',
  fontWeight: 600,
  lineHeight: 1,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'background-color var(--motion-hover), color var(--motion-hover), border-color var(--motion-hover)',
  outlineOffset: '2px',
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', disabled = false, children, href, ...rest } = props

  const computedStyle: React.CSSProperties = {
    ...baseStyle,
    ...(disabled ? disabledStyle : variantStyles[variant]),
  }

  if (href !== undefined) {
    const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a
        href={href}
        aria-disabled={disabled || undefined}
        style={computedStyle}
        onMouseEnter={
          !disabled && variant === 'primary'
            ? (e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  'var(--color-action-primary-hover)'
              }
            : undefined
        }
        onMouseLeave={
          !disabled && variant === 'primary'
            ? (e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  'var(--color-action-primary)'
              }
            : undefined
        }
        className={[
          'focus-visible:outline',
          'focus-visible:outline-2',
          'focus-visible:outline-[var(--color-border-accent)]',
        ].join(' ')}
        {...anchorProps}
      >
        {children}
      </a>
    )
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      disabled={disabled}
      aria-disabled={disabled || undefined}
      style={computedStyle}
      onMouseEnter={
        !disabled && variant === 'primary'
          ? (e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-action-primary-hover)'
            }
          : undefined
      }
      onMouseLeave={
        !disabled && variant === 'primary'
          ? (e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-action-primary)'
            }
          : undefined
      }
      className={[
        'focus-visible:outline',
        'focus-visible:outline-2',
        'focus-visible:outline-[var(--color-border-accent)]',
        'focus-visible:outline-offset-2',
      ].join(' ')}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
