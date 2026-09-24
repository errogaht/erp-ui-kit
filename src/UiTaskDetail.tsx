import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { UiBadge, UiButton } from './Ui'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import { UiInput, UiSelect } from './UiControls'
import { UiRichTextEditor, emptyRichText } from './UiRichTextEditor'
import type { UiRichTextContent } from './UiRichTextEditor'
import type { UiTaskActivity, UiTaskComment, UiTaskPerson, UiTaskPriority, UiTaskRecord, UiTaskStatusOption, UiTaskWorklog } from './task-types'
import './ui-tasks.css'

const priorityIcons = { critical: 'chevron-double-up', high: 'chevron-up', medium: 'dash', low: 'chevron-down', lowest: 'chevron-double-down' } as const
const kindIcons = { task: 'check2-square', bug: 'bug', story: 'bookmark', epic: 'lightning' } as const
const dateLabel = (date?: string) => date && !Number.isNaN(Date.parse(date)) ? new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(date)) : date || '—'
const hasText = (content: UiRichTextContent): boolean => content.type === 'image' || Boolean(content.text?.trim()) || Boolean(content.content?.some(hasText))

/**
 * A task detail surface with controlled record changes and comments. The host
 * decides authorization, transitions, uploads and persistence; this component
 * keeps only unsaved rich-text drafts and the selected activity tab.
 */
export function UiTaskDetail({ task, statuses, people = [], comments = [], activity = [], worklogs = [], onBack, onChange, onAddComment, onEditComment, onDeleteComment, onAddWorklog, onToggleSubtask, onAddAttachment, className = '' }: {
  task: UiTaskRecord
  statuses: readonly UiTaskStatusOption[]
  people?: readonly UiTaskPerson[]
  comments?: readonly UiTaskComment[]
  activity?: readonly UiTaskActivity[]
  worklogs?: readonly UiTaskWorklog[]
  onBack?: () => void
  onChange?: (patch: Partial<UiTaskRecord>) => void
  onAddComment?: (content: UiRichTextContent) => void
  onEditComment?: (id: string, content: UiRichTextContent) => void
  onDeleteComment?: (id: string) => void
  onAddWorklog?: (minutes: number, note: string) => void
  onToggleSubtask?: (id: string, done: boolean) => void
  onAddAttachment?: (files: readonly File[]) => void
  className?: string
}) {
  const [tab, setTab] = useState<'all' | 'comments' | 'activity' | 'worklog'>('all')
  const [workMinutes, setWorkMinutes] = useState('60')
  const [workNote, setWorkNote] = useState('')
  const [commentDraft, setCommentDraft] = useState<UiRichTextContent>(emptyRichText)
  const [descriptionDraft, setDescriptionDraft] = useState<UiRichTextContent>(task.description ?? emptyRichText)
  const [editingDescription, setEditingDescription] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentDraft, setEditingCommentDraft] = useState<UiRichTextContent>(emptyRichText)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(task.title)
  const fileInput = useRef<HTMLInputElement>(null)
  const tabId = useId()
  useEffect(() => { setDescriptionDraft(task.description ?? emptyRichText); setTitleDraft(task.title); setCommentDraft(emptyRichText); setEditingDescription(false); setEditingCommentId(null); setTab('all') }, [task.id])
  const status = statuses.find(option => option.value === task.status)
  const doneCount = task.subtasks?.filter(item => item.done).length ?? 0
  const subtaskCount = task.subtasks?.length ?? 0
  const submitComment = () => { if (!onAddComment || !hasText(commentDraft)) return; onAddComment(commentDraft); setCommentDraft(emptyRichText) }
  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const tabs = ['all', 'comments', 'activity', 'worklog'] as const
    const index = tabs.indexOf(tab)
    const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[3] : tabs[(index + (event.key === 'ArrowLeft' ? 3 : 1)) % tabs.length]
    setTab(next)
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[tabs.indexOf(next)]?.focus()
  }
  return <article aria-label={`Task ${task.key}`} className={`ui-kit-task-detail ${className}`.trim()}>
    <div className="ui-kit-task-detail__breadcrumb">{onBack && <button aria-label="Back to tasks" onClick={onBack} type="button"><UiBootstrapIcon name="arrow-left" /></button>}<span>{task.project || 'Project'}</span><UiBootstrapIcon name="chevron-right" /><span>Tasks</span><UiBootstrapIcon name="chevron-right" /><strong>{task.key}</strong></div>
    <header className="ui-kit-task-detail__header"><div><div className="ui-kit-task-detail__key"><UiBootstrapIcon name={kindIcons[task.kind]} /><span>{task.key}</span><span>·</span><span>{task.kind}</span></div>{editingTitle ? <form className="ui-kit-task-detail__title-edit" onSubmit={event => { event.preventDefault(); if (titleDraft.trim()) onChange?.({ title: titleDraft.trim() }); setEditingTitle(false) }}><UiInput aria-label="Task title" autoFocus onChange={event => setTitleDraft(event.target.value)} value={titleDraft} /><UiButton type="submit" variant="primary">Save</UiButton><UiButton onClick={() => { setEditingTitle(false); setTitleDraft(task.title) }} type="button">Cancel</UiButton></form> : <h2>{task.title}{onChange && <button aria-label="Edit title" onClick={() => { setTitleDraft(task.title); setEditingTitle(true) }} title="Edit title" type="button"><UiBootstrapIcon name="pencil" /></button>}</h2>}</div><UiBadge tone={status?.tone || 'neutral'}>{status?.label || task.status}</UiBadge></header>
    <div className="ui-kit-task-detail__layout"><main className="ui-kit-task-detail__main">
      <section className="ui-kit-task-detail__section"><div className="ui-kit-task-detail__section-head"><h3>Description</h3>{onChange && !editingDescription && <button onClick={() => { setDescriptionDraft(task.description ?? emptyRichText); setEditingDescription(true) }} type="button"><UiBootstrapIcon name="pencil" /> Edit</button>}</div>{editingDescription ? <div className="ui-kit-task-detail__description-edit"><UiRichTextEditor ariaLabel="Task description" onChange={setDescriptionDraft} placeholder="Describe the work and expected outcome…" value={descriptionDraft} /><div><UiButton onClick={() => { onChange?.({ description: descriptionDraft }); setEditingDescription(false) }} type="button" variant="primary">Save description</UiButton><UiButton onClick={() => setEditingDescription(false)} type="button">Cancel</UiButton></div></div> : task.description && hasText(task.description) ? <UiRichTextEditor ariaLabel="Task description" readOnly value={task.description} /> : <p className="ui-kit-task-muted">No description yet.</p>}</section>
      {subtaskCount > 0 && <section className="ui-kit-task-detail__section"><div className="ui-kit-task-detail__section-head"><h3>Subtasks <small>{doneCount}/{subtaskCount}</small></h3></div><div className="ui-kit-task-detail__progress"><span style={{ width: `${(doneCount/subtaskCount)*100}%` }} /></div><ul className="ui-kit-task-detail__subtasks">{task.subtasks?.map(item => <li key={item.id}><label><input checked={item.done} disabled={!onToggleSubtask} onChange={event => onToggleSubtask?.(item.id,event.target.checked)} type="checkbox" /><span className={item.done ? 'is-done' : ''}>{item.title}</span></label>{item.key && <small>{item.key}</small>}</li>)}</ul></section>}
      {(task.attachments?.length || onAddAttachment) && <section className="ui-kit-task-detail__section"><div className="ui-kit-task-detail__section-head"><h3>Attachments <small>{task.attachments?.length ?? 0}</small></h3>{onAddAttachment && <><input aria-label="Add attachments" hidden multiple onChange={event => { if(event.target.files?.length) onAddAttachment(Array.from(event.target.files)); event.target.value='' }} ref={fileInput} type="file" /><button onClick={() => fileInput.current?.click()} type="button"><UiBootstrapIcon name="paperclip" /> Add file</button></>}</div><div className="ui-kit-task-detail__attachments">{task.attachments?.map(file => file.url ? <a href={file.url} key={file.id} rel="noopener noreferrer" target="_blank"><UiBootstrapIcon name="file-earmark-text" /><span><strong>{file.name}</strong>{file.detail && <small>{file.detail}</small>}</span><UiBootstrapIcon name="box-arrow-up-right" /></a> : <div key={file.id}><UiBootstrapIcon name="file-earmark-text" /><span><strong>{file.name}</strong>{file.detail && <small>{file.detail}</small>}</span></div>)}</div></section>}
      <section className="ui-kit-task-detail__section ui-kit-task-detail__activity"><div className="ui-kit-task-detail__section-head"><h3>Activity</h3></div>
        <div aria-label="Activity view" className="ui-kit-task-detail__tabs" role="tablist">{([
          ['all', 'All', comments.length + activity.length + worklogs.length],
          ['comments', 'Comments', comments.length],
          ['activity', 'Audit', activity.length],
          ['worklog', 'Worklog', worklogs.length],
        ] as const).map(([value, label, count]) => <button aria-controls={`${tabId}-${value}`} aria-selected={tab === value} id={`${tabId}-${value}-tab`} key={value} onClick={() => setTab(value)} onKeyDown={handleTabKey} role="tab" tabIndex={tab === value ? 0 : -1} type="button">{label} <span>{count}</span></button>)}</div>
        <div aria-labelledby={`${tabId}-${tab}-tab`} className="ui-kit-task-detail__activity-panel" id={`${tabId}-${tab}`} role="tabpanel">
          <div className="ui-kit-task-detail__feed">{([
            ...(tab === 'all' || tab === 'comments' ? comments.map(comment => ({ kind: 'comment' as const, at: comment.createdAt, item: comment })) : []),
            ...(tab === 'all' || tab === 'activity' ? activity.map(event => ({ kind: 'audit' as const, at: event.at, item: event })) : []),
            ...(tab === 'all' || tab === 'worklog' ? worklogs.map(entry => ({ kind: 'worklog' as const, at: entry.at, item: entry })) : []),
          ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))).map(entry => entry.kind === 'comment' ? <div className="ui-kit-task-detail__comment" key={`comment-${entry.item.id}`}><span aria-hidden="true" className="ui-kit-task-detail__avatar">{entry.item.author.initials || entry.item.author.name[0]}</span><div><header><strong>{entry.item.author.name}</strong><UiBadge tone="accent">Comment</UiBadge><time>{dateLabel(entry.item.createdAt)}</time>{entry.item.edited && <small>edited</small>}</header>{editingCommentId === entry.item.id ? <div className="ui-kit-task-detail__comment-edit"><UiRichTextEditor ariaLabel="Edit comment" onChange={setEditingCommentDraft} value={editingCommentDraft} /><div><UiButton disabled={!hasText(editingCommentDraft)} onClick={() => { onEditComment?.(entry.item.id, editingCommentDraft); setEditingCommentId(null) }} type="button" variant="primary">Save</UiButton><UiButton onClick={() => setEditingCommentId(null)} type="button">Cancel</UiButton></div></div> : <><UiRichTextEditor ariaLabel={`Comment by ${entry.item.author.name}`} readOnly value={entry.item.content} />{(onEditComment || onDeleteComment) && <div className="ui-kit-task-detail__comment-actions">{onEditComment && <button onClick={() => { setEditingCommentId(entry.item.id); setEditingCommentDraft(entry.item.content) }} type="button">Edit</button>}{onDeleteComment && <button onClick={() => onDeleteComment(entry.item.id)} type="button">Delete</button>}</div>}</>}</div></div> : entry.kind === 'audit' ? <div className="ui-kit-task-detail__feed-event" key={`audit-${entry.item.id}`}><span aria-hidden="true" className="ui-kit-task-detail__feed-icon"><UiBootstrapIcon name="arrow-left-right" /></span><p><strong>{entry.item.actor.name}</strong> {entry.item.action}<span><UiBadge>Audit</UiBadge> <time>{dateLabel(entry.item.at)}</time></span></p></div> : <div className="ui-kit-task-detail__feed-event" key={`work-${entry.item.id}`}><span aria-hidden="true" className="ui-kit-task-detail__feed-icon"><UiBootstrapIcon name="clock-history" /></span><p><strong>{entry.item.author.name}</strong> logged {Math.floor(entry.item.minutes / 60)}h {entry.item.minutes % 60}m<span><UiBadge tone="success">Worklog</UiBadge> <time>{dateLabel(entry.item.at)}</time></span><small>{entry.item.note}</small></p></div>)}{(tab === 'all' ? comments.length + activity.length + worklogs.length === 0 : tab === 'comments' ? comments.length === 0 : tab === 'activity' ? activity.length === 0 : worklogs.length === 0) && <p className="ui-kit-task-muted">No entries in this view yet.</p>}</div>
          {(tab === 'all' || tab === 'comments') && onAddComment && <div className="ui-kit-task-detail__comment-compose"><label>Add a comment</label><UiRichTextEditor ariaLabel="New comment" onChange={setCommentDraft} placeholder="Share an update or ask a question…" value={commentDraft} /><div><UiButton disabled={!hasText(commentDraft)} onClick={submitComment} type="button" variant="primary">Post comment</UiButton><span>Use the toolbar to format your message.</span></div></div>}
          {(tab === 'all' || tab === 'worklog') && onAddWorklog && <form className="ui-kit-task-detail__worklog-form" onSubmit={event => { event.preventDefault(); const minutes = Number(workMinutes); if (Number.isFinite(minutes) && minutes > 0 && workNote.trim()) { onAddWorklog(minutes, workNote.trim()); setWorkNote('') } }}><strong>Log work</strong><label>Minutes<UiInput min="1" onChange={event => setWorkMinutes(event.target.value)} required type="number" value={workMinutes} /></label><label>Work completed<UiInput onChange={event => setWorkNote(event.target.value)} placeholder="What did you do?" required value={workNote} /></label><UiButton type="submit">Add worklog</UiButton></form>}
        </div>
      </section>
    </main><aside aria-label="Task details" className="ui-kit-task-detail__sidebar"><h3>Details</h3><label>Status<UiSelect disabled={!onChange} onChange={event => onChange?.({status:event.target.value})} value={task.status}>{statuses.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</UiSelect></label><label>Priority<UiSelect disabled={!onChange} onChange={event => onChange?.({priority:event.target.value as UiTaskPriority})} value={task.priority}>{(['critical','high','medium','low','lowest'] as UiTaskPriority[]).map(value => <option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</UiSelect></label><div className="ui-kit-task-detail__priority-note"><UiBootstrapIcon name={priorityIcons[task.priority]} />{task.priority} priority</div><label>Assignee<UiSelect disabled={!onChange} onChange={event => onChange?.({assignee:people.find(person=>person.id===event.target.value)})} value={task.assignee?.id || ''}><option value="">Unassigned</option>{people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</UiSelect></label><label>Due date<UiInput disabled={!onChange} onChange={event => onChange?.({dueDate:event.target.value})} type="date" value={task.dueDate?.slice(0,10) || ''} /></label><div className="ui-kit-task-detail__sidebar-rule" /><h3>People & planning</h3><dl><dt>Reporter</dt><dd>{task.reporter?.name || '—'}</dd><dt>Sprint</dt><dd>{task.sprint || 'No sprint'}</dd><dt>Estimate</dt><dd>{task.estimate || 'Not set'}</dd><dt>Created</dt><dd>{dateLabel(task.createdAt)}</dd><dt>Updated</dt><dd>{dateLabel(task.updatedAt)}</dd></dl>{task.labels && task.labels.length > 0 && <div className="ui-kit-task-detail__side-labels"><strong>Labels</strong><div>{task.labels.map(label => <span key={label}>{label}</span>)}</div></div>}</aside></div>
  </article>
}
