import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentPropsWithRef, DetailedHTMLProps, DetailsHTMLAttributes, HTMLAttributes, MouseEvent, ReactNode, Ref } from 'react'
import { UiIcon } from './UiIcon'
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
  return <a className={`ui-kit-attachment-link ${className}`.trim()} {...props}><UiIcon name="attach" aria-hidden="true" /><span><strong>{label}</strong>{detail ? <small>{detail}</small> : null}</span></a>
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
  return <details className={`ui-kit-popover-menu ${className}`.trim()} ref={menuRef} {...props}>
    <summary aria-label={label} aria-disabled={disabled} title={label} onClick={event => { if (disabled) event.preventDefault(); else onSummaryClick?.(event) }} onKeyDown={event => { if (disabled && (event.key === 'Enter' || event.key === ' ')) event.preventDefault() }}>{icon}</summary>
    <div className="ui-kit-popover-menu__content">{children}</div>
  </details>
}

/** A compact composer aligns tools, multiline text and send action without styling application state. */
export function UiComposer({ className = '', ...props }: ComponentPropsWithRef<'form'>) {
  return <form className={`ui-kit-composer ${className}`.trim()} {...props} />
}

/** Neutral conversation canvas keeps message contrast stable across screens. */
export function UiConversationCanvas({ className = '', ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={`ui-kit-conversation-canvas ${className}`.trim()} {...props} />
}
