import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import './ui-workspace.css'

import { DocumentActivity, useUiDocumentActive } from './document-activity'
export { useUiDocumentActive } from './document-activity'

export type UiWorkspaceTab = {
  id: string
  label: string
  icon?: ReactNode
  dirty?: boolean
  closable?: boolean
  badge?: ReactNode
}
/** Controlled document identity; onClose is a request, not a deletion. The host
 * can show a save/discard dialog and update items only after that decision.
 * All panels stay mounted. Do not put route-dependent state outside their keys. */
export function UiWorkspaceTabs({
  label = 'Open documents',
  items,
  value,
  onChange,
  onClose,
  renderPanel,
  empty = 'No documents open.',
  actions,
  className = '',
}: {
  label?: string
  items: readonly UiWorkspaceTab[]
  value?: string
  onChange: (id: string) => void
  onClose?: (id: string) => void
  renderPanel: (id: string, active: boolean) => ReactNode
  empty?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  const parentActive = useUiDocumentActive()
  const base = useId()
  const root = useRef<HTMLDivElement>(null)
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const active = items.find((item) => item.id === value)?.id ?? items[0]?.id
  const pendingFocus = useRef<string | null>(null)
  const previousIds = useRef(items.map((item) => item.id))
  useEffect(() => {
    const button = buttons.current.get(active ?? '')
    const list = root.current?.querySelector<HTMLElement>('[role="tablist"]')
    // Scroll only the tab strip, never jump the surrounding catalog/page.
    if (button && list) {
      const tabRect = button.getBoundingClientRect(),
        listRect = list.getBoundingClientRect()
      if (tabRect.left < listRect.left) list.scrollLeft -= listRect.left - tabRect.left
      else if (tabRect.right > listRect.right) list.scrollLeft += tabRect.right - listRect.right
    }
    // A host may close asynchronously (save/discard). Restore focus only after
    // that document actually disappears; denied close requests keep focus.
    const removed = previousIds.current.some((id) => !items.some((item) => item.id === id))
    if (removed && pendingFocus.current && !items.some((item) => item.id === pendingFocus.current)) {
      const target = buttons.current.get(active ?? '') ?? root.current
      target?.focus()
      pendingFocus.current = null
    }
    previousIds.current = items.map((item) => item.id)
  }, [active, items])
  const requestClose = (item: UiWorkspaceTab) => {
    if (!onClose || item.closable === false) return
    pendingFocus.current = item.id
    onClose(item.id)
  }
  const keyDown = (event: KeyboardEvent, index: number) => {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % items.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    else if (event.key === 'Delete') {
      event.preventDefault()
      requestClose(items[index])
      return
    } else return
    event.preventDefault()
    onChange(items[next].id)
    buttons.current.get(items[next].id)?.focus()
  }
  return (
    <div className={`ui-kit-workspace-tabs ${className}`} ref={root} tabIndex={-1} aria-label={label}>
      <div className="ui-kit-workspace-tabs__bar">
        <div role="tablist" aria-label={label} className="ui-kit-workspace-tabs__list">
          {items.map((item, index) => (
            <div
              role="presentation"
              className={`ui-kit-workspace-tabs__item ${active === item.id ? 'is-active' : ''}`}
              key={item.id}
            >
              <button
                type="button"
                role="tab"
                id={`${base}-tab-${encodeURIComponent(item.id)}`}
                aria-controls={`${base}-panel-${encodeURIComponent(item.id)}`}
                aria-selected={active === item.id}
                tabIndex={active === item.id ? 0 : -1}
                onClick={() => onChange(item.id)}
                onKeyDown={(event) => keyDown(event, index)}
                ref={(node) => {
                  if (node) buttons.current.set(item.id, node)
                  else buttons.current.delete(item.id)
                }}
                title={item.label}
              >
                {item.icon}
                <span className="ui-kit-workspace-tabs__label">{item.label}</span>
                {item.badge}
                {item.dirty && (
                  <span className="ui-kit-workspace-tabs__dirty" aria-label="Unsaved changes">
                    ●
                  </span>
                )}
              </button>
              {onClose && item.closable !== false && (
                <button
                  type="button"
                  className="ui-kit-workspace-tabs__close"
                  aria-label={`Close ${item.label}`}
                  tabIndex={active === item.id ? 0 : -1}
                  onClick={() => requestClose(item)}
                >
                  <UiBootstrapIcon name="x" />
                </button>
              )}
            </div>
          ))}
        </div>
        {actions && <div className="ui-kit-workspace-tabs__actions">{actions}</div>}
      </div>
      <div className="ui-kit-workspace-tabs__panels">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              role="tabpanel"
              id={`${base}-panel-${encodeURIComponent(item.id)}`}
              aria-labelledby={`${base}-tab-${encodeURIComponent(item.id)}`}
              hidden={item.id !== active}
              inert={item.id !== active}
              tabIndex={0}
              className="ui-kit-workspace-tabs__panel"
            >
              <DocumentActivity.Provider value={parentActive && item.id === active}>
                {renderPanel(item.id, parentActive && item.id === active)}
              </DocumentActivity.Provider>
            </div>
          ))
        ) : (
          <div className="ui-kit-workspace-tabs__empty">{empty}</div>
        )}
      </div>
    </div>
  )
}

/** A percentage split stays bounded to its container, including when embedded
 * in another split. Pointer capture owns one gesture; arrows/Home/End expose
 * the same bounds without a mouse. Layout persistence belongs to the host. */
export function UiResizableSplit({
  label,
  first,
  second,
  value,
  onChange,
  min = 15,
  max = 75,
  direction = 'horizontal',
  stackOnNarrow = true,
  className = '',
}: {
  label: string
  first: ReactNode
  second: ReactNode
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  direction?: 'horizontal' | 'vertical'
  stackOnNarrow?: boolean
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const drag = useRef<{ pointer: number; start: number; value: number; extent: number } | null>(null)
  const firstId = useId()
  const lower = Math.max(0, Math.min(100, min)),
    upper = Math.max(lower, Math.min(100, max))
  const clamp = (next: number) => Math.max(lower, Math.min(upper, Number.isFinite(next) ? next : lower))
  const size = clamp(value)
  const horizontal = direction === 'horizontal'
  return (
    <div
      ref={root}
      className={`ui-kit-resizable ui-kit-resizable--${direction} ${stackOnNarrow && direction === 'horizontal' ? 'ui-kit-resizable--responsive' : ''} ${className}`}
      style={{ '--ui-kit-split-size': `${size}%` } as CSSProperties}
    >
      <div id={firstId} className="ui-kit-resizable__pane">
        {first}
      </div>
      <div
        className="ui-kit-resizable__handle"
        role="separator"
        aria-label={label}
        aria-controls={firstId}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuemin={lower}
        aria-valuemax={upper}
        aria-valuenow={size}
        aria-valuetext={`${Math.round(size)} percent`}
        tabIndex={0}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          const rect = root.current!.getBoundingClientRect()
          event.preventDefault()
          event.currentTarget.focus()
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = {
            pointer: event.pointerId,
            start: horizontal ? event.clientX : event.clientY,
            value: size,
            extent: horizontal ? rect.width : rect.height,
          }
        }}
        onPointerMove={(event) => {
          const d = drag.current
          if (d && d.pointer === event.pointerId && d.extent > 0)
            onChange(
              clamp(d.value + (((horizontal ? event.clientX : event.clientY) - d.start) / d.extent) * 100),
            )
        }}
        onPointerUp={(event) => {
          drag.current = null
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onLostPointerCapture={() => {
          drag.current = null
        }}
        onKeyDown={(event) => {
          const decrease = horizontal ? 'ArrowLeft' : 'ArrowUp',
            increase = horizontal ? 'ArrowRight' : 'ArrowDown'
          if (![decrease, increase, 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          onChange(
            clamp(
              event.key === 'Home'
                ? lower
                : event.key === 'End'
                  ? upper
                  : size + (event.key === decrease ? -1 : 1) * (event.shiftKey ? 10 : 2),
            ),
          )
        }}
      />
      <div className="ui-kit-resizable__pane">{second}</div>
    </div>
  )
}

export type UiTreeNode = {
  id: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
  children?: readonly UiTreeNode[]
  disabled?: boolean
}
/** Single-selection tree implements the visible-node keyboard model, including
 * parent/child arrows and typeahead. Expansion is controlled; selection never
 * executes navigation unless the consumer handles onSelect. IDs must be unique. */
export function UiTree({
  label,
  nodes,
  value,
  expanded,
  onExpandedChange,
  onSelect,
  empty = 'No items.',
}: {
  label: string
  nodes: readonly UiTreeNode[]
  value?: string
  expanded: readonly string[]
  onExpandedChange: (ids: string[]) => void
  onSelect: (id: string) => void
  empty?: ReactNode
}) {
  const root = useRef<HTMLUListElement>(null)
  const [focused, setFocused] = useState<string | undefined>(value)
  const typeahead = useRef({ value: '', at: 0 })
  const visible: { node: UiTreeNode; parent?: string }[] = []
  const flatten = (items: readonly UiTreeNode[], parent?: string) => {
    for (const node of items) {
      visible.push({ node, parent })
      if (expanded.includes(node.id) && node.children) flatten(node.children, node.id)
    }
  }
  flatten(nodes)
  const focusId = visible.some((item) => item.node.id === focused)
    ? focused
    : (visible.find((item) => item.node.id === value)?.node.id ?? visible[0]?.node.id)
  const toggle = (id: string, open: boolean) =>
    onExpandedChange(open ? [...new Set([...expanded, id])] : expanded.filter((item) => item !== id))
  const focus = (id?: string) => {
    if (!id) return
    setFocused(id)
    root.current?.querySelectorAll<HTMLElement>('[role="treeitem"]').forEach((node) => {
      if (node.dataset.treeId === id) node.focus()
    })
  }
  const keyDown = (event: KeyboardEvent, node: UiTreeNode) => {
    const index = visible.findIndex((item) => item.node.id === node.id)
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key))
      event.preventDefault()
    if (event.key === 'ArrowDown') focus(visible[Math.min(index + 1, visible.length - 1)]?.node.id)
    else if (event.key === 'ArrowUp') focus(visible[Math.max(index - 1, 0)]?.node.id)
    else if (event.key === 'Home') focus(visible[0]?.node.id)
    else if (event.key === 'End') focus(visible.at(-1)?.node.id)
    else if (event.key === 'ArrowRight' && node.children?.length) {
      if (!expanded.includes(node.id)) toggle(node.id, true)
      else focus(node.children[0].id)
    } else if (event.key === 'ArrowLeft') {
      if (node.children?.length && expanded.includes(node.id)) toggle(node.id, false)
      else focus(visible[index]?.parent)
    } else if ((event.key === 'Enter' || event.key === ' ') && !node.disabled) onSelect(node.id)
    else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      event.key !== ' '
    ) {
      const now = Date.now()
      typeahead.current = {
        value: (now - typeahead.current.at < 600 ? typeahead.current.value : '') + event.key.toLowerCase(),
        at: now,
      }
      const ordered = [...visible.slice(index + 1), ...visible.slice(0, index + 1)]
      focus(
        ordered.find((item) => item.node.label.toLowerCase().startsWith(typeahead.current.value))?.node.id,
      )
    }
  }
  const render = (items: readonly UiTreeNode[], level: number): ReactNode =>
    items.map((node) => (
      <li role="none" key={node.id}>
        <div
          role="treeitem"
          aria-label={node.label}
          aria-level={level}
          aria-selected={value === node.id}
          aria-disabled={node.disabled || undefined}
          aria-expanded={node.children?.length ? expanded.includes(node.id) : undefined}
          data-tree-id={node.id}
          tabIndex={focusId === node.id ? 0 : -1}
          onFocus={(event) => {
            if (event.target === event.currentTarget) setFocused(node.id)
          }}
          onKeyDown={(event) => {
            event.stopPropagation()
            keyDown(event, node)
          }}
          onClick={(event) => {
            event.stopPropagation()
            focus(node.id)
            if (!node.disabled) onSelect(node.id)
          }}
          className="ui-kit-tree__item"
          style={{ '--ui-kit-tree-depth': level - 1 } as CSSProperties}
        >
          <span
            className="ui-kit-tree__toggle"
            aria-hidden="true"
            onClick={(event) => {
              event.stopPropagation()
              focus(node.id)
              if (node.children?.length) toggle(node.id, !expanded.includes(node.id))
            }}
          >
            {node.children?.length ? (
              <UiBootstrapIcon name={expanded.includes(node.id) ? 'chevron-down' : 'chevron-right'} />
            ) : null}
          </span>
          {node.icon}
          <span className="ui-kit-tree__label" title={node.label}>
            {node.label}
          </span>
          {node.badge}
          {node.children?.length && expanded.includes(node.id) ? (
            <ul role="group">{render(node.children, level + 1)}</ul>
          ) : null}
        </div>
      </li>
    ))
  return nodes.length ? (
    <ul ref={root} role="tree" aria-label={label} className="ui-kit-tree">
      {render(nodes, 1)}
    </ul>
  ) : (
    <p className="ui-kit-tree__empty">{empty}</p>
  )
}

/** Semantic path navigation uses native links; applications supply routing adapters as labels if needed. */
export function UiBreadcrumbs({
  items,
  label = 'Breadcrumbs',
}: {
  items: readonly { id: string; label: ReactNode; href?: string }[]
  label?: string
}) {
  return (
    <nav aria-label={label} className="ui-kit-breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            {index > 0 && <UiBootstrapIcon name="chevron-right" />}
            {item.href && index < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Layout slots only: navigation, dock visibility and persistence remain host-owned.
 * At small container widths the auxiliary panels stack so no content is lost. */
export function UiWorkspace({
  title,
  navigation,
  explorer,
  children,
  inspector,
  dock,
  status,
  className = '',
}: {
  title: ReactNode
  navigation?: ReactNode
  explorer?: ReactNode
  children: ReactNode
  inspector?: ReactNode
  dock?: ReactNode
  status?: ReactNode
  className?: string
}) {
  return (
    <section className={`ui-kit-workspace ${className}`}>
      <header className="ui-kit-workspace__header">{title}</header>
      <div className="ui-kit-workspace__body">
        {navigation && <div className="ui-kit-workspace__navigation">{navigation}</div>}
        {explorer && (
          <aside aria-label="Explorer" className="ui-kit-workspace__explorer">
            {explorer}
          </aside>
        )}
        <div className="ui-kit-workspace__center">
          {children}
          {dock && (
            <section aria-label="Tool panel" className="ui-kit-workspace__dock">
              {dock}
            </section>
          )}
        </div>
        {inspector && (
          <aside aria-label="Inspector" className="ui-kit-workspace__inspector">
            {inspector}
          </aside>
        )}
      </div>
      {status && <footer className="ui-kit-workspace__status">{status}</footer>}
    </section>
  )
}
