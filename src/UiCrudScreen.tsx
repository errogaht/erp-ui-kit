import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { UiButton, UiDialog, UiPagination, UiTable } from './Ui'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import { UiInput, UiSelect, UiTextarea } from './UiControls'
import './ui-crud.css'

export type UiCrudValue = string | number | boolean | null | undefined
export type UiCrudRecord = { id: string; [key: string]: UiCrudValue }
export type UiCrudColumn = { key: string; label: string; render?: (value: UiCrudValue, row: UiCrudRecord) => ReactNode }
export type UiCrudField = { key: string; label: string; type?: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox'; required?: boolean; options?: readonly { value: string; label: string }[]; placeholder?: string }
export type UiCrudBulkAction = { id: string; label: string; onClick: (rows: readonly UiCrudRecord[]) => void }

/**
 * Controlled admin pattern: the host owns records, server writes, permission checks,
 * imports and exports. Local state covers only filtering, selection and the edit draft.
 */
export function UiCrudScreen({ title, description, rows, columns, fields, pageSize = 8, bulkActions = [], importAccept = '.json', validate, onCreate, onUpdate, onDelete, onImport, onExport, className = '' }: {
  title: string
  description?: string
  rows: readonly UiCrudRecord[]
  columns: readonly UiCrudColumn[]
  fields: readonly UiCrudField[]
  pageSize?: number
  bulkActions?: readonly UiCrudBulkAction[]
  importAccept?: string
  validate?: (draft: UiCrudRecord, editingId: string | null) => string | undefined
  onCreate?: (draft: UiCrudRecord) => void
  onUpdate?: (id: string, draft: UiCrudRecord) => void
  onDelete?: (id: string) => void
  onImport?: (file: File) => void
  onExport?: (rows: readonly UiCrudRecord[]) => void
  className?: string
}) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState(columns[0]?.key || 'id')
  const [sortDescending, setSortDescending] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [draft, setDraft] = useState<UiCrudRecord>({ id: '' })
  const [formError, setFormError] = useState('')
  const formId = useId()
  const importInput = useRef<HTMLInputElement>(null)
  const filtered = useMemo(() => rows.filter(row => !query.trim() || columns.some(column => String(row[column.key] ?? '').toLowerCase().includes(query.trim().toLowerCase()))).sort((a, b) => { const result = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true }); return sortDescending ? -result : result }), [rows, columns, query, sortKey, sortDescending])
  useEffect(() => setPage(1), [query, pageSize])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selectedRows = rows.filter(row => selected.has(row.id))
  const setField = (key: string, value: UiCrudValue) => setDraft(current => ({ ...current, [key]: value }))
  const openCreate = () => { setDraft({ id: '', ...Object.fromEntries(fields.map(field => [field.key, field.type === 'checkbox' ? false : ''])) }); setFormError(''); setEditing('new') }
  const openEdit = (row: UiCrudRecord) => { setDraft({ ...row }); setFormError(''); setEditing(row.id) }
  const save = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const error = validate?.(draft, editing === 'new' ? null : editing); if (error) { setFormError(error); return }; if (editing === 'new') onCreate?.(draft); else if (editing) onUpdate?.(editing, draft); setEditing(null) }
  const toggle = (id: string) => setSelected(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })
  return <section aria-label={title} className={`ui-kit-crud ${className}`.trim()}>
    <header className="ui-kit-crud__header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{onCreate && <UiButton onClick={openCreate} type="button" variant="primary"><UiBootstrapIcon name="plus-lg" /> Add record</UiButton>}</header>
    <div className="ui-kit-crud__toolbar"><label><UiBootstrapIcon name="search" /><UiInput aria-label="Search records" onChange={event => setQuery(event.target.value)} placeholder="Search records" type="search" value={query} /></label><span>{filtered.length} records</span><div>{onImport && <><input accept={importAccept} aria-label="Import records file" hidden onChange={event => { const file = event.target.files?.[0]; if (file) onImport(file); event.target.value = '' }} ref={importInput} type="file" /><UiButton onClick={() => importInput.current?.click()} type="button"><UiBootstrapIcon name="upload" /> Import</UiButton></>}{onExport && <UiButton onClick={() => onExport(selectedRows.length ? selectedRows : filtered)} type="button"><UiBootstrapIcon name="download" /> Export</UiButton>}</div></div>
    {selectedRows.length > 0 && <div className="ui-kit-crud__bulk"><strong>{selectedRows.length} selected</strong>{bulkActions.map(action => <UiButton key={action.id} onClick={() => { action.onClick(selectedRows); setSelected(new Set()) }} type="button">{action.label}</UiButton>)}{onDelete && <UiButton onClick={() => setDeleting('selected')} type="button" variant="danger">Delete selected</UiButton>}<button onClick={() => setSelected(new Set())} type="button">Clear</button></div>}
    <div className="ui-kit-crud__table"><UiTable><thead><tr><th><input aria-label="Select all rows on this page" checked={visible.length > 0 && visible.every(row => selected.has(row.id))} onChange={event => setSelected(current => { const next = new Set(current); visible.forEach(row => event.target.checked ? next.add(row.id) : next.delete(row.id)); return next })} type="checkbox" /></th>{columns.map(column => <th key={column.key}><button aria-label={`Sort by ${column.label}`} aria-sort={sortKey === column.key ? sortDescending ? 'descending' : 'ascending' : undefined} onClick={() => { if (sortKey === column.key) setSortDescending(value => !value); else { setSortKey(column.key); setSortDescending(false) } }} type="button">{column.label} {sortKey === column.key && <UiBootstrapIcon name={sortDescending ? 'arrow-down' : 'arrow-up'} />}</button></th>)}<th>Actions</th></tr></thead><tbody>{visible.map(row => <tr key={row.id}><td><input aria-label={`Select ${row.id}`} checked={selected.has(row.id)} onChange={() => toggle(row.id)} type="checkbox" /></td>{columns.map(column => <td key={column.key}>{column.render ? column.render(row[column.key], row) : String(row[column.key] ?? '—')}</td>)}<td><div className="ui-kit-crud__row-actions">{onUpdate && <button aria-label={`Edit ${row.id}`} onClick={() => openEdit(row)} type="button"><UiBootstrapIcon name="pencil" /> Edit</button>}{onDelete && <button aria-label={`Delete ${row.id}`} onClick={() => setDeleting(row.id)} type="button"><UiBootstrapIcon name="trash" /> Delete</button>}</div></td></tr>)}{visible.length === 0 && <tr><td className="ui-kit-crud__empty" colSpan={columns.length + 2}>No records match the search.</td></tr>}</tbody></UiTable></div>
    <div className="ui-kit-crud__footer"><span>{filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span><UiPagination onChange={setPage} page={currentPage} pageCount={pageCount} /></div>
    <UiDialog actions={<><UiButton onClick={() => setEditing(null)} type="button">Cancel</UiButton><UiButton form={formId} type="submit" variant="primary">Save record</UiButton></>} onClose={() => setEditing(null)} open={editing !== null} size="wide" title={editing === 'new' ? `Add ${title.toLowerCase().replace(/s$/, '')}` : 'Edit record'}><form className="ui-kit-crud__form" id={formId} onSubmit={save}>{fields.map(field => <label className={field.type === 'checkbox' ? 'ui-kit-crud__checkbox' : ''} key={field.key}>{field.label}{field.type === 'checkbox' ? <input checked={Boolean(draft[field.key])} onChange={event => setField(field.key, event.target.checked)} type="checkbox" /> : field.type === 'select' ? <UiSelect onChange={event => setField(field.key, event.target.value)} required={field.required} value={String(draft[field.key] ?? '')}><option value="">Choose…</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</UiSelect> : field.type === 'textarea' ? <UiTextarea onChange={event => setField(field.key, event.target.value)} placeholder={field.placeholder} required={field.required} rows={3} value={String(draft[field.key] ?? '')} /> : <UiInput onChange={event => setField(field.key, field.type === 'number' ? event.target.value === '' ? '' : Number(event.target.value) : event.target.value)} placeholder={field.placeholder} required={field.required} type={field.type || 'text'} value={String(draft[field.key] ?? '')} />}</label>)}{formError && <p className="ui-kit-crud__form-error" role="alert">{formError}</p>}</form></UiDialog>
    <UiDialog actions={<><UiButton onClick={() => setDeleting(null)} type="button">Cancel</UiButton><UiButton onClick={() => { if (deleting === 'selected') selectedRows.forEach(row => onDelete?.(row.id)); else if (deleting) onDelete?.(deleting); setSelected(new Set()); setDeleting(null) }} type="button" variant="danger">Delete</UiButton></>} onClose={() => setDeleting(null)} open={deleting !== null} title="Delete records"><p>{deleting === 'selected' ? `Delete ${selectedRows.length} selected records?` : 'Delete this record?'}</p><p>This action is implemented by the host application.</p></UiDialog>
  </section>
}
