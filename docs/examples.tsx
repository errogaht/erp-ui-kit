import { useEffect, useRef, useState } from 'react'
import {
  UiActionTile, UiAiChat, UiAsidePanel, UiAsyncCombobox, UiAttachmentLink, UiAvatar,
  UiBadge, UiBootstrapIcon, UiButton, UiCard, UiCell, UiChangeList, UiChangeRow, UiChoice,
  UiCombobox, UiComparison, UiComposer, UiContainer, UiConversationCanvas,
  UiCallout, UiDialog, UiDisclosure, UiEmpty, UiEmptyState, UiFacts, UiField, UiFile, UiFormActionRow,
  UiGrid, UiHelp, UiHistoryEvent, UiIcon, UiIconButton, UiImagePreview, UiInfoTip,
  UiInboxCard, UiInline, UiInput, UiItemRow, UiLineItem, UiLinkButton,
  UiMessage, UiMetric, UiNotice, UiPagination, UiPanel, UiPopoverMenu, UiSectionHeading,
  UiProgress, UiQuote, UiSegmented, UiSelect, UiSkeleton, UiSplit, UiStack,
  UiStatusLine, UiTable, UiTabs, UiTaskDetail, UiTaskList, UiRichTextEditor, UiTextarea, UiTimeline, UiValueCard,
} from '../src'
import type { UiAiChatConversation, UiAiChatMessage, UiTaskActivity, UiTaskComment, UiTaskPerson, UiTaskRecord, UiTaskStatusOption, UiRichTextContent } from '../src'

const teams = [{ value: 'north', label: 'North team' }, { value: 'west', label: 'West team' }]
const illustration = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="#e5eff4"/><rect x="46" y="30" width="228" height="120" rx="3" fill="#fff" stroke="#b5c0c7"/><path d="M65 62h147M65 83h192M65 104h150" stroke="#a8bac3" stroke-width="7"/><circle cx="242" cy="58" r="14" fill="#9bbfaf"/></svg>')}`

/** A realistic but fictional workspace makes all conversation primitives inspectable together. */
export function ChatWorkspace() {
  const [selected, setSelected] = useState('avery')
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  return <div className="catalog-chat">
    <div className="catalog-chat__inbox">
      <div className="catalog-chat__column-title"><strong>Inbox</strong><UiBadge tone="accent">3 active</UiBadge></div>
      <UiInboxCard title="Avery Stone" subtitle="CASE-1042 · Dispatch request" signals={[{label:'Awaiting reply',tone:'warning'}]} owner="North team" channels={['telegram']} preview="Can you confirm the delivery window?" unread={2} active={selected==='avery'} onClick={()=>setSelected('avery')} footer="Today · 10:42" />
      <UiInboxCard title="Jordan Lee" subtitle="CASE-1043 · Stock update" signals={[{label:'Resolved',tone:'success'}]} owner="West team" channels={['whatsapp']} preview="Thanks, that works for us." active={selected==='jordan'} onClick={()=>setSelected('jordan')} footer="Yesterday · 16:20" />
      <UiDisclosure label="Inbox filters" count={2}><UiInline><UiBadge tone="warning">Needs reply</UiBadge><UiBadge tone="success">Resolved</UiBadge></UiInline></UiDisclosure>
    </div>
    <div className="catalog-chat__thread">
      <UiSplit className="catalog-chat__thread-header"><UiInline><UiAvatar initials={selected==='avery'?'AS':'JL'} tone="accent"/><div><strong>{selected==='avery'?'Avery Stone':'Jordan Lee'}</strong><UiStatusLine><UiBadge tone="telegram">Telegram</UiBadge><span>CASE-1042 · North team</span></UiStatusLine></div></UiInline><UiPopoverMenu label="Conversation actions" icon={<UiIcon name="filter"/>}><UiButton type="button" variant="quiet">Mark for review</UiButton></UiPopoverMenu></UiSplit>
      <UiConversationCanvas className="catalog-chat__canvas">
        <p className="catalog-chat__date">Today · 10:42</p>
        <UiMessage><UiQuote label="Previous update">Your request is ready.</UiQuote><p>Can you confirm the delivery window?</p><UiStatusLine><span>10:42</span><UiBadge tone="warning">Needs reply</UiBadge></UiStatusLine></UiMessage>
        <UiMessage outgoing><p>We are checking the schedule and will update you shortly.</p><UiStatusLine><span>10:44 · Sent</span></UiStatusLine></UiMessage>
        <UiMessage><p>Here is the reference document.</p><UiAttachmentLink href="#conversation" label="reference.pdf" detail="PDF · sample attachment"/><UiImagePreview src={illustration} alt="Open sample document preview" onClick={()=>setImageOpen(true)}/><UiStatusLine><span>10:46</span></UiStatusLine></UiMessage>
        {sent && <UiMessage outgoing><p>{draft || 'We will follow up shortly.'}</p><UiStatusLine><span>Just now · Example only</span></UiStatusLine></UiMessage>}
      </UiConversationCanvas>
      <UiComposer onSubmit={event=>{event.preventDefault();setSent(true)}}><UiIconButton label="Attach file" type="button"><UiIcon name="attach"/></UiIconButton><UiPopoverMenu label="Reply options" icon={<UiIcon name="message"/>}><UiButton type="button" variant="quiet">Insert template</UiButton></UiPopoverMenu><UiInput aria-label="Message" placeholder="Write a reply…" value={draft} onChange={event=>{setDraft(event.target.value);setSent(false)}}/><UiButton type="submit" variant="primary"><UiBootstrapIcon name="send"/> Send</UiButton></UiComposer>
    </div>
    <div className="catalog-chat__details"><div className="catalog-chat__column-title"><strong>Linked record</strong><UiBadge tone="warning">Open</UiBadge></div><UiPanel title="CASE-1042"><UiFacts items={[{label:'Owner',value:'North team'},{label:'Status',value:'Awaiting confirmation'},{label:'Priority',value:'Normal'}]}/></UiPanel><UiActionTile title="Open record" detail="View linked operational data" type="button"/><UiActionTile title="Add internal note" detail="Keep context with this conversation" type="button"/><UiLineItem title="Sample item" detail="SKU DEMO-1" quantity="2 units" amount="$48.00"/></div>
    <UiDialog open={imageOpen} title="Sample document preview" size="image" onClose={()=>setImageOpen(false)}><img alt="Generic document illustration" src={illustration}/></UiDialog>
  </div>
}

/** The demo simulates streaming locally so every callback can be inspected without an AI account. */
export function AiChatExamples() {
  const [conversations, setConversations] = useState<UiAiChatConversation[]>([
    { id: 'sample', title: 'Weekly operations summary', updatedAt: 'Today', pinned: true },
    { id: 'empty', title: 'Untitled conversation', updatedAt: 'Yesterday' },
  ])
  const [activeId, setActiveId] = useState('sample')
  const [model, setModel] = useState('standard')
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, UiAiChatMessage[]>>({
    sample: [
      { id: 'request', role: 'user', content: 'Summarize the sample report and show a small code example.', createdAt: '10:42', attachments: [{id:'report',name:'operations-report.csv',size:'24 KB'}] },
      { id: 'answer', role: 'assistant', model: 'Standard', createdAt: '10:43', content: '## Weekly overview\n\n**12 records** were reviewed and **3** need follow-up. The table shows a fictional breakdown.\n\n| Team | Complete | Review |\n| --- | ---: | ---: |\n| North | 7 | 1 |\n| West | 5 | 2 |\n\nYou can map a list with a small function:\n\n```js\nconst pending = records.filter(item => item.status === "review")\n```\n\nCheck the linked guidance before acting.', sources: [{id:'guide',title:'Example process guide',url:'https://example.com/guide'}] },
    ],
    empty: [],
  })
  const [generating, setGenerating] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearInterval(timer.current), [])
  const append = (conversationId: string, message: UiAiChatMessage) => setMessagesByConversation(previous => ({...previous,[conversationId]:[...(previous[conversationId] ?? []),message]}))
  const simulateResponse = (conversationId: string) => {
    window.clearInterval(timer.current)
    const responseId = `response-${Date.now()}`
    const chunks = ['I reviewed the sample request. ', 'Here is a concise answer with **clear next steps**. ', 'You can attach a document, edit your question, or ask a follow-up.']
    let step = 0
    setGenerating(true)
    append(conversationId,{id:responseId,role:'assistant',content:'',model:model==='standard'?'Standard':'Fast',status:'streaming',createdAt:'Now'})
    timer.current = window.setInterval(() => {
      step += 1
      setMessagesByConversation(previous => ({...previous,[conversationId]:(previous[conversationId] ?? []).map(message => message.id===responseId ? {...message,content:chunks.slice(0,step).join(''),status:step===chunks.length?'complete':'streaming'} : message)}))
      if(step===chunks.length){window.clearInterval(timer.current);setGenerating(false)}
    },600)
  }
  const stop = () => {window.clearInterval(timer.current);setGenerating(false);setMessagesByConversation(previous => ({...previous,[activeId]:(previous[activeId]??[]).map(message=>message.status==='streaming'?{...message,status:'complete'}:message)}))}
  return <UiAiChat
    title="Operations assistant" description="Explore the interface with local sample data. No message is sent to a server."
    conversations={conversations} activeConversationId={activeId} messages={messagesByConversation[activeId] ?? []}
    models={[{id:'standard',label:'Standard'},{id:'fast',label:'Fast'}]} selectedModelId={model} onModelChange={setModel}
    suggestions={['Summarize this report','Write a status update','Explain this table','Draft a checklist']}
    isGenerating={generating} onStop={stop}
    onNewConversation={() => { const id=`chat-${Date.now()}`;setConversations(previous=>[{id,title:'New conversation',updatedAt:'Now'},...previous]);setMessagesByConversation(previous=>({...previous,[id]:[]}));setActiveId(id) }}
    onSelectConversation={id => {if(generating) stop();setActiveId(id)}}
    onRenameConversation={(id,title) => setConversations(previous=>previous.map(item=>item.id===id?{...item,title}:item))}
    onDeleteConversation={id => {setConversations(previous=>previous.filter(item=>item.id!==id));if(id===activeId)setActiveId('') }}
    onSend={(text,files) => {const id=activeId || `chat-${Date.now()}`;if(!activeId){setConversations(previous=>[{id,title:text.slice(0,35)||'New conversation',updatedAt:'Now'},...previous]);setActiveId(id)}append(id,{id:`user-${Date.now()}`,role:'user',content:text,createdAt:'Now',attachments:files.map((file,index)=>({id:String(index),name:file.name,size:`${Math.ceil(file.size/1024)} KB`}))});simulateResponse(id)}}
    onRegenerate={() => simulateResponse(activeId)}
    onEditMessage={(id,text) => {setMessagesByConversation(previous=>({...previous,[activeId]:(previous[activeId]??[]).map(message=>message.id===id?{...message,content:text}:message)}));simulateResponse(activeId)}}
    onFeedback={(id,value) => setMessagesByConversation(previous=>({...previous,[activeId]:(previous[activeId]??[]).map(message=>message.id===id?{...message,feedback:value}:message)}))}
  />
}

const taskPeople: UiTaskPerson[] = [
  { id: 'morgan', name: 'Morgan Hale', initials: 'MH' },
  { id: 'avery', name: 'Avery Stone', initials: 'AS' },
  { id: 'jordan', name: 'Jordan Lee', initials: 'JL' },
]
const taskStatuses: UiTaskStatusOption[] = [
  { value: 'backlog', label: 'Backlog', tone: 'neutral' },
  { value: 'todo', label: 'To do', tone: 'accent' },
  { value: 'inProgress', label: 'In progress', tone: 'warning' },
  { value: 'inReview', label: 'In review', tone: 'accent' },
  { value: 'done', label: 'Done', tone: 'success' },
]
const taskDate = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
const initialTasks: UiTaskRecord[] = [
  { id: '142', key: 'OPS-142', title: 'Prepare the weekly operations dashboard', kind: 'story', status: 'inProgress', priority: 'high', assignee: taskPeople[0], reporter: taskPeople[1], project: 'Operations', sprint: 'Sprint 14', estimate: '5 points', dueDate: taskDate(3), updatedAt: taskDate(0), createdAt: taskDate(-6), labels: ['analytics', 'dashboard'], description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Create a clear overview of operational work. ' }, { type: 'text', text: 'The dashboard should help the team identify blocked records early.', marks: [{ type: 'bold' }] }] }, { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Show current workload by team.' }] }] }, { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Highlight overdue and high-priority items.' }] }] }] }] }, subtasks: [{ id: 'sub-1', key: 'OPS-143', title: 'Agree on the metrics', done: true }, { id: 'sub-2', key: 'OPS-144', title: 'Build the dashboard layout', done: false }, { id: 'sub-3', key: 'OPS-145', title: 'Review mobile presentation', done: false }], attachments: [{ id: 'file-1', name: 'dashboard-wireframe.pdf', detail: 'PDF · sample file' }] },
  { id: '146', key: 'OPS-146', title: 'Resolve an incorrect item count', kind: 'bug', status: 'inReview', priority: 'critical', assignee: taskPeople[1], reporter: taskPeople[0], project: 'Operations', dueDate: taskDate(1), updatedAt: taskDate(-1), labels: ['data'] },
  { id: '147', key: 'OPS-147', title: 'Document the handoff checklist', kind: 'task', status: 'todo', priority: 'medium', assignee: taskPeople[2], project: 'Operations', dueDate: taskDate(5), updatedAt: taskDate(-2), labels: ['docs'] },
  { id: '148', key: 'OPS-148', title: 'Improve the incoming request flow', kind: 'epic', status: 'backlog', priority: 'low', project: 'Operations', updatedAt: taskDate(-3), labels: ['workflow'] },
  { id: '149', key: 'OPS-149', title: 'Verify the export on small screens', kind: 'task', status: 'done', priority: 'medium', assignee: taskPeople[1], project: 'Operations', updatedAt: taskDate(-4), labels: ['quality'] },
  { id: '150', key: 'OPS-150', title: 'Review permission messages', kind: 'bug', status: 'todo', priority: 'high', assignee: taskPeople[0], project: 'Operations', dueDate: taskDate(-1), updatedAt: taskDate(-2), labels: ['access'] },
]

/** Fictional local state makes both tracker screens and WYSIWYG comments interactive. */
export function TaskTrackerExamples() {
  const [editorSample, setEditorSample] = useState<UiRichTextContent>({type: 'doc', content:[{type:'paragraph',content:[{type:'text',text:'Try the formatting toolbar, links and lists here.'}]}]})
  const [tasks, setTasks] = useState<UiTaskRecord[]>(initialTasks)
  const [selectedId, setSelectedId] = useState('142')
  const [comments, setComments] = useState<Record<string, UiTaskComment[]>>({
    '142': [{ id: 'comment-1', author: taskPeople[1], createdAt: taskDate(-1), content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The metrics are agreed. Please include a separate overdue view.' }] }] } }],
  })
  const activity: UiTaskActivity[] = [{ id: 'event-1', actor: taskPeople[0], action: 'moved this task to In progress', at: taskDate(-2) }, { id: 'event-2', actor: taskPeople[1], action: 'created this task', at: taskDate(-6) }]
  const listRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const selected = tasks.find(task => task.id === selectedId) ?? tasks[0]
  const open = (task: UiTaskRecord) => { setSelectedId(task.id); requestAnimationFrame(() => detailRef.current?.scrollIntoView({block:'start'})) }
  const patch = (update: Partial<UiTaskRecord>) => setTasks(current => current.map(task => task.id === selectedId ? { ...task, ...update, updatedAt: taskDate(0) } : task))
  return <div className="catalog-demo-stack">
    <div ref={listRef}><Example title="Task list with filters and board view" names="UiTaskList"><UiTaskList tasks={tasks} statuses={taskStatuses} projectName="Operations" onTaskOpen={open} onCreateTask={() => { const id=String(Date.now()); const task:UiTaskRecord={id,key:`OPS-${tasks.length+145}`,title:'New task',kind:'task',status:'todo',priority:'medium',project:'Operations',updatedAt:taskDate(0)};setTasks(current=>[task,...current]);open(task) }} onBulkStatusChange={(ids,status) => setTasks(current=>current.map(task=>ids.includes(task.id)?{...task,status}:task))}/></Example></div>
    <div ref={detailRef}><Example title="Task detail and WYSIWYG discussion" names="UiTaskDetail · UiRichTextEditor"><UiTaskDetail task={selected} statuses={taskStatuses} people={taskPeople} comments={comments[selected.id]??[]} activity={selected.id==='142'?activity:[]} onBack={() => listRef.current?.scrollIntoView({block:'start'})} onChange={patch} onToggleSubtask={(id,done)=>patch({subtasks:selected.subtasks?.map(item=>item.id===id?{...item,done}:item)})} onAddAttachment={files=>patch({attachments:[...(selected.attachments??[]),...files.map((file,index)=>({id:`${Date.now()}-${index}`,name:file.name,detail:`${Math.ceil(file.size/1024)} KB`}))]})} onAddComment={content=>setComments(current=>({...current,[selected.id]:[...(current[selected.id]??[]),{id:`comment-${Date.now()}`,author:taskPeople[0],createdAt:taskDate(0),content}]}))} onEditComment={(id,content)=>setComments(current=>({...current,[selected.id]:(current[selected.id]??[]).map(comment=>comment.id===id?{...comment,content,edited:true}:comment)}))} onDeleteComment={id=>setComments(current=>({...current,[selected.id]:(current[selected.id]??[]).filter(comment=>comment.id!==id)}))}/></Example></div>
    <Example title="Reusable rich text editor" names="UiRichTextEditor"><UiRichTextEditor ariaLabel="Editor playground" onChange={setEditorSample} value={editorSample} /></Example>
  </div>
}

/** Form examples expose both native and searchable controls without an API dependency. */
export function FormsAndActions() {
  const [team, setTeam] = useState(teams[0])
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('overview')
  return <div className="catalog-demo-stack">
    <Example title="Actions" names="UiButton · UiLinkButton · UiIconButton · UiFormActionRow"><UiInline gap="normal"><UiButton type="button" variant="primary">Save changes</UiButton><UiButton type="button">Secondary</UiButton><UiButton type="button" variant="danger">Delete</UiButton><UiButton type="button" variant="quiet">Quiet</UiButton><UiLinkButton href="#records">Open records ↗</UiLinkButton><UiIconButton label="Refresh" type="button"><UiIcon name="refresh"/></UiIconButton></UiInline><UiFormActionRow field={<UiField label="Find a record">{({id})=><UiInput id={id} placeholder="Enter reference"/>}</UiField>} action={<UiButton type="button" variant="primary">Search</UiButton>}/></Example>
    <Example title="Text, choice and select fields" names="UiField · UiInput · UiSelect · UiTextarea · UiChoice · UiCombobox · UiAsyncCombobox · UiInfoTip">
      <div className="catalog-field-grid">
        <UiField label="Reference" help={<UiInfoTip label="About reference numbers">Use a short identifier that your team can recognize in lists and messages.</UiInfoTip>}>
          {({id,describedBy,invalid})=><UiInput id={id} aria-describedby={describedBy} aria-invalid={invalid} defaultValue="CASE-1042"/>}
        </UiField>
        <UiField label="Priority">{({id})=><UiSelect id={id} defaultValue="normal"><option value="normal">Normal</option><option value="high">High</option></UiSelect>}</UiField>
        <UiField label="Searchable team">{({id})=><UiCombobox inputId={id} options={teams} value={team} onChange={value=>value&&setTeam(value)}/>}</UiField>
        <UiField label="Async team search" help={<UiInfoTip label="About async search">Type a team name to load matching options. This demo uses a local sample list.</UiInfoTip>}>
          {({id})=><UiAsyncCombobox inputId={id} defaultOptions={teams} loadOptions={async input=>teams.filter(option=>option.label.toLowerCase().includes(input.toLowerCase()))}/>}
        </UiField>
        <UiField label="Validation" error="Reference is required">{({id,describedBy,invalid})=><UiInput id={id} aria-describedby={describedBy} aria-invalid={invalid}/>}</UiField>
        <UiField label="Unavailable field">{({id})=><UiInput id={id} value="Managed elsewhere" disabled readOnly/>}</UiField>
        <UiField label="Notes" className="catalog-field-grid__wide">{({id})=><UiTextarea id={id} rows={3} defaultValue="Review the latest update."/>}</UiField>
      </div>
      <UiInline gap="relaxed"><UiChoice type="checkbox" label="Notify owner" defaultChecked/><UiChoice type="radio" label="Standard" name="service" defaultChecked/><UiChoice type="radio" label="Express" name="service"/></UiInline>
    </Example>
    <Example title="Compact field geometry" names="UiInput · UiSelect · UiCombobox · UiAsyncCombobox">
      <div className="catalog-field-grid">
        <UiField label="Compact text">{({id})=><UiInput id={id} density="compact" placeholder="Search"/>}</UiField>
        <UiField label="Compact choice">{({id})=><UiSelect id={id} density="compact"><option>All records</option><option>Open records</option></UiSelect>}</UiField>
        <UiField label="Compact searchable">{({id})=><UiCombobox inputId={id} density="compact" options={teams} defaultValue={teams[0]}/>}</UiField>
        <UiField label="Compact async">{({id})=><UiAsyncCombobox inputId={id} density="compact" defaultOptions={teams} loadOptions={async input=>teams.filter(option=>option.label.toLowerCase().includes(input.toLowerCase()))}/>}</UiField>
      </div>
    </Example>
    <Example title="Views and filters" names="UiSegmented · UiTabs"><UiSegmented label="Record filter" options={[{value:'all',label:'All'},{value:'open',label:'Open'},{value:'done',label:'Done'}]} value={filter} onChange={setFilter}/><UiTabs label="Record views" items={[{value:'overview',label:'Overview'},{value:'activity',label:'Activity'}]} value={tab} onChange={setTab} renderPanel={value=><p>{value==='overview'?'Summary information for this record.':'Recent activity for this record.'}</p>}/></Example>
  </div>
}

/** Layout and record previews keep every data primitive visible with invented values. */
export function LayoutAndRecords() {
  const [fileVisible,setFileVisible]=useState(true)
  return <div className="catalog-demo-stack">
    <Example title="Responsive layout" names="UiContainer · UiGrid · UiCell · UiStack · UiInline · UiSplit"><UiContainer className="catalog-container-demo"><UiGrid gap="normal"><UiCell mobile={12} tablet={6}><UiStack><UiSplit><strong>North team</strong><UiBadge tone="accent">Active</UiBadge></UiSplit><p>One column on phones; two columns on wider screens.</p></UiStack></UiCell><UiCell mobile={12} tablet={6}><UiInline><UiBadge>Queue 12</UiBadge><UiBadge tone="success">Ready 8</UiBadge></UiInline></UiCell></UiGrid></UiContainer></Example>
    <UiGrid gap="normal"><UiCell mobile={12} tablet={6}><UiCard title="Current workload" eyebrow="OPERATIONS" actions={<UiBadge tone="accent">Live</UiBadge>} footer={<UiLinkButton href="#audit">View history →</UiLinkButton>}><div className="catalog-metrics"><UiMetric label="Open records" value="128" detail="Across teams"/><UiMetric label="Completion" value="74%" tone="success" detail="This week"/></div><UiProgress label="Weekly target" value={74}/></UiCard></UiCell><UiCell mobile={12} tablet={6}><UiCard title="Record details" eyebrow="CASE-1042"><UiPanel title="Assignment"><UiFacts items={[{label:'Owner',value:'Avery Stone'},{label:'Team',value:'North team'},{label:'State',value:'Pending review'}]}/></UiPanel><UiAsidePanel><strong>Review note</strong><p>The date is still being confirmed.</p></UiAsidePanel></UiCard></UiCell></UiGrid>
    <Example title="Rows and files" names="UiCard · UiPanel · UiAsidePanel · UiMetric · UiFacts · UiItemRow · UiLineItem · UiFile"><UiItemRow main={<strong>Warehouse supplies</strong>} detail="Reference: INV-2401" control={<UiChoice type="checkbox" label="Reviewed"/>} amount={<strong>$240.00</strong>} actions={<UiButton type="button">Edit</UiButton>}/><UiLineItem title="Packing material" detail="SKU PK-12" quantity="4 units" amount="$32.00"/>{fileVisible?<UiFile name="inventory-summary.pdf" detail="PDF · 160 KB" onRemove={()=>setFileVisible(false)}/>:<UiButton type="button" onClick={()=>setFileVisible(true)}>Restore file example</UiButton>}</Example>
    <Example title="Data table" names="UiTable"><UiTable><thead><tr><th>Reference</th><th>Team</th><th>Status</th><th>Value</th></tr></thead><tbody><tr><td>CASE-1042</td><td>North</td><td><UiBadge tone="warning">Review</UiBadge></td><td>$240.00</td></tr><tr><td>CASE-1043</td><td>West</td><td><UiBadge tone="success">Done</UiBadge></td><td>$86.00</td></tr></tbody></UiTable></Example>
  </div>
}

/** State examples include interactive dialog and pagination so their hidden states can be inspected. */
export function StatesAndNavigation() {
  const [dialogOpen,setDialogOpen]=useState(false)
  const [page,setPage]=useState(2)
  return <div className="catalog-demo-stack">
    <Example title="Badges, notices and progress" names="UiBadge · UiNotice · UiProgress"><UiInline><UiBadge>Default</UiBadge><UiBadge tone="accent">Active</UiBadge><UiBadge tone="success">Complete</UiBadge><UiBadge tone="warning">Review</UiBadge><UiBadge tone="danger">Blocked</UiBadge></UiInline><UiNotice tone="success">The sample record was saved.</UiNotice><UiNotice tone="warning">Two details still need review.</UiNotice><UiProgress label="Completion" value={74}/></Example>
    <Example title="Loading, empty state and help" names="UiSkeleton · UiEmpty · UiHelp"><UiGrid><UiCell mobile={12} tablet={6}><UiSkeleton lines={3}/></UiCell><UiCell mobile={12} tablet={6}><UiEmpty>No records match this filter.</UiEmpty><UiHelp label="How filters work">Filters apply only to the current list.</UiHelp></UiCell></UiGrid></Example>
    <Example title="Dialog, pagination, timeline and icons" names="UiDialog · UiPagination · UiTimeline · UiIcon"><UiInline><UiButton type="button" onClick={()=>setDialogOpen(true)}>Open dialog</UiButton>{(['search','filter','refresh','attach','close','check','warning','info','clock','message','wallet','box','arrow-right'] as const).map(name=><span className="catalog-icon" title={name} key={name}><UiIcon name={name}/><small>{name}</small></span>)}</UiInline><UiPagination page={page} pageCount={4} onChange={setPage}/><UiTimeline items={[{id:'one',at:'Today · 11:15',dateTime:'2026-01-15T11:15:00',title:'Assigned to North team',detail:'Changed by an operator'},{id:'two',at:'Yesterday · 09:00',dateTime:'2026-01-14T09:00:00',title:'Record created'}]}/><UiDialog open={dialogOpen} title="Confirm sample action" description="This is a local, non-persistent demonstration." onClose={()=>setDialogOpen(false)} actions={<UiButton type="button" variant="primary" onClick={()=>setDialogOpen(false)}>Done</UiButton>}><p>The host application decides what happens after confirmation.</p></UiDialog></Example>
  </div>
}

/** Reusable explanatory patterns belong beside the data or decision they explain. */
export function InformationExamples() {
  return <div className="catalog-demo-stack">
    <Example title="Section heading and contextual help" names="UiSectionHeading · UiInfoTip">
      <UiSectionHeading title="Assignment" description="Keep the owner and review details together." action={<UiButton type="button">Change owner</UiButton>} />
      <p>Each field can show a short explanation <UiInfoTip label="About contextual help">Click or press Enter to read help. Press Escape or click outside to close it.</UiInfoTip> without leaving the form.</p>
    </Example>
    <Example title="Information and action callouts" names="UiCallout">
      <div className="catalog-information-grid">
        <UiCallout title="Before you continue" tone="accent" action={<UiButton type="button">Review details</UiButton>}>The linked record has a pending change.</UiCallout>
        <UiCallout title="Ready to share" tone="success">All required fields are complete.</UiCallout>
        <UiCallout title="Review needed" tone="warning">One address has not been confirmed.</UiCallout>
        <UiCallout title="Action unavailable" tone="danger">Your current role cannot approve this record.</UiCallout>
      </div>
    </Example>
    <Example title="Actionable empty state" names="UiEmptyState">
      <UiEmptyState title="No records yet" description="Create a record to start tracking this workflow." action={<UiButton type="button" variant="primary">Create record</UiButton>} />
    </Example>
  </div>
}

/** Comparison states use both scalar and card values, matching the shared audit contract. */
export function AuditHistory() {
  const [open,setOpen]=useState(true)
  return <div className="catalog-demo-stack"><UiHistoryEvent summary={<><strong>Record updated</strong><b>Assignment and quantity changed</b></>} at="Today · 11:15" dateTime="2026-01-15T11:15:00" open={open} onToggle={()=>setOpen(!open)}><UiChangeList><UiChangeRow label="Assigned team"><UiComparison before={<UiValueCard>West team</UiValueCard>} after={<UiValueCard changed>North team</UiValueCard>}/></UiChangeRow><UiChangeRow label="Stock item"><UiComparison state="added" before={<UiValueCard empty>No item</UiValueCard>} after={<UiValueCard><strong>Packing material</strong><small>SKU PK-12</small><span>4 units · $32.00</span></UiValueCard>}/></UiChangeRow><UiChangeRow label="Old note"><UiComparison state="removed" before={<UiValueCard>Pending dispatch</UiValueCard>} after={<UiValueCard empty>No note</UiValueCard>}/></UiChangeRow></UiChangeList></UiHistoryEvent></div>
}

function Example({title,names,children}:{title:string;names:string;children:React.ReactNode}) {return <div className="catalog-example"><header><strong>{title}</strong><code>{names}</code></header><div className="catalog-example__body">{children}</div></div>}
