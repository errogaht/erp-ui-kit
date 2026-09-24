import type { HTMLAttributes } from 'react'
import './ui-kit.css'

/** Visual message surface only. The screen owns safe body rendering, media,
 * receipts, quoting and send state; keep those children and their callbacks intact.
 */
export function UiMessage({ outgoing = false, compact = false, className = '', ...props }: HTMLAttributes<HTMLElement> & { outgoing?: boolean; compact?: boolean }) {
  return <article className={`ui-kit-message${outgoing ? ' ui-kit-message--outgoing' : ''}${compact ? ' ui-kit-message--compact' : ''} ${className}`.trim()} {...props} />
}
