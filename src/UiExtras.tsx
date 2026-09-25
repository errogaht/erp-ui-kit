import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ChangeEvent, DragEvent, KeyboardEvent, PointerEvent as ReactPointerEvent, SyntheticEvent } from 'react'
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
    const place = () => {
      const rect = root.current?.getBoundingClientRect()
      if (!rect) return
      const height = panel.current?.offsetHeight ?? 120
      // A full-width field must not turn five short status choices into a very wide empty menu.
      const width = Math.min(rect.width, 260)
      setPosition({
        top: rect.bottom + height + 8 <= window.innerHeight ? rect.bottom + 4 : Math.max(8, rect.top - height - 4),
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        width,
      })
    }
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) setOpen(false) }
    const closeOnFocusAway = (event: FocusEvent) => { if (!root.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) setOpen(false) }
    place()
    // The menu is portaled, so transfer focus into it and close when focus leaves both trees.
    ;(panel.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]') ?? panel.current?.querySelector<HTMLButtonElement>('[role="option"]'))?.focus()
    document.addEventListener('pointerdown', close)
    document.addEventListener('focusin', closeOnFocusAway)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('focusin', closeOnFocusAway); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true) }
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
  return <div className={`ui-kit-badge-select ${className}`.trim()} onKeyDown={keyDown} ref={root}><button aria-controls={listId} aria-expanded={open} aria-haspopup="listbox" aria-label={label} disabled={disabled} onClick={() => setOpen(current => !current)} type="button"><UiBadge tone={current?.tone || 'neutral'}>{current?.label || value}</UiBadge><UiBootstrapIcon name="chevron-down" /></button>{open && createPortal(<div aria-label={label} className="ui-kit-surface ui-kit-badge-select__menu" id={listId} onKeyDown={keyDown} ref={panel} role="listbox" style={{ position: 'fixed', top: position.top, left: position.left, minWidth: position.width, zIndex: 10000 }}>{options.map(option => <button aria-selected={option.value === value} data-value={option.value} key={option.value} onClick={() => choose(option.value)} role="option" type="button"><UiBadge tone={option.tone || 'neutral'}>{option.label}</UiBadge></button>)}</div>, document.body)}</div>
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

type CropCircle = { centerX: number; centerY: number; diameter: number }
type ImageFrame = { left: number; top: number; width: number; height: number; scale: number }
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * An image-space circle keeps the visible selection and exported PNG aligned.
 * Pointer coordinates are converted through the fitted image frame, so touch,
 * mouse and responsive resizing all crop the same source pixels.
 */
export function UiAvatarUpload({ src, onChange, size = 160, className = '' }: { src?: string; onChange: (file: File | null) => void; size?: number; className?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const drag = useRef<{ mode: 'move' | 'resize'; pointerX: number; pointerY: number; start: CropCircle } | null>(null)
  const [source, setSource] = useState(src)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [stageSize, setStageSize] = useState({ width: 320, height: 240 })
  const [circle, setCircle] = useState<CropCircle>({ centerX: .5, centerY: .5, diameter: .7 })
  const [error, setError] = useState('')
  useEffect(() => { setSource(src); setError('') }, [src])
  useEffect(() => {
    if (!stage.current) return
    const observer = new ResizeObserver(([entry]) => setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(stage.current)
    return () => observer.disconnect()
  }, [])
  const scale = dimensions.width && dimensions.height ? Math.min(stageSize.width / dimensions.width, stageSize.height / dimensions.height) : 0
  const frame: ImageFrame = { width: dimensions.width * scale, height: dimensions.height * scale, left: (stageSize.width - dimensions.width * scale) / 2, top: (stageSize.height - dimensions.height * scale) / 2, scale }
  const smallest = Math.min(frame.width, frame.height)
  const diameter = circle.diameter * smallest
  const centerX = frame.left + circle.centerX * frame.width
  const centerY = frame.top + circle.centerY * frame.height
  const cropLeft = centerX - diameter / 2
  const cropTop = centerY - diameter / 2
  const minimum = Math.min(48, smallest * .35)
  const placeCircle = (next: CropCircle) => {
    const nextDiameter = clamp(next.diameter * smallest, minimum, smallest)
    const radius = nextDiameter / 2
    setCircle({ centerX: clamp(next.centerX, radius / frame.width, 1 - radius / frame.width), centerY: clamp(next.centerY, radius / frame.height, 1 - radius / frame.height), diameter: nextDiameter / smallest })
  }
  const choose = (file?: File) => {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => { setSource(String(reader.result)); setDimensions({ width: 0, height: 0 }); setError('') }
    reader.readAsDataURL(file)
  }
  const imageLoaded = (event: SyntheticEvent<HTMLImageElement>) => {
    const node = event.currentTarget
    const width = node.naturalWidth, height = node.naturalHeight
    setDimensions({ width, height })
    const fitted = Math.min(stageSize.width / width, stageSize.height / height) * Math.min(width, height)
    setCircle({ centerX: .5, centerY: .5, diameter: Math.min(size, fitted * .72) / fitted })
  }
  const startDrag = (event: ReactPointerEvent<HTMLElement>, mode: 'move' | 'resize') => {
    event.preventDefault()
    event.stopPropagation()
    if (!smallest) return
    drag.current = { mode, pointerX: event.clientX, pointerY: event.clientY, start: circle }
    stage.current?.setPointerCapture(event.pointerId)
  }
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || !smallest) return
    const dx = event.clientX - drag.current.pointerX, dy = event.clientY - drag.current.pointerY
    const original = drag.current.start
    if (drag.current.mode === 'move') {
      placeCircle({ ...original, centerX: original.centerX + dx / frame.width, centerY: original.centerY + dy / frame.height })
      return
    }
    const originalX = frame.left + original.centerX * frame.width
    const originalY = frame.top + original.centerY * frame.height
    const pointerX = drag.current.pointerX + dx - stage.current!.getBoundingClientRect().left
    const pointerY = drag.current.pointerY + dy - stage.current!.getBoundingClientRect().top
    const wanted = 2 * Math.hypot(pointerX - originalX, pointerY - originalY)
    const max = 2 * Math.min(originalX - frame.left, frame.left + frame.width - originalX, originalY - frame.top, frame.top + frame.height - originalY)
    placeCircle({ ...original, diameter: clamp(wanted, minimum, max) / smallest })
  }
  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => { drag.current = null; if (stage.current?.hasPointerCapture(event.pointerId)) stage.current.releasePointerCapture(event.pointerId) }
  const moveWithKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || !smallest) return
    event.preventDefault()
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
    if (event.target instanceof HTMLButtonElement) placeCircle({ ...circle, diameter: circle.diameter + direction * 8 / smallest })
    else placeCircle({ ...circle, centerX: circle.centerX + (event.key.includes('Left') || event.key.includes('Right') ? direction * 8 / frame.width : 0), centerY: circle.centerY + (event.key.includes('Up') || event.key.includes('Down') ? direction * 8 / frame.height : 0) })
  }
  const crop = () => {
    const node = image.current
    if (!node || !frame.scale || !diameter) return
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 256
    const context = canvas.getContext('2d')
    if (!context) return
    const sourceX = (cropLeft - frame.left) / frame.scale
    const sourceY = (cropTop - frame.top) / frame.scale
    const sourceSize = diameter / frame.scale
    context.beginPath(); context.arc(128, 128, 128, 0, Math.PI * 2); context.clip()
    try {
      context.drawImage(node, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 256, 256)
      canvas.toBlob(blob => { if (blob) onChange(new File([blob], 'avatar.png', { type: 'image/png' })); else setError('Could not create the cropped image.') }, 'image/png')
    } catch { setError('This image cannot be cropped here. Choose a local file.') }
  }
  const previewScale = diameter ? 72 / diameter : 1
  return <div className={`ui-kit-avatar-upload ${className}`.trim()}>
    <input accept="image/*" aria-label="Choose avatar image" hidden onChange={event => { choose(event.target.files?.[0]); event.target.value = '' }} ref={input} type="file" />
    <div className="ui-kit-avatar-upload__stage" onPointerCancel={stopDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} ref={stage}>
      {source ? <><img alt="Image to crop" className="ui-kit-avatar-upload__image" onLoad={imageLoaded} ref={image} src={source} style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }} />{smallest > 0 && <div aria-label="Move crop circle with arrow keys" className="ui-kit-avatar-upload__circle" onKeyDown={moveWithKeys} onPointerDown={event => startDrag(event, 'move')} role="group" style={{ left: cropLeft, top: cropTop, width: diameter, height: diameter }} tabIndex={0}><span aria-hidden="true" className="ui-kit-avatar-upload__crosshair" /><button aria-label="Resize crop circle with arrow keys or drag" className="ui-kit-avatar-upload__resize" onPointerDown={event => startDrag(event, 'resize')} title="Drag to resize" type="button"><UiBootstrapIcon name="arrows-angle-expand" /></button></div>}</> : <div className="ui-kit-avatar-upload__empty"><UiBootstrapIcon name="person-circle" size={38} /><span>Choose an image to crop</span></div>}
    </div>
    {source && smallest > 0 && <div className="ui-kit-avatar-upload__preview-row"><span className="ui-kit-avatar-upload__result" role="img" aria-label="Avatar preview"><img alt="" src={source} style={{ width: frame.width * previewScale, height: frame.height * previewScale, left: -(cropLeft - frame.left) * previewScale, top: -(cropTop - frame.top) * previewScale }} /></span><p>Drag the circle to position it. Drag its corner to resize. Arrow keys also work.</p></div>}
    <div className="ui-kit-avatar-upload__actions"><button onClick={() => input.current?.click()} type="button"><UiBootstrapIcon name="upload" /> Choose image</button>{source && <><button onClick={crop} type="button" className="ui-kit-avatar-upload__save">Apply crop</button><button onClick={() => { setSource(undefined); setDimensions({ width: 0, height: 0 }); onChange(null) }} type="button"><UiBootstrapIcon name="trash" /> Remove</button></>}</div>
    {error && <small className="ui-kit-avatar-upload__error" role="alert">{error}</small>}
  </div>
}

export type UiNavItem = { id: string; label: string; href: string; icon?: BootstrapIconName; badge?: string }
/** Navigation is link-driven, so routing and active state remain application-owned. */
export function UiSidebarNav({ items, activeId, title = 'Workspace', className = '' }: { items: readonly UiNavItem[]; activeId?: string; title?: string; className?: string }) {
  return <nav aria-label={title} className={`ui-kit-sidebar-nav ${className}`.trim()}><strong>{title}</strong>{items.map(item => <a aria-current={item.id === activeId ? 'page' : undefined} href={item.href} key={item.id}>{item.icon && <UiBootstrapIcon name={item.icon} />}{item.label}{item.badge && <span>{item.badge}</span>}</a>)}</nav>
}
export function UiTopNav({ items, activeId, title = 'Main navigation', className = '' }: { items: readonly UiNavItem[]; activeId?: string; title?: string; className?: string }) {
  return <nav aria-label={title} className={`ui-kit-top-nav ${className}`.trim()}>{items.map(item => <a aria-current={item.id === activeId ? 'page' : undefined} href={item.href} key={item.id}>{item.icon && <UiBootstrapIcon name={item.icon} />}{item.label}{item.badge && <span>{item.badge}</span>}</a>)}</nav>
}
