import type { CSSProperties, HTMLAttributes } from 'react'
import codepoints from 'bootstrap-icons/font/bootstrap-icons.json'
import './ui-bootstrap-icons.css'

/** Names come from the pinned official Bootstrap Icons package, not a hand-maintained subset. */
export type BootstrapIconName = keyof typeof codepoints
export const bootstrapIconNames = Object.keys(codepoints) as BootstrapIconName[]

/**
 * Renders any Bootstrap Icon without importing the framework's global `.bi-*` rules.
 * Decorative icons are hidden from assistive technology. Supply `label` only when
 * the icon conveys meaning without adjacent text, such as a standalone status.
 */
export function UiBootstrapIcon({ name, label, size, className = '', style, ...props }: Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  name: BootstrapIconName
  label?: string
  size?: number | string
}) {
  const glyph = String.fromCodePoint(codepoints[name])
  const iconStyle = { ...style, ...(size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {}) } as CSSProperties
  return <span
    {...props}
    aria-hidden={label ? undefined : true}
    aria-label={label}
    className={`ui-kit-bootstrap-icon ${className}`.trim()}
    data-glyph={glyph}
    role={label ? 'img' : undefined}
    style={iconStyle}
  />
}
