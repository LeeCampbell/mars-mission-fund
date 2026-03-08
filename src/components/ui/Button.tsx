import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type BaseProps = {
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  disabled?: boolean
}

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined
  }

type AnchorProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string
  }

type Props = ButtonProps | AnchorProps

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.625rem 1.5rem',
  borderRadius: 'var(--radius-button)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'background-color var(--motion-hover), color var(--motion-hover), border-color var(--motion-hover), box-shadow var(--motion-hover)',
  outline: 'none',
  border: '1px solid transparent',
}

const variantStyles: Record<'primary' | 'secondary' | 'ghost', React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-action-primary)',
    color: 'var(--color-text-on-action)',
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: 'var(--color-action-secondary-bg)',
    color: 'var(--color-action-secondary-text)',
    borderColor: 'var(--color-action-secondary-border)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-action-ghost-text)',
    borderColor: 'transparent',
  },
}

const disabledStyle: React.CSSProperties = {
  color: 'var(--color-action-disabled)',
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  cursor: 'not-allowed',
  pointerEvents: 'none',
}

function getStyle(variant: 'primary' | 'secondary' | 'ghost', disabled?: boolean): React.CSSProperties {
  if (disabled) {
    return { ...baseStyle, ...disabledStyle }
  }
  return { ...baseStyle, ...variantStyles[variant] }
}

export function Button(props: Props) {
  const { variant = 'primary', className, disabled, ...rest } = props

  const style = getStyle(variant, disabled)

  const focusStyle = `
    [data-button]:focus-visible {
      outline: 2px solid var(--color-action-primary-hover);
      outline-offset: 2px;
    }
  `

  if ('href' in props && props.href !== undefined) {
    const { href, onClick, ...anchorRest } = rest as Omit<AnchorProps, 'variant' | 'className' | 'disabled'>
    return (
      <>
        <style>{focusStyle}</style>
        <a
          data-button
          href={href}
          className={className}
          style={style}
          aria-disabled={disabled}
          onClick={disabled ? (e) => e.preventDefault() : onClick}
          onMouseEnter={(e) => {
            if (!disabled) applyHover(e.currentTarget, variant)
          }}
          onMouseLeave={(e) => {
            if (!disabled) removeHover(e.currentTarget, variant)
          }}
          {...anchorRest}
        />
      </>
    )
  }

  const { onClick, ...buttonRest } = rest as Omit<ButtonProps, 'variant' | 'className' | 'disabled'>
  return (
    <>
      <style>{focusStyle}</style>
      <button
        data-button
        type="button"
        className={className}
        style={style}
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (!disabled) applyHover(e.currentTarget, variant)
        }}
        onMouseLeave={(e) => {
          if (!disabled) removeHover(e.currentTarget, variant)
        }}
        {...buttonRest}
      />
    </>
  )
}

function applyHover(el: HTMLElement, variant: 'primary' | 'secondary' | 'ghost') {
  if (variant === 'primary') {
    el.style.backgroundColor = 'var(--color-action-primary-hover)'
  } else if (variant === 'secondary') {
    el.style.borderColor = 'var(--color-border-accent)'
    el.style.color = 'var(--color-text-primary)'
  } else if (variant === 'ghost') {
    el.style.backgroundColor = 'rgba(255, 92, 26, 0.08)'
    el.style.borderColor = 'var(--color-action-ghost-border)'
  }
}

function removeHover(el: HTMLElement, variant: 'primary' | 'secondary' | 'ghost') {
  if (variant === 'primary') {
    el.style.backgroundColor = 'var(--color-action-primary)'
  } else if (variant === 'secondary') {
    el.style.borderColor = 'var(--color-action-secondary-border)'
    el.style.color = 'var(--color-action-secondary-text)'
  } else if (variant === 'ghost') {
    el.style.backgroundColor = 'transparent'
    el.style.borderColor = 'transparent'
  }
}
