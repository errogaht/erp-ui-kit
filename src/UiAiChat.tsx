import { isValidElement, useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import { UiButton } from './Ui'
import './ui-ai-chat.css'

export type UiAiChatConversation = { id: string; title: string; updatedAt?: string; pinned?: boolean }
export type UiAiChatAttachment = { id: string; name: string; size?: string; url?: string }
export type UiAiChatSource = { id: string; title: string; url: string }
export type UiAiChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: string
  model?: string
  status?: 'complete' | 'streaming' | 'error'
  attachments?: readonly UiAiChatAttachment[]
  sources?: readonly UiAiChatSource[]
  feedback?: 'positive' | 'negative'
}
export type UiAiChatModel = { id: string; label: string }
export type UiAiChatProps = {
  title?: string
  description?: string
  conversations: readonly UiAiChatConversation[]
  activeConversationId?: string
  messages: readonly UiAiChatMessage[]
  models?: readonly UiAiChatModel[]
  selectedModelId?: string
  suggestions?: readonly string[]
  isGenerating?: boolean
  error?: string
  disabled?: boolean
  maxFiles?: number
  accept?: string
  className?: string
  onNewConversation: () => void
  onSelectConversation: (id: string) => void
  onSend: (text: string, files: readonly File[]) => void
  onStop?: () => void
  onRegenerate?: (messageId: string) => void
  onEditMessage?: (messageId: string, text: string) => void
  onFeedback?: (messageId: string, value: 'positive' | 'negative') => void
  onRenameConversation?: (id: string, title: string) => void
  onDeleteConversation?: (id: string) => void
  onModelChange?: (id: string) => void
}

/**
 * A controlled conversation surface: the host owns messages, persistence,
 * streaming and model calls. This component owns only transient UI state,
 * so an interrupted stream or conversation switch cannot fork application data.
 */
export function UiAiChat({
  title = 'AI assistant', description = 'Ask a question or start a new conversation.',
  conversations, activeConversationId, messages, models = [], selectedModelId,
  suggestions = [], isGenerating = false, error, disabled = false,
  maxFiles = 10, accept, className = '', onNewConversation, onSelectConversation,
  onSend, onStop, onRegenerate, onEditMessage, onFeedback,
  onRenameConversation, onDeleteConversation, onModelChange,
}: UiAiChatProps) {
  const [draft, setDraft] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renamingText, setRenamingText] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [showJump, setShowJump] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const textInput = useRef<HTMLTextAreaElement>(null)
  const transcript = useRef<HTMLDivElement>(null)
  const nearBottom = useRef(true)
  const dropDepth = useRef(0)
  const id = useId()
  const visibleConversations = conversations.filter(item => item.title.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
  const latestMessage = messages.at(-1)

  // Keep the visible transcript at the latest token only while the reader is near its end.
  useEffect(() => {
    if (nearBottom.current && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight
  }, [messages, latestMessage?.content])
  useEffect(() => {
    setDraft('')
    setFiles([])
    setEditingId(null)
    nearBottom.current = true
    setShowJump(false)
  }, [activeConversationId])
  useEffect(() => {
    if (!copiedId) return
    const timer = window.setTimeout(() => setCopiedId(null), 1800)
    return () => window.clearTimeout(timer)
  }, [copiedId])

  const appendFiles = (incoming: FileList | readonly File[]) => {
    const next = Array.from(incoming)
    setFiles(previous => [...previous, ...next].slice(0, maxFiles))
  }
  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const text = draft.trim()
    if (disabled || isGenerating || (!text && files.length === 0)) return
    onSend(text, files)
    setDraft('')
    setFiles([])
    if (fileInput.current) fileInput.current.value = ''
    nearBottom.current = true
  }
  const copy = async (key: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(key)
    } catch { /* Clipboard permissions belong to the host browser. */ }
  }
  const handleComposerKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }
  const selectConversation = (conversationId: string) => {
    onSelectConversation(conversationId)
    setSidebarOpen(false)
  }

  return <section aria-label={title} className={`ui-kit-ai-chat ${sidebarOpen ? 'ui-kit-ai-chat--sidebar-open' : ''} ${className}`.trim()}>
    {sidebarOpen && <button aria-label="Close conversation history" className="ui-kit-ai-chat__scrim" onClick={() => setSidebarOpen(false)} type="button" />}
    <aside aria-label="Conversation history" className="ui-kit-ai-chat__sidebar">
      <div className="ui-kit-ai-chat__sidebar-top"><strong><UiBootstrapIcon name="stars" /> {title}</strong><button aria-label="Close history" className="ui-kit-ai-chat__mobile-close" onClick={() => setSidebarOpen(false)} type="button"><UiBootstrapIcon name="x-lg" /></button></div>
      <UiButton className="ui-kit-ai-chat__new" onClick={() => { onNewConversation(); setSidebarOpen(false) }} type="button" variant="primary"><UiBootstrapIcon name="plus-lg" /> New chat</UiButton>
      <label className="ui-kit-ai-chat__search"><UiBootstrapIcon name="search" /><span className="ui-kit-ai-chat__sr-only">Search conversations</span><input aria-label="Search conversations" onChange={event => setQuery(event.target.value)} placeholder="Search conversations" type="search" value={query} /></label>
      <div className="ui-kit-ai-chat__history">
        {visibleConversations.length ? visibleConversations.map(conversation => <div className={`ui-kit-ai-chat__conversation ${conversation.id === activeConversationId ? 'is-active' : ''}`} key={conversation.id}>
          {renamingId === conversation.id ? <form className="ui-kit-ai-chat__rename" onSubmit={event => { event.preventDefault(); const name = renamingText.trim(); if (name) onRenameConversation?.(conversation.id, name); setRenamingId(null) }}><input aria-label="Conversation title" autoFocus onChange={event => setRenamingText(event.target.value)} value={renamingText} /><button aria-label="Save title" type="submit"><UiBootstrapIcon name="check-lg" /></button><button aria-label="Cancel renaming" onClick={() => setRenamingId(null)} type="button"><UiBootstrapIcon name="x-lg" /></button></form> : <>
            <button aria-current={conversation.id === activeConversationId ? 'page' : undefined} className="ui-kit-ai-chat__conversation-main" onClick={() => selectConversation(conversation.id)} type="button"><UiBootstrapIcon name={conversation.pinned ? 'pin-angle' : 'chat-left-text'} /><span><strong>{conversation.title}</strong>{conversation.updatedAt && <small>{conversation.updatedAt}</small>}</span></button>
            {(onRenameConversation || onDeleteConversation) && <details className="ui-kit-ai-chat__conversation-menu"><summary aria-label={`Actions for ${conversation.title}`}><UiBootstrapIcon name="three-dots" /></summary><div>{onRenameConversation && <button onClick={event => { setRenamingId(conversation.id); setRenamingText(conversation.title); event.currentTarget.closest('details')?.removeAttribute('open') }} type="button"><UiBootstrapIcon name="pencil" /> Rename</button>}{onDeleteConversation && <button onClick={() => onDeleteConversation(conversation.id)} type="button"><UiBootstrapIcon name="trash" /> Delete</button>}</div></details>}
          </>}
        </div>) : <p className="ui-kit-ai-chat__history-empty">No conversations found.</p>}
      </div>
    </aside>
    <div className="ui-kit-ai-chat__main" onDragEnter={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); dropDepth.current += 1; setDragging(true) } }} onDragLeave={event => { if (dragging) { event.preventDefault(); dropDepth.current -= 1; if (dropDepth.current <= 0) { dropDepth.current = 0; setDragging(false) } } }} onDragOver={event => { if (event.dataTransfer.types.includes('Files')) event.preventDefault() }} onDrop={event => { event.preventDefault(); dropDepth.current = 0; setDragging(false); if (!disabled) appendFiles(event.dataTransfer.files) }}>
      <header className="ui-kit-ai-chat__header"><button aria-label="Open conversation history" className="ui-kit-ai-chat__mobile-menu" onClick={() => setSidebarOpen(true)} type="button"><UiBootstrapIcon name="list" /></button><div className="ui-kit-ai-chat__header-title"><strong>{conversations.find(item => item.id === activeConversationId)?.title ?? title}</strong><small>{isGenerating ? 'Generating response…' : description}</small></div>{models.length > 0 && <label className="ui-kit-ai-chat__model"><span className="ui-kit-ai-chat__sr-only">Model</span><select aria-label="Model" disabled={disabled || isGenerating || !onModelChange} onChange={event => onModelChange?.(event.target.value)} value={selectedModelId ?? models[0].id}>{models.map(model => <option key={model.id} value={model.id}>{model.label}</option>)}</select></label>}</header>
      <div aria-label="Messages" aria-live="polite" className="ui-kit-ai-chat__transcript" onScroll={event => { const node = event.currentTarget; nearBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 100; setShowJump(!nearBottom.current) }} ref={transcript} role="log">
        {messages.length === 0 ? <div className="ui-kit-ai-chat__welcome"><span className="ui-kit-ai-chat__welcome-mark"><UiBootstrapIcon name="stars" /></span><h2>{title}</h2><p>{description}</p>{suggestions.length > 0 && <div className="ui-kit-ai-chat__suggestions">{suggestions.map(prompt => <button disabled={disabled || isGenerating} key={prompt} onClick={() => { setDraft(prompt); textInput.current?.focus() }} type="button">{prompt}<UiBootstrapIcon name="arrow-up-right" /></button>)}</div>}</div> : messages.map(message => <article aria-label={message.role === 'user' ? 'Your message' : message.role === 'assistant' ? 'Assistant response' : 'System message'} className={`ui-kit-ai-chat__message ui-kit-ai-chat__message--${message.role}`} key={message.id}>
          <span aria-hidden="true" className="ui-kit-ai-chat__avatar"><UiBootstrapIcon name={message.role === 'user' ? 'person-fill' : message.role === 'assistant' ? 'stars' : 'info-circle'} /></span>
          <div className="ui-kit-ai-chat__message-main"><div className="ui-kit-ai-chat__message-head"><strong>{message.role === 'user' ? 'You' : message.role === 'assistant' ? 'Assistant' : 'System'}</strong>{message.model && <span>{message.model}</span>}{message.createdAt && <time>{message.createdAt}</time>}</div>
            {editingId === message.id ? <form className="ui-kit-ai-chat__edit" onSubmit={event => { event.preventDefault(); const text = editingText.trim(); if (text) onEditMessage?.(message.id, text); setEditingId(null) }}><textarea aria-label="Edit message" autoFocus onChange={event => setEditingText(event.target.value)} value={editingText} /><div><UiButton onClick={() => setEditingId(null)} type="button">Cancel</UiButton><UiButton type="submit" variant="primary">Save and resend</UiButton></div></form> : <div className="ui-kit-ai-chat__markdown"><ReactMarkdown components={{ a: ({children, ...props}) => <a {...props} rel="noopener noreferrer" target="_blank">{children}</a>, pre: ({children}) => <AiCodeBlock copiedId={copiedId} onCopy={copy}>{children}</AiCodeBlock> }} remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>{message.status === 'streaming' && <span aria-label="Generating" className="ui-kit-ai-chat__cursor" />}{message.status === 'error' && <p className="ui-kit-ai-chat__message-error">Response interrupted.</p>}</div>}
            {message.attachments && message.attachments.length > 0 && <div className="ui-kit-ai-chat__attachments">{message.attachments.map(file => file.url ? <a href={file.url} key={file.id} rel="noopener noreferrer" target="_blank"><UiBootstrapIcon name="paperclip" /><span>{file.name}</span>{file.size && <small>{file.size}</small>}</a> : <span className="ui-kit-ai-chat__attachment" key={file.id}><UiBootstrapIcon name="paperclip" />{file.name}{file.size && <small>{file.size}</small>}</span>)}</div>}
            {message.sources && message.sources.length > 0 && <div className="ui-kit-ai-chat__sources"><strong>Sources</strong>{message.sources.map((source, index) => <a href={source.url} key={source.id} rel="noopener noreferrer" target="_blank"><span>{index + 1}</span>{source.title}<UiBootstrapIcon name="box-arrow-up-right" /></a>)}</div>}
            {editingId !== message.id && message.content && <div aria-label="Message actions" className="ui-kit-ai-chat__message-actions"><AiAction label={copiedId === message.id ? 'Copied' : 'Copy message'} onClick={() => copy(message.id, message.content)} icon={copiedId === message.id ? 'check-lg' : 'copy'} />{message.role === 'user' && onEditMessage && <AiAction label="Edit message" onClick={() => { setEditingId(message.id); setEditingText(message.content) }} icon="pencil" />}{message.role === 'assistant' && <>{onRegenerate && <AiAction label="Regenerate response" onClick={() => onRegenerate(message.id)} icon="arrow-clockwise" disabled={isGenerating} />}{onFeedback && <><AiAction label="Good response" onClick={() => onFeedback(message.id, 'positive')} icon="hand-thumbs-up" active={message.feedback === 'positive'} /><AiAction label="Bad response" onClick={() => onFeedback(message.id, 'negative')} icon="hand-thumbs-down" active={message.feedback === 'negative'} /></>}</>}</div>}
          </div>
        </article>)}
        {isGenerating && latestMessage?.status !== 'streaming' && <div aria-label="Assistant is thinking" className="ui-kit-ai-chat__thinking"><UiBootstrapIcon name="stars" /><span /><span /><span /></div>}
      </div>
      {showJump && <button className="ui-kit-ai-chat__jump" onClick={() => { if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight; nearBottom.current = true; setShowJump(false) }} type="button"><UiBootstrapIcon name="arrow-down" /> Latest message</button>}
      <div className="ui-kit-ai-chat__composer-wrap">{error && <div className="ui-kit-ai-chat__error" role="alert"><UiBootstrapIcon name="exclamation-triangle" />{error}</div>}{dragging && <div className="ui-kit-ai-chat__drop-hint">Drop files to attach</div>}
        <form className="ui-kit-ai-chat__composer" onSubmit={submit}><input accept={accept} aria-label="Attach files" className="ui-kit-ai-chat__sr-only" id={`${id}-files`} multiple onChange={event => { if (event.target.files) appendFiles(event.target.files); event.target.value = '' }} ref={fileInput} type="file" />
          {files.length > 0 && <div className="ui-kit-ai-chat__pending-files">{files.map((file, index) => <span key={`${file.name}-${index}`}><UiBootstrapIcon name="file-earmark" />{file.name}<button aria-label={`Remove ${file.name}`} onClick={() => setFiles(current => current.filter((_, itemIndex) => itemIndex !== index))} type="button"><UiBootstrapIcon name="x-lg" /></button></span>)}</div>}
          <textarea aria-label="Message" disabled={disabled} onChange={event => setDraft(event.target.value)} onKeyDown={handleComposerKey} onPaste={event => { if (event.clipboardData.files.length) { appendFiles(event.clipboardData.files); if (!event.clipboardData.getData('text/plain')) event.preventDefault() } }} placeholder="Ask anything…" ref={textInput} rows={2} value={draft} />
          <div className="ui-kit-ai-chat__composer-actions"><div><button aria-label="Attach files" disabled={disabled || files.length >= maxFiles} onClick={() => fileInput.current?.click()} title="Attach files" type="button"><UiBootstrapIcon name="paperclip" /></button><span>{files.length > 0 ? `${files.length}/${maxFiles} files` : 'Enter to send · Shift+Enter for a new line'}</span></div>{isGenerating ? <UiButton onClick={onStop} type="button" disabled={!onStop}><UiBootstrapIcon name="stop-fill" /> Stop</UiButton> : <UiButton disabled={disabled || (!draft.trim() && files.length === 0)} type="submit" variant="primary"><UiBootstrapIcon name="arrow-up" /> Send</UiButton>}</div>
        </form><p className="ui-kit-ai-chat__disclaimer">AI can make mistakes. Review important information.</p>
      </div>
    </div>
  </section>
}

/** Icon-only actions always have accessible labels and keep feedback explicit. */
function AiAction({ label, icon, onClick, active = false, disabled = false }: { label: string; icon: 'copy' | 'check-lg' | 'pencil' | 'arrow-clockwise' | 'hand-thumbs-up' | 'hand-thumbs-down'; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return <button aria-label={label} aria-pressed={active || undefined} className={active ? 'is-active' : ''} disabled={disabled} onClick={onClick} title={label} type="button"><UiBootstrapIcon name={icon} /></button>
}

/** Markdown stays text-driven; raw HTML is not enabled and code copying uses the rendered code node. */
function AiCodeBlock({ children, copiedId, onCopy }: { children: ReactNode; copiedId: string | null; onCopy: (key: string, content: string) => void }) {
  const code = isValidElement<{ children?: ReactNode; className?: string }>(children) ? children.props : undefined
  const language = code?.className?.replace('language-', '') || 'Code'
  const content = typeof code?.children === 'string' ? code.children.replace(/\n$/, '') : String(code?.children ?? '')
  const key = `code-${content}`
  return <div className="ui-kit-ai-chat__code"><div><span>{language}</span><button onClick={() => onCopy(key, content)} type="button"><UiBootstrapIcon name={copiedId === key ? 'check-lg' : 'copy'} /> {copiedId === key ? 'Copied' : 'Copy code'}</button></div><pre>{children}</pre></div>
}
