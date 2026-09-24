import { useState } from 'react'
import {
  UiActionTile, UiAsidePanel, UiAsyncCombobox, UiAttachmentLink, UiAvatar,
  UiBadge, UiBootstrapIcon, UiButton, UiCard, UiCell, UiChangeList, UiChangeRow, UiChoice,
  UiCombobox, UiComparison, UiComposer, UiContainer, UiConversationCanvas,
  UiCallout, UiDialog, UiDisclosure, UiEmpty, UiEmptyState, UiFacts, UiField, UiFile, UiFormActionRow,
  UiGrid, UiHelp, UiHistoryEvent, UiIcon, UiIconButton, UiImagePreview, UiInfoTip,
  UiInboxCard, UiInline, UiInput, UiItemRow, UiLineItem, UiLinkButton,
  UiMessage, UiMetric, UiNotice, UiPagination, UiPanel, UiPopoverMenu, UiSectionHeading,
  UiProgress, UiQuote, UiSegmented, UiSelect, UiSkeleton, UiSplit, UiStack,
  UiStatusLine, UiTable, UiTabs, UiTextarea, UiTimeline, UiValueCard,
} from '../src'

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
