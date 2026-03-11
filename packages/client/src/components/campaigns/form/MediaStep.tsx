import { useState } from 'react'
import { Button } from '../../ui/Button'

export interface MediaData {
  heroImageUrl: string
  additionalImageUrls: string[]
}

interface MediaStepProps {
  data: MediaData
  onChange: (data: MediaData) => void
}

const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-input-label-size)',
  fontWeight: 'var(--type-input-label-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-input-label-spacing)',
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg-input)',
  border: '1px solid var(--color-border-input)',
  borderRadius: 'var(--radius-input)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  padding: 'var(--space-3) var(--space-4)',
  width: '100%',
  boxSizing: 'border-box' as const,
  outline: 'none',
}

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
}

const imageRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
}

export function MediaStep({ data, onChange }: MediaStepProps) {
  const [newUrl, setNewUrl] = useState('')

  function handleAddUrl() {
    const trimmed = newUrl.trim()
    if (!trimmed) return
    onChange({ ...data, additionalImageUrls: [...data.additionalImageUrls, trimmed] })
    setNewUrl('')
  }

  function handleRemoveUrl(index: number) {
    onChange({
      ...data,
      additionalImageUrls: data.additionalImageUrls.filter((_, i) => i !== index),
    })
  }

  function handleUrlKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUrl()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={fieldGroupStyle}>
        <label htmlFor="hero-image-url" style={labelStyle}>
          Hero Image URL
        </label>
        <input
          id="hero-image-url"
          type="url"
          value={data.heroImageUrl}
          onChange={(e) => onChange({ ...data, heroImageUrl: e.target.value })}
          style={inputStyle}
          placeholder="https://example.com/your-campaign-hero.jpg"
        />
        <span style={hintStyle}>
          The main image displayed at the top of your campaign page. Recommended: 1600×900px (16:9).
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={fieldGroupStyle}>
          <label htmlFor="additional-image-url" style={labelStyle}>
            Additional Images
          </label>
          <div style={imageRowStyle}>
            <input
              id="additional-image-url"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="https://example.com/image.jpg"
            />
            <Button
              variant="secondary"
              onClick={handleAddUrl}
              type="button"
              disabled={!newUrl.trim()}
            >
              Add
            </Button>
          </div>
          <span style={hintStyle}>
            Press Enter or click Add. These appear in the campaign gallery.
          </span>
        </div>

        {data.additionalImageUrls.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            {data.additionalImageUrls.map((url, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-input)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-input)',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--type-body-small-size)',
                    color: 'var(--color-text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={url}
                >
                  {url}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => handleRemoveUrl(index)}
                  type="button"
                  aria-label={`Remove image ${index + 1}`}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
