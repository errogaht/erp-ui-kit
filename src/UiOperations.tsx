import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { UiBadge, UiButton, UiDialog } from './Ui'
import { UiInput, UiSelect } from './UiControls'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import './ui-operations.css'

export type UiCommandItem = {
  id: string
  label: string
  description?: string
  group?: string
  shortcut?: string
  icon?: ReactNode
  disabled?: boolean
}
/** Controlled search results support local commands or server search. No global
 * shortcut is registered. The caller owns filtering/loading and opens the
 * palette explicitly; selection fires once and lets the caller navigate/close. */
export function UiCommandPalette({
  open,
  onClose,
  query,
  onQueryChange,
  items,
  onSelect,
  loading = false,
  error,
  title = 'Search workspace',
  placeholder = 'Search records or actions…',
  filters,
  empty = 'No matching results.',
}: {
  open: boolean
  onClose: () => void
  query: string
  onQueryChange: (query: string) => void
  items: readonly UiCommandItem[]
  onSelect: (id: string) => void
  loading?: boolean
  error?: string
  title?: string
  placeholder?: string
  filters?: ReactNode
  empty?: ReactNode
}) {
  const id = useId(),
    input = useRef<HTMLInputElement>(null),
    list = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<string>()
  const enabled = items.filter((item) => !item.disabled)
  const active = enabled.some((item) => item.id === selected) ? selected : enabled[0]?.id
  useEffect(() => {
    if (open) queueMicrotask(() => input.current?.focus())
  }, [open])
  useEffect(() => {
    setSelected(undefined)
  }, [query])
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' })
  }, [active])
  return (
    <UiDialog open={open} onClose={onClose} title={title} className="ui-kit-command" size="wide">
      <div className="ui-kit-command__search">
        <UiBootstrapIcon name="search" />
        <input
          ref={input}
          role="combobox"
          aria-label={title}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-results`}
          aria-activedescendant={
            !loading && !error && active ? `${id}-${encodeURIComponent(active)}` : undefined
          }
          value={query}
          placeholder={placeholder}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || loading || error) return
            if (event.key === 'Enter' && active) {
              event.preventDefault()
              onSelect(active)
              return
            }
            if (!enabled.length || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const index = enabled.findIndex((item) => item.id === active)
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? enabled.length - 1
                  : (index + (event.key === 'ArrowUp' ? -1 : 1) + enabled.length) % enabled.length
            setSelected(enabled[next].id)
          }}
        />
        <kbd>esc</kbd>
      </div>
      {filters && <div className="ui-kit-command__filters">{filters}</div>}
      <div
        id={`${id}-results`}
        ref={list}
        role="listbox"
        aria-label="Search results"
        aria-busy={loading}
        className="ui-kit-command__results"
      >
        {!loading &&
          !error &&
          items.map((item) => (
            <div
              key={item.id}
              role="option"
              id={`${id}-${encodeURIComponent(item.id)}`}
              aria-selected={active === item.id}
              aria-disabled={item.disabled || undefined}
              className="ui-kit-command__result"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (!item.disabled) onSelect(item.id)
              }}
              onPointerMove={() => {
                if (!item.disabled) setSelected(item.id)
              }}
            >
              {item.icon}
              <div>
                <strong>{item.label}</strong>
                {item.description && <small>{item.description}</small>}
                {item.group && <span>{item.group}</span>}
              </div>
              {item.shortcut && <kbd>{item.shortcut}</kbd>}
            </div>
          ))}
      </div>
      {loading ? (
        <p role="status" className="ui-kit-command__state">
          Searching…
        </p>
      ) : error ? (
        <p role="alert" className="ui-kit-command__state">
          {error}
        </p>
      ) : !items.length ? (
        <p role="status" className="ui-kit-command__state">
          {empty}
        </p>
      ) : null}
      <footer className="ui-kit-command__footer">
        <span>↑ ↓ Navigate</span>
        <span>Enter Open</span>
        <span>Esc Close</span>
      </footer>
    </UiDialog>
  )
}

/** Composable filters with explicit saved-view and reset callbacks. Saving a
 * view stores no record data here; values and persistence stay with the host. */
export function UiFilterBar({
  label = 'Filters',
  children,
  summary,
  onReset,
  views = [],
  activeView,
  onViewChange,
  onSaveView,
}: {
  label?: string
  children: ReactNode
  summary?: ReactNode
  onReset?: () => void
  views?: readonly { id: string; label: string }[]
  activeView?: string
  onViewChange?: (id: string) => void
  onSaveView?: () => void
}) {
  return (
    <section className="ui-kit-filter-bar" aria-label={label}>
      {views.length > 0 && (
        <div className="ui-kit-filter-bar__views" role="group" aria-label="Saved views">
          {views.map((view) => (
            <UiButton
              key={view.id}
              type="button"
              aria-pressed={activeView === view.id}
              disabled={!onViewChange}
              onClick={() => onViewChange?.(view.id)}
            >
              {view.label}
            </UiButton>
          ))}
        </div>
      )}
      <div className="ui-kit-filter-bar__fields">{children}</div>
      <footer>
        {summary && <span>{summary}</span>}
        <div>
          {onReset && (
            <UiButton type="button" variant="quiet" onClick={onReset}>
              Reset filters
            </UiButton>
          )}
          {onSaveView && (
            <UiButton type="button" onClick={onSaveView}>
              <UiBootstrapIcon name="bookmark" /> Save view
            </UiButton>
          )}
        </div>
      </footer>
    </section>
  )
}

export type UiNotification = {
  id: string
  title: string
  description?: string
  timestamp?: string
  unread?: boolean
  statusLabel?: string
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
}
/** Read and open are separate intents. Merely displaying notifications never
 * marks them read; the host decides how either callback affects its records. */
export function UiNotificationList({
  items,
  onOpen,
  onMarkRead,
  onMarkAllRead,
  loading = false,
  error,
  label = 'Notifications',
}: {
  items: readonly UiNotification[]
  onOpen?: (id: string) => void
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  loading?: boolean
  error?: string
  label?: string
}) {
  return (
    <section className="ui-kit-notifications" aria-label={label}>
      <header>
        <strong>{label}</strong>
        <UiBadge tone="accent">{items.filter((item) => item.unread).length} unread</UiBadge>
        {onMarkAllRead && (
          <UiButton
            type="button"
            variant="quiet"
            disabled={loading || !items.some((item) => item.unread)}
            onClick={onMarkAllRead}
          >
            Mark all read
          </UiButton>
        )}
      </header>
      {loading ? (
        <p role="status">Loading notifications…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id} className={item.unread ? 'is-unread' : ''}>
              <div className="ui-kit-notifications__copy">
                <div>
                  {item.unread && <span className="ui-kit-notifications__dot" aria-label="Unread" />}
                  {onOpen ? (
                    <button type="button" onClick={() => onOpen(item.id)}>
                      {item.title}
                    </button>
                  ) : (
                    <strong>{item.title}</strong>
                  )}
                  {item.statusLabel && <UiBadge tone={item.tone}>{item.statusLabel}</UiBadge>}
                </div>
                {item.description && <p>{item.description}</p>}
                {item.timestamp && <time>{item.timestamp}</time>}
              </div>
              {item.unread && onMarkRead && (
                <UiButton
                  type="button"
                  variant="quiet"
                  aria-label={`Mark ${item.title} as read`}
                  onClick={() => onMarkRead(item.id)}
                >
                  <UiBootstrapIcon name="check2" />
                </UiButton>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications.</p>
      )}
    </section>
  )
}

export type UiSchedule = {
  enabled: boolean
  kind: 'interval' | 'daily' | 'weekly'
  everyMinutes: number | null
  time: string
  weekdays: readonly number[]
  timezone: string
}
/** Schedule input only; no timer, timezone conversion or recurrence execution.
 * An empty interval is null, never NaN; the host validates before saving.
 * Weekdays use ISO order (1 Monday … 7 Sunday). The consumer validates DST,
 * permissions and next occurrences and passes its preview as display strings. */
export function UiScheduleEditor({
  value,
  onChange,
  timezones,
  disabled = false,
  preview,
  error,
}: {
  value: UiSchedule
  onChange: (value: UiSchedule) => void
  timezones: readonly { value: string; label: string }[]
  disabled?: boolean
  preview?: readonly string[]
  error?: string
}) {
  const id = useId(),
    update = (patch: Partial<UiSchedule>) => onChange({ ...value, ...patch })
  return (
    <fieldset className="ui-kit-schedule" disabled={disabled}>
      <legend>Schedule</legend>
      <label className="ui-kit-schedule__enabled">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(event) => update({ enabled: event.target.checked })}
        />{' '}
        Enable scheduled runs
      </label>
      <fieldset className="ui-kit-schedule__fields" disabled={!value.enabled}>
        <legend className="ui-kit-operations-sr">Recurrence</legend>
        <label>
          Repeat
          <UiSelect
            value={value.kind}
            onChange={(event) => update({ kind: event.target.value as UiSchedule['kind'] })}
          >
            <option value="interval">Every interval</option>
            <option value="daily">Every day</option>
            <option value="weekly">Selected weekdays</option>
          </UiSelect>
        </label>
        {value.kind === 'interval' ? (
          <label>
            Interval (minutes)
            <UiInput
              type="number"
              min={1}
              step={1}
              required
              value={value.everyMinutes ?? ''}
              onChange={(event) =>
                update({
                  everyMinutes: Number.isFinite(event.target.valueAsNumber)
                    ? event.target.valueAsNumber
                    : null,
                })
              }
            />
          </label>
        ) : (
          <label>
            Time
            <UiInput
              type="time"
              required
              value={value.time}
              onChange={(event) => update({ time: event.target.value })}
            />
          </label>
        )}
        <label>
          Time zone
          <UiSelect value={value.timezone} onChange={(event) => update({ timezone: event.target.value })}>
            {timezones.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </UiSelect>
        </label>
        {value.kind === 'weekly' && (
          <div className="ui-kit-schedule__days" role="group" aria-label="Weekdays">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
              (day, index) => (
                <button
                  type="button"
                  key={day}
                  aria-label={day}
                  aria-pressed={value.weekdays.includes(index + 1)}
                  onClick={() =>
                    update({
                      weekdays: value.weekdays.includes(index + 1)
                        ? value.weekdays.filter((item) => item !== index + 1)
                        : [...value.weekdays, index + 1].sort((a, b) => a - b),
                    })
                  }
                >
                  {day.slice(0, 3)}
                </button>
              ),
            )}
          </div>
        )}
      </fieldset>
      {error && (
        <p id={`${id}-error`} role="alert" className="ui-kit-schedule__error">
          {error}
        </p>
      )}
      {preview && (
        <div className="ui-kit-schedule__preview">
          <strong>Next runs</strong>
          {preview.length ? (
            <ul>
              {preview.map((date, index) => (
                <li key={`${date}-${index}`}>{date}</li>
              ))}
            </ul>
          ) : (
            <p>No scheduled occurrences.</p>
          )}
        </div>
      )}
    </fieldset>
  )
}

export type UiBoardColumn = {
  id: string
  title: string
  count?: number
  description?: string
  actions?: ReactNode
  items: readonly { id: string; content: ReactNode; label?: string }[]
}
export type UiBoardMove = { itemId: string; fromColumnId: string; toColumnId: string }

/** Controlled cross-column moves: the host persists and supplies the new columns.
 * Dragging requires a callback and can be disabled independently of accessible
 * move selects. IDs must be unique within this board; foreign drags are ignored. */
export function UiBoard({ label, columns, empty = 'No items.', onMove, dragAndDrop = true }: {
  label: string
  columns: readonly UiBoardColumn[]
  empty?: ReactNode
  onMove?: (move: UiBoardMove) => void
  dragAndDrop?: boolean
}) {
  const base = useId()
  const dragged = useRef<{ itemId: string; fromColumnId: string } | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const canDrag = dragAndDrop && Boolean(onMove)
  const resetDrag = () => { dragged.current = null; setOver(null) }
  useEffect(() => { if (!canDrag) resetDrag() }, [canDrag])
  const move = (itemId: string, fromColumnId: string, toColumnId: string) => {
    const source = columns.find(column => column.id === fromColumnId)
    const target = columns.find(column => column.id === toColumnId)
    const item = source?.items.find(item => item.id === itemId)
    if (!onMove || !item || !target || fromColumnId === toColumnId) return
    onMove({ itemId, fromColumnId, toColumnId })
    setAnnouncement(`Move requested: ${item.label ?? item.id} to ${target.title}.`)
  }
  return <div className="ui-kit-board" role="region" aria-label={label} tabIndex={0}>
    <span className="ui-kit-operations-sr" role="status">{announcement}</span>
    {columns.map(column => <section
      className={`ui-kit-board__column${over === column.id ? ' ui-kit-board__column--drop' : ''}`}
      key={column.id} aria-labelledby={`${base}-${encodeURIComponent(column.id)}`}
      onDragOver={event => {
        if (!canDrag || !dragged.current || dragged.current.fromColumnId === column.id) return
        event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setOver(column.id)
      }}
      onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(null) }}
      onDrop={event => {
        if (!canDrag || !dragged.current) return
        event.preventDefault()
        move(dragged.current.itemId, dragged.current.fromColumnId, column.id)
        resetDrag()
      }}>
      <header><strong id={`${base}-${encodeURIComponent(column.id)}`}>{column.title}</strong><UiBadge>{column.count ?? column.items.length}</UiBadge>{column.actions}</header>
      {column.description && <p>{column.description}</p>}
      <div className="ui-kit-board__items">
        {column.items.length ? column.items.map(item => <div key={item.id} className="ui-kit-board__card">
          {canDrag && <span className="ui-kit-board__drag" draggable role="img" aria-label={`Drag ${item.label ?? item.id}`} title="Drag to another column; or use Move to below"
            onDragStart={event => {
              dragged.current = { itemId: item.id, fromColumnId: column.id }
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', item.id)
            }} onDragEnd={resetDrag}><UiBootstrapIcon name="grip-vertical" /> Drag</span>}
          {item.content}
          {onMove && <label className="ui-kit-board__move">Move to
            <UiSelect aria-label={`Move ${item.label ?? item.id} to column`} density="compact" value={column.id}
              onChange={event => move(item.id, column.id, event.target.value)}>
              {columns.map(target => <option key={target.id} value={target.id}>{target.title}</option>)}
            </UiSelect>
          </label>}
        </div>) : <p className="ui-kit-board__empty">{empty}</p>}
      </div>
    </section>)}
  </div>
}
