import type { ReactNode } from 'react'
import './ui-history.css'

type ChangeState = 'changed' | 'added' | 'removed' | 'unchanged'

/** Audit cards own the disclosure affordance; callers supply business text and state. */
export function UiHistoryEvent({ summary, at, dateTime, open, onToggle, children, tone = 'neutral', className = '' }: {
  summary: ReactNode
  at: string
  dateTime: string
  open?: boolean
  onToggle?: () => void
  children?: ReactNode
  tone?: 'neutral' | 'danger'
  className?: string
}) {
  const heading = <><span className="ui-kit-history-event__summary">{summary}</span><time dateTime={dateTime}>{at}</time>{onToggle ? <span className="ui-kit-history-event__chevron" aria-hidden="true">⌄</span> : null}</>
  return <article className={`ui-kit-history-event ui-kit-history-event--${tone} ${open ? 'ui-kit-history-event--open' : ''} ${className}`.trim()}>
    {onToggle ? <button className="ui-kit-history-event__trigger" type="button" aria-expanded={Boolean(open)} onClick={onToggle}>{heading}</button> : <div className="ui-kit-history-event__heading">{heading}</div>}
    {open && children ? <div className="ui-kit-history-event__body">{children}</div> : null}
  </article>
}

/** Each changed field keeps its label attached to a comparison, including on narrow screens. */
export function UiChangeList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <dl className={`ui-kit-change-list ${className}`.trim()}>{children}</dl>
}

export function UiChangeRow({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <div className={`ui-kit-change-row ${className}`.trim()}><dt>{label}</dt><dd>{children}</dd></div>
}

/** Value cards accept rich content so a product link and its facts remain one readable unit. */
export function UiValueCard({ children, empty = false, changed = false, className = '' }: { children: ReactNode; empty?: boolean; changed?: boolean; className?: string }) {
  return <div className={`ui-kit-value-card ${empty ? 'ui-kit-value-card--empty' : ''} ${changed ? 'ui-kit-value-card--changed' : ''} ${className}`.trim()}>{children}</div>
}

/** Before and after use the same layout for a scalar field or an entire item card. */
export function UiComparison({ before, after, state = 'changed', stateLabel, beforeLabel = 'Before', afterLabel = 'After', className = '' }: {
  before: ReactNode
  after: ReactNode
  state?: ChangeState
  stateLabel?: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}) {
  return <div className={`ui-kit-comparison ui-kit-comparison--${state} ${className}`.trim()}>
    <div className="ui-kit-comparison__side"><span className="ui-kit-comparison__label">{beforeLabel}</span>{before}</div>
    <span className="ui-kit-comparison__transition" aria-label={stateLabel ?? afterLabel}><span aria-hidden="true">→</span>{stateLabel ? <small>{stateLabel}</small> : null}</span>
    <div className="ui-kit-comparison__side"><span className="ui-kit-comparison__label">{afterLabel}</span>{after}</div>
  </div>
}
