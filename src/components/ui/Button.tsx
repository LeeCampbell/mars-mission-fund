import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface BaseProps {
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const BUTTON_CSS = `
  .mmf-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: var(--radius-button);
    font-family: var(--font-family-body);
    font-size: var(--font-size-button);
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--letter-spacing-button);
    padding: 0.625rem 1.5rem;
    cursor: pointer;
    text-decoration: none;
    border: 1px solid transparent;
    transition:
      filter var(--motion-hover),
      background var(--motion-hover),
      border-color var(--motion-hover),
      opacity var(--motion-hover);
    outline: none;
    line-height: 1.2;
    white-space: nowrap;
    -webkit-font-smoothing: antialiased;
  }

  .mmf-btn:focus-visible {
    outline: 2px solid var(--color-border-accent);
    outline-offset: 2px;
  }

  /* Primary */
  .mmf-btn-primary {
    background: var(--gradient-action-primary);
    color: var(--color-action-primary-text);
    border-color: transparent;
    box-shadow: 0 2px 12px var(--color-action-primary-shadow);
  }
  .mmf-btn-primary:hover:not(:disabled):not([aria-disabled='true']) {
    filter: brightness(1.15);
  }

  /* Secondary */
  .mmf-btn-secondary {
    background: var(--color-action-secondary-bg);
    color: var(--color-action-secondary-text);
    border-color: var(--color-action-secondary-border);
  }
  .mmf-btn-secondary:hover:not(:disabled):not([aria-disabled='true']) {
    border-color: var(--color-border-accent);
    color: var(--color-text-primary);
  }

  /* Ghost */
  .mmf-btn-ghost {
    background: transparent;
    color: var(--color-action-ghost-text);
    border-color: var(--color-action-ghost-border);
  }
  .mmf-btn-ghost:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--color-action-ghost-border);
  }

  /* Disabled */
  .mmf-btn:disabled,
  .mmf-btn[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export function Button(props: ButtonProps): React.ReactElement {
  const { variant = 'primary', disabled = false, className, children, ...rest } = props;

  const classNames = ['mmf-btn', `mmf-btn-${variant}`, className].filter(Boolean).join(' ');

  const styleTag = (
    // React 19 deduplicates <style> tags with the same `href` + `precedence`
    <style href="mmf-button" precedence="component">
      {BUTTON_CSS}
    </style>
  );

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as Omit<ButtonAsAnchor, keyof BaseProps>;
    return (
      <>
        {styleTag}
        <a
          href={href}
          className={classNames}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          {...anchorRest}
        >
          {children}
        </a>
      </>
    );
  }

  const buttonRest = rest as Omit<ButtonAsButton, keyof BaseProps>;
  return (
    <>
      {styleTag}
      <button className={classNames} disabled={disabled} {...buttonRest}>
        {children}
      </button>
    </>
  );
}
