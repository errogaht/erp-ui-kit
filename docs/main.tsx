import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import groups from './catalog.json'
import { AdminPatterns, AiChatExamples, AuditHistory, ChatWorkspace, FormsAndActions, InformationExamples, LayoutAndRecords, StatesAndNavigation, TaskTrackerExamples } from './examples'
import { IconExplorer } from './icons'
import '../src/ui-kit.css'
import '../src/ui-layout.css'
import '../src/ui-conversation.css'
import '../src/ui-history.css'
import './site.css'

const sections = [
  { id: 'conversation', label: 'Chat workspace', detail: 'A complete inbox, conversation and linked record composition.', component: ChatWorkspace },
  { id: 'ai-chat', label: 'AI chat', detail: 'A complete assistant conversation surface with history, streaming, files and message actions.', component: AiChatExamples },
  { id: 'tasks', label: 'Task tracker', detail: 'Filtered task list, board, task detail, activity and WYSIWYG comments.', component: TaskTrackerExamples },
  { id: 'admin-patterns', label: 'Admin patterns', detail: 'Ready-to-use CRUD screen with a compact data table, forms, validation and batch actions.', component: AdminPatterns },
  { id: 'icons', label: 'Icons', detail: 'Search and use every icon in the official Bootstrap Icons set.', component: IconExplorer },
  { id: 'controls', label: 'Forms and actions', detail: 'Native fields, searchable selectors, filters and aligned actions.', component: FormsAndActions },
  { id: 'records', label: 'Layout and records', detail: 'Responsive structure, cards, values, files and tables.', component: LayoutAndRecords },
  { id: 'states', label: 'States and navigation', detail: 'Feedback, progress, empty states, dialog and history navigation.', component: StatesAndNavigation },
  { id: 'information', label: 'Information', detail: 'Click help, explanatory callouts, section headings and actionable empty states.', component: InformationExamples },
  { id: 'audit', label: 'Audit history', detail: 'A disclosure with field-level before and after values.', component: AuditHistory },
] as const
const componentCount = Object.values(groups).flat().length

/** The catalog index is explicit so agents can discover every exported component. */
function Catalog() {
  return <div className="site ui-kit-surface">
    <aside className="site-sidebar">
      <a className="site-brand" href="#top"><span className="site-brand-mark">E</span><span>ERP UI Kit<small>React component system</small></span></a>
      <nav aria-label="Catalog sections">
        <a href="#components">All {componentCount} components <span>↗</span></a>
        {sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.label}<span>↗</span></a>)}
      </nav>
      <div className="site-sidebar-foot"><span className="site-version">v0.6.1</span><a href="https://github.com/errogaht/erp-ui-kit">GitHub ↗</a></div>
    </aside>
    <main id="top">
      <header className="site-hero"><div className="site-kicker">COMPONENT LIBRARY / REACT 19</div><h1>Every part of an<br/><em>operational interface.</em></h1><p>{componentCount} reusable React components, from inputs and records to a complete conversation workspace and audit trail. All examples use fictional data.</p><div className="site-hero-actions"><a href="#conversation">Explore the chat workspace ↓</a><a href="#components">View all components</a><a href="https://github.com/errogaht/erp-ui-kit/blob/main/AGENTS.md">Agent guide ↗</a></div></header>
      <section className="site-section site-section--index" id="components"><SectionHeader number="INDEX" title={`All ${componentCount} components`} detail="Select a name to jump to its working example. Every public component is listed here."/><div className="catalog-index">{sections.map(section => <div className="catalog-index__group" key={section.id}><h3>{section.label}<small>{groups[section.label].length}</small></h3><div>{groups[section.label].map(name=><a href={`#${section.id}`} key={name}>{name}</a>)}</div></div>)}</div><p className="catalog-index__note">The public <code>UiInboxSignal</code> type describes inbox badges; it has no visual rendering of its own.</p></section>
      {sections.map((section,index) => <section className="site-section" id={section.id} key={section.id}><SectionHeader number={String(index+1).padStart(2,'0')} title={section.label} detail={section.detail}/><section.component/></section>)}
      <div className="site-install"><div><span className="site-kicker">START BUILDING</span><h2>Use the same system<br/>across your projects.</h2><p>Inspect the source and agent guide, then install a pinned release.</p></div><code>npm install github:errogaht/erp-ui-kit#v0.6.1</code></div>
      <footer className="site-footer"><span>ERP UI Kit · React components for operational tools</span><a href="https://github.com/errogaht/erp-ui-kit">Source on GitHub ↗</a></footer>
    </main>
  </div>
}

function SectionHeader({number,title,detail}:{number:string;title:string;detail:string}) {return <div className="site-section-header"><span>{number} / COMPONENTS</span><h2>{title}</h2><p>{detail}</p></div>}

createRoot(document.getElementById('root')!).render(<StrictMode><Catalog/></StrictMode>)
