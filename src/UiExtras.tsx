import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'
import { UiBadge } from './Ui'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import type { BootstrapIconName } from './UiBootstrapIcon'
import './ui-extras.css'

export type UiBadgeOption = { value: string; label: string; tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }

/** A controlled status list keeps badge colors visible in both the value and the menu. */
export function UiBadgeSelect({ options, value, onChange, label = 'Status', disabled = false, className = '' }: { options: readonly UiBadgeOption[]; value: string; onChange: (value: string) => void; label?: string; disabled?: boolean; className?: string }) {
  const current = options.find(option => option.value === value)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const listId = useId()
  const [position, setPosition] = useState({ top: 0, left: 0, width: 150 })
  useEffect(() => {
    if (!open) return
    const place = () => { const rect = root.current?.getBoundingClientRect(); if (rect) { const height = panel.current?.offsetHeight ?? 120; setPosition({ top: rect.bottom + height + 8 <= window.innerHeight ? rect.bottom + 4 : Math.max(8, rect.top - height - 4), left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)), width: rect.width }) } }
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) setOpen(false) }
    place()
    document.addEventListener('pointerdown', close)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => { document.removeEventListener('pointerdown', close); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true) }
  }, [open])
  const choose = (next: string) => { onChange(next); setOpen(false); root.current?.querySelector('button')?.focus() }
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { setOpen(false); root.current?.querySelector('button')?.focus(); return }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) return
    if ((event.key === 'Enter' || event.key === ' ') && !open) { event.preventDefault(); setOpen(true); return }
    if (!open) { event.preventDefault(); setOpen(true); return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); const active = document.activeElement?.getAttribute('data-value'); if (active) choose(active); return }
    event.preventDefault()
    const buttons = [...(panel.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])]
    if (!buttons.length) return
    const index = buttons.findIndex(button => button === document.activeElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : index < 0 ? event.key === 'ArrowUp' ? buttons.length - 1 : 0 : (index + (event.key === 'ArrowUp' ? buttons.length - 1 : 1)) % buttons.length
    buttons[next]?.focus()
  }
  return <div className={`ui-kit-badge-select ${className}`.trim()} onKeyDown={keyDown} ref={root}><button aria-controls={listId} aria-expanded={open} aria-haspopup="listbox" aria-label={label} disabled={disabled} onClick={() => setOpen(current => !current)} type="button"><UiBadge tone={current?.tone || 'neutral'}>{current?.label || value}</UiBadge><UiBootstrapIcon name="chevron-down" /></button>{open && createPortal(<div aria-label={label} className="ui-kit-surface ui-kit-badge-select__menu" id={listId} ref={panel} role="listbox" style={{ position: 'fixed', top: position.top, left: position.left, minWidth: position.width, zIndex: 10000 }}>{options.map(option => <button aria-selected={option.value === value} data-value={option.value} key={option.value} onClick={() => choose(option.value)} role="option" type="button"><UiBadge tone={option.tone || 'neutral'}>{option.label}</UiBadge></button>)}</div>, document.body)}</div>
}

/** A single photo field accepts picker and drop, then lets the host persist or remove the File. */
export function UiPhotoUpload({ value, src, onChange, label = 'Photo', accept = 'image/*', disabled = false, className = '' }: { value?: File | null; src?: string; onChange: (file: File | null) => void; label?: string; accept?: string; disabled?: boolean; className?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(src)
  useEffect(() => { if (!value) { setPreview(src); return }; const url = URL.createObjectURL(value); setPreview(url); return () => URL.revokeObjectURL(url) }, [value, src])
  const choose = (file?: File) => { if (file?.type.startsWith('image/')) onChange(file) }
  const drop = (event: DragEvent) => { event.preventDefault(); setDragging(false); if (!disabled) choose(event.dataTransfer.files[0]) }
  return <div className={`ui-kit-photo-upload ${dragging ? 'is-dragging' : ''} ${className}`.trim()}><input accept={accept} aria-label={`Choose ${label.toLowerCase()}`} disabled={disabled} hidden onChange={(event: ChangeEvent<HTMLInputElement>) => { choose(event.target.files?.[0]); event.target.value = '' }} ref={input} type="file" /><div className="ui-kit-photo-upload__drop" onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={drop}>{preview ? <img alt={`${label} preview`} src={preview} /> : <UiBootstrapIcon name="image" size={25} />}<div><strong>{preview ? value?.name || label : `Add ${label.toLowerCase()}`}</strong><small>Drop an image here or choose a file</small></div><button disabled={disabled} onClick={() => input.current?.click()} type="button">{preview ? 'Replace' : 'Choose file'}</button></div>{preview && <button className="ui-kit-photo-upload__remove" disabled={disabled} onClick={() => onChange(null)} type="button"><UiBootstrapIcon name="trash" /> Remove photo</button>}</div>
}

/** Circular crop preview and PNG output stay local; the host handles upload and storage. */
export function UiAvatarUpload({ src, onChange, size = 160, className = '' }: { src?: string; onChange: (file: File | null) => void; size?: number; className?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const [source, setSource] = useState(src)
  const [zoom, setZoom] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  useEffect(() => setSource(src), [src])
  const choose = (file?: File) => { if (!file?.type.startsWith('image/')) return; const reader = new FileReader(); reader.onload = () => { setSource(String(reader.result)); setZoom(1); setOffsetX(0); setOffsetY(0) }; reader.readAsDataURL(file) }
  const crop = () => {
    const node = image.current
    if (!node || !node.naturalWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 256
    const context = canvas.getContext('2d')
    if (!context) return
    const scale = Math.max(size / node.naturalWidth, size / node.naturalHeight) * zoom
    const width = node.naturalWidth * scale, height = node.naturalHeight * scale
    context.scale(256 / size, 256 / size)
    context.beginPath(); context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); context.clip()
    context.drawImage(node, (size - width) / 2 + offsetX, (size - height) / 2 + offsetY, width, height)
    canvas.toBlob(blob => { if (blob) onChange(new File([blob], 'avatar.png', { type: 'image/png' })) }, 'image/png')
  }
  const scale = dimensions.width ? Math.max(size / dimensions.width, size / dimensions.height) * zoom : 1
  const imageStyle = dimensions.width ? { width: dimensions.width * scale, height: dimensions.height * scale, transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))` } : undefined
  return <div className={`ui-kit-avatar-upload ${className}`.trim()}><input accept="image/*" aria-label="Choose avatar image" hidden onChange={event => { choose(event.target.files?.[0]); event.target.value = '' }} ref={input} type="file" /><div className="ui-kit-avatar-upload__preview" style={{ width: size, height: size }}>{source ? <img alt="Avatar crop preview" onLoad={event => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} ref={image} src={source} style={imageStyle} /> : <UiBootstrapIcon name="person" size={48} />}</div><div className="ui-kit-avatar-upload__actions"><button onClick={() => input.current?.click()} type="button"><UiBootstrapIcon name="upload" /> Choose image</button>{source && <button onClick={() => { setSource(undefined); onChange(null) }} type="button"><UiBootstrapIcon name="trash" /> Remove</button>}</div>{source && <><label>Zoom<input max="3" min="1" onChange={event => setZoom(Number(event.target.value))} step="0.05" type="range" value={zoom} /></label><div className="ui-kit-avatar-upload__position"><label>Horizontal<input max="50" min="-50" onChange={event => setOffsetX(Number(event.target.value))} type="range" value={offsetX} /></label><label>Vertical<input max="50" min="-50" onChange={event => setOffsetY(Number(event.target.value))} type="range" value={offsetY} /></label></div><button className="ui-kit-avatar-upload__save" onClick={crop} type="button">Apply crop</button></>}</div>
}

export type UiNavItem = { id: string; label: string; href: string; icon?: BootstrapIconName; badge?: string }
/** Navigation is link-driven, so routing and active state remain application-owned. */
export function UiSidebarNav({ items, activeId, title = 'Workspace', className = '' }: { items: readonly UiNavItem[]; activeId?: string; title?: string; className?: string }) {
  return <nav aria-label={title} className={`ui-kit-sidebar-nav ${className}`.trim()}><strong>{title}</strong>{items.map(item => <a aria-current={item.id === activeId ? 'page' : undefined} href={item.href} key={item.id}>{item.icon && <UiBootstrapIcon name={item.icon} />}{item.label}{item.badge && <span>{item.badge}</span>}</a>)}</nav>
}
export function UiTopNav({ items, activeId, title = 'Main navigation', className = '' }: { items: readonly UiNavItem[]; activeId?: string; title?: string; className?: string }) {
  return <nav aria-label={title} className={`ui-kit-top-nav ${className}`.trim()}>{items.map(item => <a aria-current={item.id === activeId ? 'page' : undefined} href={item.href} key={item.id}>{item.icon && <UiBootstrapIcon name={item.icon} />}{item.label}{item.badge && <span>{item.badge}</span>}</a>)}</nav>
}
