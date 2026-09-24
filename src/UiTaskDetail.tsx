import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { UiBadge, UiButton } from './Ui'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import { UiInput, UiSelect } from './UiControls'
import { UiRichTextEditor, emptyRichText } from './UiRichTextEditor'
import type { UiRichTextContent } from './UiRichTextEditor'
import type { UiTaskActivity, UiTaskComment, UiTaskPerson, UiTaskPriority, UiTaskRecord, UiTaskStatusOption } from './task-types'
import './ui-tasks.css'

const priorityIcons = { critical: 'chevron-double-up', high: 'chevron-up', medium: 'dash', low: 'chevron-down', lowest: 'chevron-double-down' } as const
const kindIcons = { task: 'check2-square', bug: 'bug', story: 'bookmark', epic: 'lightning' } as const
const dateLabel = (date?: string) => date && !Number.isNaN(Date.parse(date)) ? new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(date)) : date || '—'
const hasText = (content: UiRichTextContent): boolean => Boolean(content.text?.trim()) || Boolean(content.content?.some(hasText))

/**
 * A task detail surface with controlled record changes and comments. The host
 * decides authorization, transitions, uploads and persistence; this component
 * keeps only unsaved rich-text drafts and the selected activity tab.
 */
export function UiTaskDetail({ task, statuses, people = [], comments = [], activity = [], onBack, onChange, onAddComment, onEditComment, onDeleteComment, onToggleSubtask, onAddAttachment, className = '' }: {
  task: UiTaskRecord
  statuses: readonly UiTaskStatusOption[]
  people?: readonly UiTaskPerson[]
  comments?: readonly UiTaskComment[]
  activity?: readonly UiTaskActivity[]
  onBack?: () => void
  onChange?: (patch: Partial<UiTaskRecord>) => void
  onAddComment?: (content: UiRichTextContent) => void
  onEditComment?: (id: string, content: UiRichTextContent) => void
  onDeleteComment?: (id: string) => void
  onToggleSubtask?: (id: string, done: boolean) => void
  onAddAttachment?: (files: readonly File[]) => void
  className?: string
}) {
  const [tab, setTab] = useState<'comments' | 'activity'>('comments')
  const [commentDraft, setCommentDraft] = useState<UiRichTextContent>(emptyRichText)
  const [descriptionDraft, setDescriptionDraft] = useState<UiRichTextContent>(task.description ?? emptyRichText)
  const [editingDescription, setEditingDescription] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentDraft, setEditingCommentDraft] = useState<UiRichTextContent>(emptyRichText)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(task.title)
  const fileInput = useRef<HTMLInputElement>(null)
  const tabId = useId()
  useEffect(() => { setDescriptionDraft(task.description ?? emptyRichText); setTitleDraft(task.title); setCommentDraft(emptyRichText); setEditingDescription(false); setEditingCommentId(null); setTab('comments') }, [task.id])
  const status = statuses.find(option => option.value === task.status)
  const doneCount = task.subtasks?.filter(item => item.done).length ?? 0
  const subtaskCount = task.subtasks?.length ?? 0
  const submitComment = () => { if (!onAddComment || !hasText(commentDraft)) return; onAddComment(commentDraft); setCommentDraft(emptyRichText) }
  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 'comments' : event.key === 'End' ? 'activity' : tab === 'comments' ? 'activity' : 'comments'
    setTab(next)
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next === 'comments' ? 0 : 1]?.focus()
  }
  return <article aria-label={`Task ${task.key}`} className={`ui-kit-task-detail ${className}`.trim()}>
    <div className="ui-kit-task-detail__breadcrumb">{onBack && <button aria-label="Back to tasks" onClick={onBack} type="button"><UiBootstrapIcon name="arrow-left" /></button>}<span>{task.project || 'Project'}</span><UiBootstrapIcon name="chevron-right" /><span>Tasks</span><UiBootstrapIcon name="chevron-right" /><strong>{task.key}</strong></div>
    <header className="ui-kit-task-detail__header"><div><div className="ui-kit-task-detail__key"><UiBootstrapIcon name={kindIcons[task.kind]} /><span>{task.key}</span><span>·</span><span>{task.kind}</span></div>{editingTitle ? <form className="ui-kit-task-detail__title-edit" onSubmit={event => { event.preventDefault(); if (titleDraft.trim()) onChange?.({ title: titleDraft.trim() }); setEditingTitle(false) }}><UiInput aria-label="Task title" autoFocus onChange={event => setTitleDraft(event.target.value)} value={titleDraft} /><UiButton type="submit" variant="primary">Save</UiButton><UiButton onClick={() => { setEditingTitle(false); setTitleDraft(task.title) }} type="button">Cancel</UiButton></form> : <h2>{task.title}{onChange && <button aria-label="Edit title" onClick={() => { setTitleDraft(task.title); setEditingTitle(true) }} title="Edit title" type="button"><UiBootstrapIcon name="pencil" /></button>}</h2>}</div><UiBadge tone={status?.tone || 'neutral'}>{status?.label || task.status}</UiBadge></header>
    <div className="ui-kit-task-detail__layout"><main className="ui-kit-task-detail__main">
      <section className="ui-kit-task-detail__section"><div className="ui-kit-task-detail__section-head"><h3>Description</h3>{onChange && !editingDescription && <button onClick={() => { setDescriptionDraft(task.description ?? emptyRichText); setEditingDescription(true) }} type="button"><UiBootstrapIcon name="pencil" /> Edit</button>}</div>{editingDescription ? <div className="ui-kit-task-detail__description-edit"><UiRichTextEditor ariaLabel="Task description" onChange={setDescriptionDraft} placeholder="Describe the work and expected outcome…" value={descriptionDraft} /><div><UiButton onClick={() => { onChange?.({ description: descriptionDraft }); setEditingDescription(false) }} type="button" variant="primary">Save description</UiButton><UiButton onClick={() => setEditingDescription(false)} type="button">Cancel</UiButton></div></div> : task.description && hasText(task.description) ? <UiRichTextEditor ariaLabel="Task description" readOnly value={task.description} /> : <p className="ui-kit-task-muted">No description yet.</p>}</section>
      {subtaskCount > 0 && <section className="ui-kit-task-detail__section"><div className="ui-kit-task-detail__section-head"><h3>Subtasks <small>{doneCount}/{subtaskCount}</small></h3></div><div className="ui-kit-task-detail__progress"><span style={{ width: `${(doneCount/subtaskCount)*100}%` }} /></div><ul className="ui-kit-task-detail__subtasks">{task.subtasks?.map(item => <li key={item.id}><label><input checked={item.done} disabled={!onToggleSubtask} onChange={event => onToggleSubtask?.(item.id,event.target.checked)} type="checkbox" /><span className={item.done ? 'is-done' : ''}>{item.title}</span></label>{item.key && <small>{item.key}</small>}</li>)}</ul></section>}
      {(task.attachments?.length || onAddAttachment) && <section className="ui-kit-task-detail__section"><div className="ui-kit-task-detail__section-head"><h3>Attachments <small>{task.attachments?.length ?? 0}</small></h3>{onAddAttachment && <><input aria-label="Add attachments" hidden multiple onChange={event => { if(event.target.files?.length) onAddAttachment(Array.from(event.target.files)); event.target.value='' }} ref={fileInput} type="file" /><button onClick={() => fileInput.current?.click()} type="button"><UiBootstrapIcon name="paperclip" /> Add file</button></>}</div><div className="ui-kit-task-detail__attachments">{task.attachments?.map(file => file.url ? <a href={file.url} key={file.id} rel="noopener noreferrer" target="_blank"><UiBootstrapIcon name="file-earmark-text" /><span><strong>{file.name}</strong>{file.detail && <small>{file.detail}</small>}</span><UiBootstrapIcon name="box-arrow-up-right" /></a> : <div key={file.id}><UiBootstrapIcon name="file-earmark-text" /><span><strong>{file.name}</strong>{file.detail && <small>{file.detail}</small>}</span></div>)}</div></section>}
      <section className="ui-kit-task-detail__section ui-kit-task-detail__activity"><div className="ui-kit-task-detail__section-head"><h3>Activity</h3></div><div aria-label="Activity view" className="ui-kit-task-detail__tabs" role="tablist"><button aria-controls={`${tabId}-comments`} aria-selected={tab === 'comments'} id={`${tabId}-comments-tab`} onClick={() => setTab('comments')} onKeyDown={handleTabKey} role="tab" tabIndex={tab === 'comments' ? 0 : -1} type="button">Comments <span>{comments.length}</span></button><button aria-controls={`${tabId}-history`} aria-selected={tab === 'activity'} id={`${tabId}-history-tab`} onClick={() => setTab('activity')} onKeyDown={handleTabKey} role="tab" tabIndex={tab === 'activity' ? 0 : -1} type="button">History <span>{activity.length}</span></button></div>
        {tab === 'comments' ? <div aria-labelledby={`${tabId}-comments-tab`} className="ui-kit-task-detail__comment-panel" id={`${tabId}-comments`} role="tabpanel"><div className="ui-kit-task-detail__comments">{comments.length ? comments.map(comment => <div className="ui-kit-task-detail__comment" key={comment.id}><span aria-hidden="true" className="ui-kit-task-detail__avatar">{comment.author.initials || comment.author.name[0]}</span><div><header><strong>{comment.author.name}</strong><time>{dateLabel(comment.createdAt)}</time>{comment.edited && <small>edited</small>}</header>{editingCommentId === comment.id ? <div className="ui-kit-task-detail__comment-edit"><UiRichTextEditor ariaLabel="Edit comment" onChange={setEditingCommentDraft} value={editingCommentDraft} /><div><UiButton disabled={!hasText(editingCommentDraft)} onClick={() => { onEditComment?.(comment.id, editingCommentDraft); setEditingCommentId(null) }} type="button" variant="primary">Save</UiButton><UiButton onClick={() => setEditingCommentId(null)} type="button">Cancel</UiButton></div></div> : <><UiRichTextEditor ariaLabel={`Comment by ${comment.author.name}`} readOnly value={comment.content} />{(onEditComment || onDeleteComment) && <div className="ui-kit-task-detail__comment-actions">{onEditComment && <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentDraft(comment.content) }} type="button">Edit</button>}{onDeleteComment && <button onClick={() => onDeleteComment(comment.id)} type="button">Delete</button>}</div>}</>}</div></div>) : <p className="ui-kit-task-muted">No comments yet. Start the discussion below.</p>}</div>{onAddComment && <div className="ui-kit-task-detail__comment-compose"><label>Add a comment</label><UiRichTextEditor ariaLabel="New comment" onChange={setCommentDraft} placeholder="Share an update or ask a question…" value={commentDraft} /><div><UiButton disabled={!hasText(commentDraft)} onClick={submitComment} type="button" variant="primary">Post comment</UiButton><span>Use the toolbar to format your message.</span></div></div>}</div> : <div aria-labelledby={`${tabId}-history-tab`} className="ui-kit-task-detail__history" id={`${tabId}-history`} role="tabpanel">{activity.length ? activity.map(event => <div key={event.id}><span aria-hidden="true" className="ui-kit-task-detail__avatar">{event.actor.initials || event.actor.name[0]}</span><p><strong>{event.actor.name}</strong> {event.action}<time>{dateLabel(event.at)}</time></p></div>) : <p className="ui-kit-task-muted">No activity recorded.</p>}</div>}
      </section>
    </main><aside aria-label="Task details" className="ui-kit-task-detail__sidebar"><h3>Details</h3><label>Status<UiSelect disabled={!onChange} onChange={event => onChange?.({status:event.target.value})} value={task.status}>{statuses.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</UiSelect></label><label>Priority<UiSelect disabled={!onChange} onChange={event => onChange?.({priority:event.target.value as UiTaskPriority})} value={task.priority}>{(['critical','high','medium','low','lowest'] as UiTaskPriority[]).map(value => <option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</UiSelect></label><div className="ui-kit-task-detail__priority-note"><UiBootstrapIcon name={priorityIcons[task.priority]} />{task.priority} priority</div><label>Assignee<UiSelect disabled={!onChange} onChange={event => onChange?.({assignee:people.find(person=>person.id===event.target.value)})} value={task.assignee?.id || ''}><option value="">Unassigned</option>{people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</UiSelect></label><label>Due date<UiInput disabled={!onChange} onChange={event => onChange?.({dueDate:event.target.value})} type="date" value={task.dueDate?.slice(0,10) || ''} /></label><div className="ui-kit-task-detail__sidebar-rule" /><h3>People & planning</h3><dl><dt>Reporter</dt><dd>{task.reporter?.name || '—'}</dd><dt>Sprint</dt><dd>{task.sprint || 'No sprint'}</dd><dt>Estimate</dt><dd>{task.estimate || 'Not set'}</dd><dt>Created</dt><dd>{dateLabel(task.createdAt)}</dd><dt>Updated</dt><dd>{dateLabel(task.updatedAt)}</dd></dl>{task.labels && task.labels.length > 0 && <div className="ui-kit-task-detail__side-labels"><strong>Labels</strong><div>{task.labels.map(label => <span key={label}>{label}</span>)}</div></div>}</aside></div>
  </article>
}
