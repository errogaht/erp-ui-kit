import { useDeferredValue, useState } from 'react'
import { bootstrapIconNames, UiBootstrapIcon, UiBadge, UiButton, UiIcon, UiIconButton, UiNotice, UiStatusLine } from '../src'
import type { BootstrapIconName } from '../src'
import keywords from './icon-keywords.json'

const featured: BootstrapIconName[] = ['chat-dots', 'search', 'floppy', 'trash', 'pencil', 'gear', 'credit-card', 'cart', 'truck', 'person', 'check-circle', 'exclamation-triangle', 'paperclip', 'calendar3', 'box-seam', 'bell']

/** The same pinned metadata drives icon search and the rendered examples. */
export function IconExplorer() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<BootstrapIconName>('chat-dots')
  const [copied, setCopied] = useState(false)
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const synonyms = keywords[deferredQuery as keyof typeof keywords] ?? []
  const matches = deferredQuery
    ? bootstrapIconNames.filter(name => name.includes(deferredQuery) || synonyms.some(term => name.includes(term)))
    : featured
  const shown = matches.slice(0, 96)
  const snippet = `<UiBootstrapIcon name="${selected}" />`
  return <div className="catalog-icons">
    <div className="catalog-icons__intro"><div><strong>{bootstrapIconNames.length.toLocaleString('en-US')} Bootstrap Icons</strong><p>Search the pinned official set by name or common intent. Click a glyph to get the React usage.</p></div><a href="https://ux.symfony.com/icons?set=bi" target="_blank" rel="noreferrer">Browse source collection ↗</a></div>
    <label className="catalog-icons__search"><span>Find an icon</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Try chat, payment, delete, truck…"/></label>
    <div className="catalog-icons__result-heading"><span>{deferredQuery ? `${matches.length} matches` : 'Common icons'}</span><span>Showing {shown.length}</span></div>
    <div className="catalog-icons__grid">{shown.map(name=><button aria-pressed={selected===name} className={selected===name?'is-selected':''} key={name} onClick={()=>{setSelected(name);setCopied(false)}} title={`Select ${name}`} type="button"><UiBootstrapIcon name={name} size={23}/><span>{name}</span></button>)}</div>
    {matches.length===0?<p className="catalog-icons__empty">No matching icon. Try another English word or browse the source collection.</p>:null}
    <div className="catalog-icons__usage"><div><span>SELECTED ICON</span><strong><UiBootstrapIcon name={selected} size={25}/> {selected}</strong><a href={`https://icons.getbootstrap.com/icons/${selected}/`} target="_blank" rel="noreferrer">Official icon page ↗</a></div><code>{snippet}</code><UiButton type="button" onClick={async()=>{await navigator.clipboard.writeText(snippet);setCopied(true)}}>{copied?'Copied':'Copy JSX'}</UiButton></div>
    <div className="catalog-icons__variants"><div><small>STANDALONE</small><p><UiBootstrapIcon name={selected} label={`${selected} icon`} size={30}/> <code>label</code> names a meaningful standalone icon.</p></div><div><small>BUTTONS</small><p><UiButton type="button" variant="primary"><UiBootstrapIcon name="floppy"/> Save</UiButton> <UiIconButton label="Delete" type="button"><UiBootstrapIcon name="trash"/></UiIconButton></p></div><div><small>BADGES & STATUS</small><p><UiBadge tone="success"><UiBootstrapIcon name="check-circle"/> Complete</UiBadge></p><UiStatusLine><UiBootstrapIcon name="clock"/> Updated today</UiStatusLine></div><div><small>ALERTS</small><UiNotice tone="warning"><UiBootstrapIcon name="exclamation-triangle"/> Review the missing details.</UiNotice></div></div>
    <p className="catalog-icons__compat"><UiIcon name="info" /> Existing <code>UiIcon</code> names render Bootstrap Icons for older consumers; use <code>UiBootstrapIcon</code> in new work.</p>
  </div>
}
