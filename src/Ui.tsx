import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { UiIcon } from './UiIcon'
import './ui-kit.css'

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'telegram' | 'whatsapp'

/** Reusable visual primitives. Domain data and authorization stay with consumers. */
export function UiBadge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span className={`ui-kit-badge ui-kit-badge--${tone} ${className}`.trim()}>{children}</span>
  )
}

export function UiNotice({
  children,
  tone = 'accent',
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode
  tone?: 'accent' | 'success' | 'warning' | 'danger'
}) {
  return (
    <p className={`ui-kit-notice ui-kit-notice--${tone} ${className}`.trim()} {...props}>
      {children}
    </p>
  )
}

export function UiButton({
  children,
  variant = 'default',
  size = 'compact',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'danger' | 'quiet'
  size?: 'compact' | 'regular'
}) {
  return (
    <button
      className={`ui-kit-button ui-kit-button--${variant} ui-kit-button--${size} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

/** Navigation can use the same centered button treatment without losing native link semantics. */
export function UiLinkButton({ children, variant = 'default', size = 'compact', className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: 'default' | 'primary' | 'danger' | 'quiet'; size?: 'compact' | 'regular' }) {
  return <a className={`ui-kit-button ui-kit-button--${variant} ui-kit-button--${size} ${className}`.trim()} {...props}>{children}</a>
}

/** Controlled selection keeps keyboard/button behavior and aria-pressed consistent across inbox and catalog. */
export function UiSegmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className = '',
}: {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div aria-label={label} className={`ui-kit-segmented ${className}`.trim()} role="group">
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={value === option.value ? 'is-active' : ''}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Tabs own their panel and Arrow/Home/End keyboard contract; use segmented for simple filters. */
export function UiTabs<T extends string>({
  label,
  items,
  value,
  onChange,
  renderPanel,
}: {
  label: string
  items: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  renderPanel: (value: T) => ReactNode
}) {
  const baseId = useId()
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const activeIndex = items.findIndex((item) => item.value === value)
  return (
    <div className="ui-kit-tabs">
      <div aria-label={label} role="tablist">
        {items.map((item, index) => (
          <button
            aria-controls={`${baseId}-panel`}
            aria-selected={value === item.value}
            id={`${baseId}-tab-${index}`}
            key={item.value}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => {
              let nextIndex: number
              if (event.key === 'ArrowRight') nextIndex = (index + 1) % items.length
              else if (event.key === 'ArrowLeft')
                nextIndex = (index + items.length - 1) % items.length
              else if (event.key === 'Home') nextIndex = 0
              else if (event.key === 'End') nextIndex = items.length - 1
              else return
              event.preventDefault()
              onChange(items[nextIndex].value)
              refs.current[nextIndex]?.focus()
            }}
            ref={(node) => {
              refs.current[index] = node
            }}
            role="tab"
            tabIndex={value === item.value ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        aria-labelledby={`${baseId}-tab-${Math.max(activeIndex, 0)}`}
        id={`${baseId}-panel`}
        role="tabpanel"
        tabIndex={0}
      >
        {renderPanel(value)}
      </div>
    </div>
  )
}

export function UiPanel({
  title,
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLElement> & {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`ui-kit-panel ${className}`.trim()} {...props}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  )
}

/** Context inside a message stays an aside while sharing panel geometry and tokens. */
export function UiAsidePanel({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <aside className={`ui-kit-panel ${className}`.trim()} {...props} />
}

/** Product editing rows keep description, quantity, amount and actions on one predictable grid. */
export function UiItemRow({ main, control, amount, actions, detail, className = '' }: { main: ReactNode; control: ReactNode; amount: ReactNode; actions: ReactNode; detail?: ReactNode; className?: string }) {
  return <article className={`ui-kit-item-row ${className}`.trim()}>
    <div className="ui-kit-item-row__main">{main}</div>
    <div className="ui-kit-item-row__control">{control}</div>
    <div className="ui-kit-item-row__amount">{amount}</div>
    <div className="ui-kit-item-row__actions">{actions}</div>
    {detail ? <div className="ui-kit-item-row__detail">{detail}</div> : null}
  </article>
}

/** A labeled field and its action share the same baseline despite host form-label margins. */
export function UiFormActionRow({ field, action, className = '' }: { field: ReactNode; action: ReactNode; className?: string }) {
  return <div className={`ui-kit-form-action-row ${className}`.trim()}><div className="ui-kit-form-action-row__field">{field}</div><div className="ui-kit-form-action-row__action">{action}</div></div>
}

export function UiEmpty({ children }: { children: ReactNode }) {
  return <p className="ui-kit-empty">{children}</p>
}

type CardTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

/**
 * Card is a content boundary, not a layout column. Place it in UiCell and
 * choose the Cell span for the screen. Header/actions/footer remain optional so
 * one component works for orders, money, tasks and settings.
 */
export function UiCard({
  title,
  eyebrow,
  actions,
  footer,
  children,
  tone = 'neutral',
  className = '',
}: {
  title: ReactNode
  eyebrow?: string
  actions?: ReactNode
  footer?: ReactNode
  children: ReactNode
  tone?: CardTone
  className?: string
}) {
  return (
    <article className={`ui-kit-card ui-kit-card--${tone} ${className}`.trim()}>
      <header className="ui-kit-card__header">
        <div>
          {eyebrow ? <span className="ui-kit-card__eyebrow">{eyebrow}</span> : null}
          <h3>{title}</h3>
        </div>
        {actions ? <div className="ui-kit-card__actions">{actions}</div> : null}
      </header>
      <div className="ui-kit-card__body">{children}</div>
      {footer ? <footer className="ui-kit-card__footer">{footer}</footer> : null}
    </article>
  )
}

/** A compact numeric fact always has a visible label and optional provenance. */
export function UiMetric({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
  tone?: CardTone
}) {
  return (
    <div className={`ui-kit-metric ui-kit-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  )
}

/** Use a definition list for facts; unknown values must be passed as explicit text. */
export function UiFacts({
  items,
}: {
  items: readonly { label: string; value: ReactNode; emphasis?: boolean }[]
}) {
  return (
    <dl className="ui-kit-facts">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd className={item.emphasis ? 'is-emphasis' : ''}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

type FieldBindings = { id: string; describedBy: string | undefined; invalid: boolean }

/**
 * Field owns the label, hint and validation relationship. The render function
 * passes id/aria-describedby/aria-invalid to the actual input, select or textarea;
 * keeping that relationship explicit avoids inaccessible form examples.
 */
export function UiField({
  label,
  hint,
  error,
  help,
  required = false,
  children,
  className = '',
}: {
  label: string
  hint?: string
  error?: string
  help?: ReactNode
  required?: boolean
  children: (bindings: FieldBindings) => ReactNode
  className?: string
}) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={`ui-kit-field ${className}`.trim()}>
      <div className="ui-kit-field__heading">
        <label htmlFor={id}>
          {label}
          {required ? <span aria-hidden="true">{'\u00a0*'}</span> : null}
        </label>
        {help ? <span className="ui-kit-field__help">{help}</span> : null}
      </div>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <small className="ui-kit-field__error" id={`${id}-error`}>
          {error}
        </small>
      ) : hint ? (
        <small id={`${id}-hint`}>{hint}</small>
      ) : null}
    </div>
  )
}

/**
 * Native check/radio behavior with a fixed control column. Keep choice inputs
 * outside Field: text fields stretch, while these controls must never inherit
 * the host application's generic input width or label grid layout.
 */
export function UiChoice({
  label,
  type,
  className = '',
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> & {
  type: 'checkbox' | 'radio'
  label: string
}) {
  return (
    <label className={`ui-kit-choice ${className}`.trim()}>
      <input {...props} type={type} />
      <span>{label}</span>
    </label>
  )
}

/** Native table semantics stay inside a scroll boundary on phones. */
export function UiTable({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`ui-kit-table-wrap ${className}`.trim()}>
      <table>{children}</table>
    </div>
  )
}

/** A measured progress value; the visible text never depends on color alone. */
export function UiProgress({
  label,
  value,
  tone = 'accent',
}: {
  label: string
  value: number
  tone?: CardTone
}) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={`ui-kit-progress ui-kit-progress--${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{normalized}%</strong>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalized}
        role="progressbar"
      >
        <span style={{ width: `${normalized}%` }} />
      </div>
    </div>
  )
}

/** Skeletons are visual only; pair them with a live status message from the caller. */
export function UiSkeleton({ lines = 3 }: { lines?: 1 | 2 | 3 | 4 }) {
  return (
    <div aria-hidden="true" className="ui-kit-skeleton">
      {Array.from({ length: lines }, (_, index) => (
        <i key={index} />
      ))}
    </div>
  )
}

/** An avatar carries initials only; the adjacent name remains visible text. */
export function UiAvatar({
  initials,
  tone = 'neutral',
}: {
  initials: string
  tone?: 'neutral' | 'accent' | 'success'
}) {
  return (
    <span aria-hidden="true" className={`ui-kit-avatar ui-kit-avatar--${tone}`}>
      {initials.slice(0, 2)}
    </span>
  )
}

/** File metadata and its remove action stay a single bounded, truncatable row. */
export function UiFile({
  name,
  detail,
  onRemove,
  removeLabel,
}: {
  name: string
  detail: string
  onRemove?: () => void
  removeLabel?: string
}) {
  return (
    <div className="ui-kit-file">
      <span className="ui-kit-file__mark">
        <UiIcon name="attach" />
      </span>
      <span>
        <strong>{name}</strong>
        <small>{detail}</small>
      </span>
      {onRemove ? (
        <button aria-label={removeLabel ?? `Remove ${name}`} onClick={onRemove} type="button">
          <UiIcon name="close" />
        </button>
      ) : null}
    </div>
  )
}

/** Native details works with mouse, keyboard and touch; the short label is never hidden. */
export function UiHelp({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="ui-kit-help">
      <summary>
        {label} <UiIcon name="info" />
      </summary>
      <div>{children}</div>
    </details>
  )
}

/** Audit history needs author, date and action as separate, inspectable facts. */
export function UiTimeline({
  items,
}: {
  items: readonly { id: string; at: string; dateTime: string; title: string; detail?: string }[]
}) {
  return (
    <ol className="ui-kit-timeline">
      {items.map((item) => (
        <li key={item.id}>
          <time dateTime={item.dateTime}>{item.at}</time>
          <div>
            <strong>{item.title}</strong>
            {item.detail ? <small>{item.detail}</small> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Page numbers are explicit; callers own data fetching and retain filter state. */
export function UiPagination({
  page,
  pageCount,
  onChange,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
}) {
  const last = Math.max(1, Math.floor(pageCount))
  const current = Math.max(1, Math.min(last, Math.floor(page)))
  return (
    <nav aria-label="List pages" className="ui-kit-pagination">
      <UiButton disabled={current <= 1} onClick={() => onChange(current - 1)}>
        ← Previous
      </UiButton>
      <span>
        Page {current} of {last}
      </span>
      <UiButton disabled={current >= last} onClick={() => onChange(current + 1)}>
        Next →
      </UiButton>
    </nav>
  )
}

/**
 * Modal behavior is shared: initial focus, Escape, focus containment and focus
 * restoration are handled here, leaving each caller responsible only for the
 * decision and its consequences. Dialog contents are inert demo data in the kit.
 */
export function UiDialog({
  open,
  title,
  description,
  children,
  actions,
  onClose,
  size = 'regular',
  className = '',
}: {
  open: boolean
  title: string
  description?: ReactNode
  children: ReactNode
  actions?: ReactNode
  onClose: () => void
  size?: 'regular' | 'wide' | 'image'
  className?: string
}) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogRef.current?.focus()
    return () => previous?.focus()
  }, [open])
  if (!open) return null
  return createPortal(
    <div
      className="ui-kit-surface ui-kit-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={`ui-kit-dialog ui-kit-dialog--${size} ${className}`.trim()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onClose()
            return
          }
          if (event.key !== 'Tab') return
          const focusable = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
            ),
          )
          if (focusable.length === 0) {
            event.preventDefault()
            return
          }
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          } else if (document.activeElement === event.currentTarget) {
            event.preventDefault()
            ;(event.shiftKey ? last : first).focus()
          }
        }}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header>
          <div><h2 id={titleId}>{title}</h2>{description ? <p>{description}</p> : null}</div>
          <button
            aria-label="Close"
            className="ui-kit-dialog__close"
            onClick={onClose}
            type="button"
          >
            <UiIcon name="close" />
          </button>
        </header>
        <div className="ui-kit-dialog__body">{children}</div>
        {actions ? <footer>{actions}</footer> : null}
      </div>
    </div>,
    document.body,
  )
}
