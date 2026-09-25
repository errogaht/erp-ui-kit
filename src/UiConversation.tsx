import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentPropsWithRef, DetailedHTMLProps, DetailsHTMLAttributes, HTMLAttributes, MouseEvent, ReactNode, Ref } from 'react'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import { UiSelect } from './UiControls'
import './ui-conversation.css'

/** A disclosure keeps its native keyboard behavior while the kit owns the compact header. */
export function UiDisclosure({ label, count, children, className = '', ...props }: DetailedHTMLProps<DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement> & { label: ReactNode; count?: number; children: ReactNode }) {
  return <details className={`ui-kit-disclosure ${className}`.trim()} {...props}><summary><span>{label}</span>{count ? <b>{count}</b> : null}</summary><div className="ui-kit-disclosure__body">{children}</div></details>
}

/** Quoted message content remains caller-owned; shared boundaries make replies legible in every messenger view. */
export function UiQuote({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <blockquote className={`ui-kit-quote ${className}`.trim()}><small>{label}</small><span>{children}</span></blockquote>
}

/** Attachment navigation is a link; the caller still owns the authenticated URL and file kind. */
export function UiAttachmentLink({ label, detail, className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; label: string; detail?: string }) {
  return <a className={`ui-kit-attachment-link ${className}`.trim()} {...props}><UiBootstrapIcon name="paperclip" /><span><strong>{label}</strong>{detail ? <small>{detail}</small> : null}</span></a>
}

/** Icon-only controls share one focus target; title and accessible name are always required. */
export function UiIconButton({ label, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button aria-label={label} title={label} className={`ui-kit-icon-button ${className}`.trim()} type="button" {...props}>{children}</button>
}

/** Selectable setup options behave like buttons, with a shared card treatment. */
export function UiActionTile({ title, detail, tone = 'neutral', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { title: string; detail: string; tone?: 'neutral' | 'telegram' | 'whatsapp' }) {
  return <button className={`ui-kit-action-tile ui-kit-action-tile--${tone} ${className}`.trim()} type="button" {...props}><strong>{title}</strong><span>{detail}</span></button>
}

/** A compact status line pairs a visible title with optional supporting detail. */
export function UiStatusLine({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-kit-status-line ${className}`.trim()} {...props}>{children}</div>
}

/** Message images use one thumbnail treatment; the caller decides how the full-size viewer opens. */
export function UiImagePreview({ src, alt, onClick, className = '' }: { src: string; alt: string; onClick: () => void; className?: string }) {
  return <button className={`ui-kit-image-preview ${className}`.trim()} type="button" onClick={onClick} aria-label={alt}><img src={src} alt="" loading="lazy" /></button>
}

/** Read-only line items have stable quantity and amount columns at every width. */
export function UiLineItem({ title, detail, quantity, amount, className = '' }: { title: ReactNode; detail?: ReactNode; quantity: ReactNode; amount: ReactNode; className?: string }) {
  return <article className={`ui-kit-line-item ${className}`.trim()}><div className="ui-kit-line-item__main">{title}{detail ? <small>{detail}</small> : null}</div><span>{quantity}</span><strong>{amount}</strong></article>
}

/** Native details menu keeps keyboard disclosure and caller-owned popover contents. */
export function UiPopoverMenu({ label, icon, children, menuRef, disabled = false, onSummaryClick, className = '', ...props }: DetailedHTMLProps<DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement> & { label: string; icon: ReactNode; children: ReactNode; menuRef?: Ref<HTMLDetailsElement>; disabled?: boolean; onSummaryClick?: (event: MouseEvent<HTMLElement>) => void }) {
  const summaryRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  // A body portal escapes clipped chat columns; viewport coordinates keep it attached while scrolling.
  useEffect(() => {
    if (!open) return
    const place = () => {
      const rect = summaryRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = Math.max(190, panelRef.current?.offsetWidth ?? 190)
      const height = panelRef.current?.offsetHeight ?? 80
      const fitsAbove = rect.top - height - 5 >= 8
      const fitsBelow = rect.bottom + height + 8 <= window.innerHeight
      const workspace = summaryRef.current?.closest('.ui-kit-composer')?.parentElement?.getBoundingClientRect()
      // Keep composer menus within their conversation column when it can contain the menu.
      const minLeft = workspace && workspace.width >= width + 16 ? Math.max(8, workspace.left + 8) : 8
      const maxLeft = workspace && workspace.width >= width + 16
        ? Math.min(window.innerWidth - width - 8, workspace.right - width - 8)
        : window.innerWidth - width - 8
      // Composer menus belong inside the workspace above its bottom edge; header menus can open below.
      const above = fitsAbove && (Boolean(summaryRef.current?.closest('.ui-kit-composer')) || !fitsBelow)
      setPosition({
        left: Math.max(minLeft, Math.min(rect.right - width, maxLeft)),
        top: above ? rect.top - height - 5 : Math.max(8, Math.min(rect.bottom + 5, window.innerHeight - height - 8)),
      })
    }
    const closeOutside = (event: PointerEvent) => { if (!summaryRef.current?.contains(event.target as Node) && !panelRef.current?.contains(event.target as Node)) setOpen(false) }
    const closeOnFocusAway = (event: FocusEvent) => { if (!summaryRef.current?.contains(event.target as Node) && !panelRef.current?.contains(event.target as Node)) setOpen(false) }
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); summaryRef.current?.focus() } }
    place()
    // Portaled actions are outside the details tree; focus them explicitly for keyboard users.
    panelRef.current?.querySelector<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('focusin', closeOnFocusAway)
    document.addEventListener('keydown', closeEscape)
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('focusin', closeOnFocusAway); document.removeEventListener('keydown', closeEscape) }
  }, [open])
  return <details className={`ui-kit-popover-menu ${className}`.trim()} ref={menuRef} {...props} open={open}>
    <summary aria-label={label} aria-disabled={disabled} aria-expanded={open} title={label} ref={summaryRef} onClick={event => { event.preventDefault(); if (!disabled) { setOpen(value => !value); onSummaryClick?.(event) } }} onKeyDown={event => { if (disabled && (event.key === 'Enter' || event.key === ' ')) event.preventDefault() }}>{icon}</summary>
    {open && createPortal(<div className="ui-kit-surface ui-kit-popover-menu__content" onClick={event => { if ((event.target as HTMLElement).closest('button,a')) { setOpen(false); summaryRef.current?.focus() } }} ref={panelRef} style={{ position: 'fixed', top: position.top, left: position.left, right: 'auto', bottom: 'auto', zIndex: 10000 }}>{children}</div>, document.body)}
  </details>
}

/** Controlled delivery options for a composer; the host decides which channels exist and how flags affect sending. */
export function UiReplySettings({ channels, channel, onChannelChange, options = [], onOptionChange, className = '' }: {
  channels: readonly { value: string; label: string }[]
  channel: string
  onChannelChange: (value: string) => void
  options?: readonly { id: string; label: string; checked: boolean }[]
  onOptionChange?: (id: string, checked: boolean) => void
  className?: string
}) {
  return <div className={`ui-kit-reply-settings ${className}`.trim()}><strong>Reply settings</strong><label>Send via<UiSelect aria-label="Send via" onChange={event => onChannelChange(event.target.value)} value={channel}>{channels.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</UiSelect></label>{options.map(option => <label className="ui-kit-reply-settings__check" key={option.id}><input checked={option.checked} onChange={event => onOptionChange?.(option.id, event.target.checked)} type="checkbox" />{option.label}</label>)}</div>
}

/** A compact composer aligns tools, multiline text and send action without styling application state. */
export function UiComposer({ className = '', ...props }: ComponentPropsWithRef<'form'>) {
  return <form className={`ui-kit-composer ${className}`.trim()} {...props} />
}

/** Neutral conversation canvas keeps message contrast stable across screens. */
export function UiConversationCanvas({ className = '', ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={`ui-kit-conversation-canvas ${className}`.trim()} {...props} />
}
