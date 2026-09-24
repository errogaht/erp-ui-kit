import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  UiActionTile, UiBadge, UiButton, UiCard, UiChangeList, UiChangeRow,
  UiChoice, UiCombobox, UiComparison, UiDisclosure, UiField, UiFormActionRow,
  UiGrid, UiCell, UiHistoryEvent, UiIcon, UiIconButton, UiInboxCard, UiInput,
  UiItemRow, UiLineItem, UiLinkButton, UiMessage, UiMetric, UiNotice, UiPanel,
  UiProgress, UiQuote, UiSelect, UiStatusLine, UiTable, UiTextarea,
  UiValueCard,
} from '../src'
import '../src/ui-kit.css'
import '../src/ui-layout.css'
import '../src/ui-conversation.css'
import '../src/ui-history.css'
import './site.css'

const groups = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'controls', label: 'Controls' },
  { id: 'records', label: 'Records & data' },
  { id: 'inbox', label: 'Inbox & conversation' },
  { id: 'history', label: 'Audit history' },
]
const options = [{ value: 'north', label: 'North team' }, { value: 'west', label: 'West team' }]

/** Every example uses fictional operations data and the package source directly. */
function Catalog() {
  const [team, setTeam] = useState(options[0])
  const [selected, setSelected] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(true)
  return <div className="site ui-kit-surface">
    <aside className="site-sidebar">
      <a className="site-brand" href="#top"><span className="site-brand-mark">E</span><span>ERP UI Kit<small>React component system</small></span></a>
      <nav aria-label="Catalog sections">{groups.map(group => <a href={`#${group.id}`} key={group.id}>{group.label}<span>↗</span></a>)}</nav>
      <div className="site-sidebar-foot"><span className="site-version">v0.1.0</span><a href="https://github.com/errogaht/erp-ui-kit">GitHub ↗</a></div>
    </aside>
    <main id="top">
      <header className="site-hero"><div className="site-kicker">COMPONENT LIBRARY / REACT 19</div><h1>Tools for clear<br/><em>operational interfaces.</em></h1><p>A practical set of compact components for dashboards, forms, records, inboxes and audit trails. Composable, responsive and independent of your application data.</p><div className="site-hero-actions"><a href="#controls">Explore components ↓</a><a href="https://github.com/errogaht/erp-ui-kit/blob/main/AGENTS.md">Agent guide ↗</a></div></header>
      <section className="site-section" id="foundations"><SectionHeader number="01" title="Foundations" detail="A restrained visual language for information-dense products."/><div className="site-swatch-grid">{[['Canvas','#eef1f3'],['Surface','#ffffff'],['Ink','#22323b'],['Accent','#31566c'],['Success','#276345'],['Warning','#795509'],['Danger','#8d3329']].map(([name,color])=><div className="site-swatch" key={name}><i style={{background:color}}/><strong>{name}</strong><code>{color}</code></div>)}</div><div className="site-demo site-demo--row"><UiBadge>Default</UiBadge><UiBadge tone="accent">In progress</UiBadge><UiBadge tone="success">Completed</UiBadge><UiBadge tone="warning">Needs review</UiBadge><UiBadge tone="danger">Blocked</UiBadge></div></section>
      <section className="site-section" id="controls"><SectionHeader number="02" title="Controls" detail="Compact native controls and searchable selections with consistent geometry."/><div className="site-demo"><div className="site-demo-title">Actions & feedback <code>UiButton · UiLinkButton · UiNotice</code></div><div className="site-demo--row"><UiButton type="button" variant="primary">Save changes</UiButton><UiButton type="button">Secondary action</UiButton><UiButton type="button" variant="quiet">Quiet action</UiButton><UiLinkButton href="#records">View records ↗</UiLinkButton><UiIconButton label="Search" type="button"><UiIcon name="search"/></UiIconButton></div><UiNotice tone="success">Changes saved. This example has no backend connection.</UiNotice></div><div className="site-demo"><div className="site-demo-title">Fields <code>UiField · UiInput · UiSelect · UiCombobox</code></div><div className="site-form-grid"><UiField label="Reference" hint="Use a unique record reference">{({id,describedBy,invalid})=><UiInput id={id} aria-describedby={describedBy} aria-invalid={invalid} defaultValue="OPS-1042"/>}</UiField><UiField label="Priority">{({id})=><UiSelect id={id} defaultValue="normal"><option value="normal">Normal</option><option value="high">High</option></UiSelect>}</UiField><UiField label="Team">{({id})=><UiCombobox inputId={id} options={options} value={team} onChange={value=>value&&setTeam(value)}/>}</UiField><UiField label="Notes">{({id})=><UiTextarea id={id} defaultValue="Review the latest update." rows={2}/>}</UiField></div><div className="site-demo--row"><UiChoice type="checkbox" label="Notify owner" defaultChecked/><UiChoice type="radio" label="Standard" name="mode" defaultChecked/><UiChoice type="radio" label="Expedited" name="mode"/></div><UiFormActionRow field={<UiField label="Find record">{({id})=><UiInput id={id} placeholder="Search by reference"/>}</UiField>} action={<UiButton type="button" variant="primary">Search</UiButton>}/></div></section>
      <section className="site-section" id="records"><SectionHeader number="03" title="Records & data" detail="Reusable composition for facts, tables and task rows."/><UiGrid gap="normal"><UiCell mobile={12} tablet={6}><UiCard title="Current workload" eyebrow="OPERATIONS" actions={<UiBadge tone="accent">Live</UiBadge>}><div className="site-metrics"><UiMetric label="Open records" value="128" detail="Across all teams"/><UiMetric label="Completion" value="74%" tone="success" detail="This week"/></div><UiProgress label="Weekly target" value={74}/></UiCard></UiCell><UiCell mobile={12} tablet={6}><UiCard title="Record details" eyebrow="OPS-1042"><UiStatusLine><UiBadge tone="warning">Pending review</UiBadge><span>Updated today</span></UiStatusLine><UiPanel title="Assignment"><strong>North team</strong><p>Owner: Alex Morgan</p></UiPanel></UiCard></UiCell></UiGrid><div className="site-demo"><div className="site-demo-title">Item row <code>UiItemRow · UiLineItem</code></div><UiItemRow main={<strong>Warehouse supplies</strong>} detail="Reference: INV-2401" control={<UiChoice type="checkbox" label="Reviewed"/>} amount={<strong>$240.00</strong>} actions={<UiButton type="button">Edit</UiButton>}/><UiLineItem title="Packing material" detail="Stock item · PK-12" quantity="4 units" amount="$32.00"/></div><div className="site-demo"><div className="site-demo-title">Table <code>UiTable</code></div><UiTable><thead><tr><th>Reference</th><th>Team</th><th>Status</th><th>Value</th></tr></thead><tbody><tr><td>OPS-1042</td><td>North team</td><td><UiBadge tone="warning">Review</UiBadge></td><td>$240.00</td></tr><tr><td>OPS-1043</td><td>West team</td><td><UiBadge tone="success">Done</UiBadge></td><td>$86.00</td></tr></tbody></UiTable></div></section>
      <section className="site-section" id="inbox"><SectionHeader number="04" title="Inbox & conversation" detail="Dense message patterns with clear hierarchy and accessible actions."/><div className="site-inbox-grid"><UiInboxCard title="Alex Morgan" subtitle="OPS-1042" signals={[{label:'Review',tone:'warning'}]} owner="North team" channels={['telegram']} preview="Could you confirm the delivery window?" unread={2} active={selected} onClick={()=>setSelected(!selected)} footer="Today · 10:42"/><div className="site-conversation"><UiMessage><p>Could you confirm the delivery window?</p></UiMessage><UiMessage outgoing><p>We will send an update this afternoon.</p></UiMessage><UiQuote label="Earlier message">The request is ready for review.</UiQuote><UiDisclosure label="Conversation details" count={2}><p>Messages and attachments stay with the host application.</p></UiDisclosure><UiActionTile title="Open record" detail="View linked operations data" type="button"/></div></div></section>
      <section className="site-section" id="history"><SectionHeader number="05" title="Audit history" detail="Changes remain readable as values, states and timestamps."/><UiHistoryEvent summary="Record updated" at="Today · 11:15" dateTime="2026-01-15T11:15:00" open={historyOpen} onToggle={()=>setHistoryOpen(!historyOpen)}><UiChangeList><UiChangeRow label="Assigned team"><UiComparison before={<UiValueCard>West team</UiValueCard>} after={<UiValueCard changed>North team</UiValueCard>}/></UiChangeRow></UiChangeList></UiHistoryEvent><div className="site-install"><div><span className="site-kicker">START BUILDING</span><h2>Use the same system<br/>across your projects.</h2><p>Inspect the source and agent guide, then install a pinned release.</p></div><code>npm install github:errogaht/erp-ui-kit#v0.1.0</code></div></section>
      <footer className="site-footer"><span>ERP UI Kit · React components for operational tools</span><a href="https://github.com/errogaht/erp-ui-kit">Source on GitHub ↗</a></footer>
    </main>
  </div>
}

function SectionHeader({number,title,detail}:{number:string,title:string,detail:string}) {return <div className="site-section-header"><span>{number} / COMPONENTS</span><h2>{title}</h2><p>{detail}</p></div>}

createRoot(document.getElementById('root')!).render(<StrictMode><Catalog/></StrictMode>)
