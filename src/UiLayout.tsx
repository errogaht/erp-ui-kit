import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './ui-layout.css'

type Span = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Gap = 'tight' | 'normal' | 'relaxed'

/**
 * Layout contract for compact application screens. Use Container > Grid > Cell for page
 * structure; each Cell occupies all 12 columns on a phone unless specified.
 * Breakpoints are 640px and 1100px, independent of the host app sidebar.
 * Nested grids are allowed because every Cell has min-width:0 and may shrink.
 */
export function UiContainer({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`ui-kit-container ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

/** Use Grid for related cards or columns; choose one gap token for the whole group. */
export function UiGrid({
  children,
  gap = 'normal',
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; gap?: Gap }) {
  return (
    <div className={`ui-kit-grid ui-kit-grid--${gap} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

/**
 * Declare spans at each breakpoint instead of hard-coding widths in a card.
 * `tablet` and `desktop` inherit the previous value when omitted. For example
 * mobile=12, tablet=6, desktop=4 yields 1 / 2 / 3 cards per row.
 */
export function UiCell({
  children,
  mobile = 12,
  tablet,
  desktop,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  mobile?: Span
  tablet?: Span
  desktop?: Span
}) {
  const style = {
    ...props.style,
    '--ui-kit-span-mobile': mobile,
    '--ui-kit-span-tablet': tablet ?? mobile,
    '--ui-kit-span-desktop': desktop ?? tablet ?? mobile,
  } as CSSProperties
  return (
    <div className={`ui-kit-cell ${className}`.trim()} {...props} style={style}>
      {children}
    </div>
  )
}

/** Vertical rhythm for content within cards; the child owns no extra margins. */
export function UiStack({
  children,
  gap = 'normal',
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; gap?: Gap }) {
  return (
    <div className={`ui-kit-stack ui-kit-stack--${gap} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

/** Wrapping row for short controls, badges and card actions; never use for wide form fields. */
export function UiInline({
  children,
  gap = 'tight',
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; gap?: Gap }) {
  return (
    <div className={`ui-kit-inline ui-kit-inline--${gap} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

/** Title and actions share a line until space runs out; wrapping is intentional. */
export function UiSplit({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`ui-kit-split ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
