import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import type { BootstrapIconName } from './UiBootstrapIcon'
import './ui-information.css'

type InformationTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

/**
 * Clickable help is a disclosure, not a hover-only tooltip. Escape and an
 * outside pointer press close it; the trigger remains usable by keyboard.
 */
export function UiInfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLSpanElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])
  return <span className="ui-kit-info-tip" ref={root}>
    <button aria-controls={id} aria-expanded={open} aria-label={label} className="ui-kit-info-tip__trigger" onClick={() => setOpen(value => !value)} ref={trigger} type="button"><UiBootstrapIcon name="info-circle" /></button>
    {open ? <span className="ui-kit-info-tip__content" id={id} role="note">{children}</span> : null}
  </span>
}

/** A title, explanation and optional action stay together in dense ERP screens. */
export function UiCallout({ title, children, action, tone = 'accent', icon, className = '' }: {
  title: string
  children: ReactNode
  action?: ReactNode
  tone?: InformationTone
  icon?: BootstrapIconName
  className?: string
}) {
  const defaultIcons: Record<InformationTone, BootstrapIconName> = { neutral: 'info-circle', accent: 'info-circle', success: 'check-circle', warning: 'exclamation-triangle', danger: 'x-circle' }
  return <aside className={`ui-kit-callout ui-kit-callout--${tone} ${className}`.trim()}><UiBootstrapIcon name={icon ?? defaultIcons[tone]} /><div className="ui-kit-callout__content"><strong>{title}</strong><div>{children}</div>{action ? <div className="ui-kit-callout__action">{action}</div> : null}</div></aside>
}

/** A structured no-results state keeps the next action next to its explanation. */
export function UiEmptyState({ title, description, action, icon = 'inbox', className = '' }: {
  title: string
  description: ReactNode
  action?: ReactNode
  icon?: BootstrapIconName
  className?: string
}) {
  return <div className={`ui-kit-empty-state ${className}`.trim()}><UiBootstrapIcon name={icon} size={28}/><strong>{title}</strong><div>{description}</div>{action ? <div className="ui-kit-empty-state__action">{action}</div> : null}</div>
}

/** Section headings align a visible explanation with one or more actions. */
export function UiSectionHeading({ title, description, action, level = 2, className = '' }: {
  title: string
  description?: ReactNode
  action?: ReactNode
  level?: 2 | 3 | 4
  className?: string
}) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4'
  return <header className={`ui-kit-section-heading ${className}`.trim()}><div><Heading>{title}</Heading>{description ? <p>{description}</p> : null}</div>{action ? <div className="ui-kit-section-heading__action">{action}</div> : null}</header>
}
