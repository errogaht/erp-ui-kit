import { useState } from 'react'
import {
  UiWorkspace,
  UiWorkspaceTabs,
  UiResizableSplit,
  UiTree,
  UiBreadcrumbs,
  UiMarkdown,
  UiMarkdownEditor,
  UiCodeDiff,
  UiExecutionLog,
  UiPromptActions,
  UiAgentQuestions,
  UiApprovalCard,
  UiVoiceControl,
  UiCommandPalette,
  UiFilterBar,
  UiNotificationList,
  UiScheduleEditor,
  UiBoard,
} from '../src'
import {
  UiAiChat,
  UiBadge,
  UiBootstrapIcon,
  UiButton,
  UiDialog,
  UiField,
  UiInput,
  UiSelect,
  UiStack,
  useUiDocumentActive,
} from '../src'
import type {
  UiAiChatMessage,
  UiDiffFile,
  UiExecutionEntry,
  UiNotification,
  UiSchedule,
  UiWorkspaceTab,
} from '../src'

const activity: UiExecutionEntry[] = [
  {
    id: 'plan',
    title: 'Review the dispatch workflow',
    kind: 'plan',
    status: 'success',
    summary: 'Three checks prepared',
    timestamp: '09:41',
    detail: 'Inspect routing rules, validate the sample queue, and prepare a short report.',
  },
  {
    id: 'command',
    title: 'Validate routing rules',
    kind: 'command',
    status: 'success',
    summary: 'All 12 checks passed',
    timestamp: '09:42',
    command: 'npm run check:routing',
    output: '✓ Region fallback\n✓ Missing address\n✓ Duplicate request\n\n12 checks passed in 0.8s',
    location: '/workspace/dispatch',
    exitCode: 0,
    duration: '0.8s',
  },
  {
    id: 'tool',
    title: 'Read the dispatch queue',
    kind: 'tool',
    status: 'error',
    summary: 'Connection interrupted — retry is available',
    timestamp: '09:42',
    output: 'The sample service did not respond.',
    detail: 'No records were modified.',
  },
]
const files: UiDiffFile[] = [
  {
    id: 'routing',
    path: 'src/routing.ts',
    hunks: [
      {
        id: 'a',
        label: '@@ −12,3 +12,4 @@ dispatch destination',
        lines: [
          {
            kind: 'context',
            oldLine: 12,
            newLine: 12,
            text: 'export function destination(region: string) {',
          },
          { kind: 'deletion', oldLine: 13, text: '  return queues[region];' },
          { kind: 'addition', newLine: 13, text: '  const queue = queues[region] ?? queues.default;' },
          { kind: 'addition', newLine: 14, text: '  return queue;' },
          { kind: 'context', oldLine: 14, newLine: 15, text: '}' },
        ],
      },
    ],
  },
  { id: 'image', path: 'assets/route-map.png', binary: true, hunks: [] },
  {
    id: 'partial',
    path: 'docs/routing-notes.md',
    truncated: true,
    hunks: [
      {
        id: 'note',
        label: '@@ −1 +1 @@',
        lines: [
          { kind: 'deletion', oldLine: 1, text: 'Use the selected region.' },
          { kind: 'addition', newLine: 1, text: 'Use the default queue when a region is unavailable.' },
        ],
      },
    ],
  },
]
const article =
  '# Dispatch guide\n\nKeep every request **traceable** from intake to delivery.\n\n## Before dispatch\n\n- [x] Check the delivery address\n- [x] Confirm the assigned team\n- [ ] Review the final schedule\n\n> A missing region uses the default queue.\n\n| Queue | Owner |\n| --- | --- |\n| North | Avery |\n| West | Jordan |\n\n```ts\nconst queue = queues[region] ?? queues.default;\n```'

/** Each document owns local state and reads activity, exactly as a routed host
 * would. Switching tabs demonstrates draft preservation without browser storage. */
function WorkspaceDocument({ id, onDirty }: { id: string; onDirty: () => void }) {
  const active = useUiDocumentActive()
  const [draft, setDraft] = useState(id === 'notes' ? article : 'Confirm the northern delivery window.')
  return (
    <UiStack>
      <UiBreadcrumbs
        items={[
          { id: 'home', label: 'Operations' },
          {
            id,
            label: id === 'overview' ? 'Dispatch overview' : id === 'notes' ? 'Dispatch guide' : 'Activity',
          },
        ]}
      />
      <div className="workspace-demo__document-heading">
        <h3>
          {id === 'overview' ? 'Dispatch overview' : id === 'notes' ? 'Dispatch guide' : 'Execution activity'}
        </h3>
        <UiBadge tone={active ? 'success' : 'neutral'}>{active ? 'Active document' : 'Suspended'}</UiBadge>
      </div>
      {id === 'activity' ? (
        <UiExecutionLog entries={activity} />
      ) : id === 'notes' ? (
        <UiMarkdownEditor
          label="Guide draft"
          value={draft}
          onChange={(text) => {
            setDraft(text)
            onDirty()
          }}
        />
      ) : (
        <>
          <p>Review the queue, keep a working note, and switch documents without losing your place.</p>
          <div className="workspace-demo__metrics">
            <div>
              <span>Open requests</span>
              <strong>24</strong>
            </div>
            <div>
              <span>Ready to dispatch</span>
              <strong>18</strong>
            </div>
            <div>
              <span>Need review</span>
              <strong>6</strong>
            </div>
          </div>
          <UiField label="Working note">
            {(bindings) => (
              <UiInput
                id={bindings.id}
                aria-describedby={bindings.describedBy}
                aria-invalid={bindings.invalid}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value)
                  onDirty()
                }}
              />
            )}
          </UiField>
          <p className="workspace-demo__hint">
            Edit the note, switch tabs, then return. Closing an edited tab asks you to discard the draft.
          </p>
        </>
      )}
    </UiStack>
  )
}

/** A complete synthetic workbench demonstrates all shell components together. */
export function WorkspaceExamples() {
  const initial: UiWorkspaceTab[] = [
    { id: 'overview', label: 'Dispatch overview', icon: <UiBootstrapIcon name="grid" />, closable: false },
    { id: 'notes', label: 'Dispatch guide', icon: <UiBootstrapIcon name="file-earmark-text" /> },
    {
      id: 'activity',
      label: 'Activity',
      icon: <UiBootstrapIcon name="terminal" />,
      badge: <UiBadge>3</UiBadge>,
    },
  ]
  const [tabs, setTabs] = useState(initial),
    [active, setActive] = useState('overview'),
    [expanded, setExpanded] = useState(['dispatch']),
    [width, setWidth] = useState(24),
    [closeId, setCloseId] = useState<string>(),
    [dock, setDock] = useState(false)
  const open = (id: string) => {
    const item = initial.find((item) => item.id === id)
    if (!item) return
    setTabs((previous) => (previous.some((tab) => tab.id === id) ? previous : [...previous, item]))
    setActive(id)
  }
  const close = (id: string) => {
    const index = tabs.findIndex((item) => item.id === id),
      remaining = tabs.filter((item) => item.id !== id)
    setTabs(remaining)
    if (id === active) setActive(remaining[Math.min(index, remaining.length - 1)]?.id ?? '')
    setCloseId(undefined)
  }
  return (
    <div className="workspace-demo">
      <p>
        Retained documents, unsaved changes, a keyboard tree and a resizable explorer. Try Arrow keys on tabs,
        Delete to close, and Arrow keys on the divider.
      </p>
      <UiWorkspace
        title={
          <>
            <UiBootstrapIcon name="grid-1x2" />
            <strong>Northstar workspace</strong>
            <span className="workspace-demo__grow" />
            <UiButton type="button" onClick={() => open('notes')}>
              Open guide
            </UiButton>
            <UiButton type="button" aria-pressed={dock} onClick={() => setDock(!dock)}>
              Tool panel
            </UiButton>
          </>
        }
        status={
          <>
            <UiBadge tone="success">Connected</UiBadge>
            <span>{tabs.length} documents open</span>
            <span>Demo data · Changes stay in this page</span>
          </>
        }
        dock={
          dock ? <UiExecutionLog entries={activity.slice(0, 2)} label="Tool panel activity" /> : undefined
        }
      >
        <UiResizableSplit
          label="Explorer width"
          value={width}
          onChange={setWidth}
          min={18}
          max={40}
          first={
            <div className="workspace-demo__explorer">
              <strong>EXPLORER</strong>
              <UiTree
                label="Workspace documents"
                nodes={[
                  {
                    id: 'dispatch',
                    label: 'Dispatch',
                    icon: <UiBootstrapIcon name="folder2-open" />,
                    children: initial.map((item) => ({ id: item.id, label: item.label, icon: item.icon })),
                  },
                  {
                    id: 'archive',
                    label: 'Archive',
                    disabled: true,
                    icon: <UiBootstrapIcon name="archive" />,
                  },
                ]}
                expanded={expanded}
                onExpandedChange={setExpanded}
                value={active}
                onSelect={open}
              />
            </div>
          }
          second={
            <UiWorkspaceTabs
              items={tabs}
              value={active}
              onChange={setActive}
              onClose={(id) => (tabs.find((tab) => tab.id === id)?.dirty ? setCloseId(id) : close(id))}
              renderPanel={(id) => (
                <WorkspaceDocument
                  id={id}
                  onDirty={() =>
                    setTabs((previous) =>
                      previous.map((item) => (item.id === id ? { ...item, dirty: true } : item)),
                    )
                  }
                />
              )}
            />
          }
        />
      </UiWorkspace>
      <UiDialog
        open={Boolean(closeId)}
        title="Discard unsaved changes?"
        description="This demo document has a local draft. You can keep editing or close it."
        onClose={() => setCloseId(undefined)}
        actions={
          <>
            <UiButton type="button" onClick={() => setCloseId(undefined)}>
              Keep editing
            </UiButton>
            <UiButton type="button" variant="danger" onClick={() => closeId && close(closeId)}>
              Discard and close
            </UiButton>
          </>
        }
      >
        The draft will be removed only from this example.
      </UiDialog>
    </div>
  )
}

/** Simulated assistant states exercise extension slots without any AI requests,
 * audio access or external sends. Voice appends a fixed demonstration sentence. */
export function AgentWorkspaceExamples() {
  const [messages, setMessages] = useState<UiAiChatMessage[]>([
    {
      id: 'one',
      role: 'user',
      content: 'Review the dispatch rules and show me what changed.',
      createdAt: '09:41',
    },
    {
      id: 'two',
      role: 'assistant',
      content:
        'The fallback rule is ready. The routing checks passed; the queue lookup needs a retry.\n\nReview the proposed change below before approving it.',
      activity,
      createdAt: '09:42',
    },
  ])
  const [draft, setDraft] = useState(''),
    [decision, setDecision] = useState<'pending' | 'approved' | 'rejected'>('pending'),
    [voice, setVoice] = useState<'idle' | 'recording' | 'processing'>('idle'),
    [fail, setFail] = useState(false)
  return (
    <UiStack>
      <p>
        Embedded session with inspectable tools, explicit decisions and host-controlled dictation. Every
        action below is a local simulation.
      </p>
      <UiAiChat
        title="Dispatch assistant"
        description="Sample session · ready for review"
        showHistory={false}
        conversations={[]}
        activeConversationId="demo"
        messages={messages}
        draftValue={draft}
        onDraftChange={setDraft}
        onNewConversation={() => {}}
        onSelectConversation={() => {}}
        onSend={async (text) => {
          if (fail) throw new Error('Demo connection failed. Your draft is still here.')
          setMessages((previous) => [
            ...previous,
            { id: String(Date.now()), role: 'user', content: text },
            {
              id: `reply-${Date.now()}`,
              role: 'assistant',
              content: 'Demo message received. No model or external service was called.',
            },
          ])
        }}
        headerContent={
          <UiPromptActions
            items={[
              {
                id: 'review',
                label: 'Review changes',
                description: 'Fills the composer with a review request. You choose when to send.',
                icon: 'code-slash',
              },
              {
                id: 'report',
                label: 'Prepare summary',
                description: 'Fills the composer with a summary request.',
                icon: 'file-earmark-text',
              },
              {
                id: 'publish',
                label: 'Publish',
                description: 'Would publish the reviewed result.',
                disabledReason: 'Publication is unavailable in this local demonstration.',
              },
            ]}
            onSelect={(id) =>
              setDraft(
                id === 'review'
                  ? 'Review the routing changes and explain any risks.'
                  : 'Prepare a short dispatch summary.',
              )
            }
          />
        }
        beforeComposer={
          <UiApprovalCard
            requestId="dispatch-proposal"
            title="Apply the fallback rule?"
            description="The default queue will receive requests whose region has no dedicated team."
            acknowledgement="I have reviewed the proposed routing change."
            status={decision}
            onDecision={(value) => setDecision(value === 'approve' ? 'approved' : 'rejected')}
          />
        }
        composerActions={
          <UiVoiceControl
            state={voice}
            duration="00:04"
            onStart={() => setVoice('recording')}
            onStop={() => {
              setVoice('idle')
              setDraft(
                (previous) =>
                  `${previous}${previous ? ' ' : ''}Please include the default queue in the report.`,
              )
            }}
            onCancel={() => setVoice('idle')}
          />
        }
      />
      <label className="workspace-demo__toggle">
        <input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} /> Simulate
        a send failure to check draft recovery
      </label>
      <AgentQuestionExample />
      <div className="workspace-demo__two">
        <UiExecutionLog
          entries={[
            {
              id: 'live',
              kind: 'tool',
              title: 'Collecting queue statistics',
              status: 'running',
              summary: 'Waiting for the sample service',
              output: 'Region: North\nRequests processed: 18',
            },
            {
              id: 'queued',
              kind: 'command',
              title: 'Export summary',
              status: 'queued',
              detail: 'Starts after the current check.',
            },
          ]}
          label="Running and queued activity"
        />
        <UiApprovalCard
          requestId="expired"
          title="Previous request"
          description="This request is no longer valid. Ask for a fresh proposal."
          status="expired"
          onDecision={() => {}}
        />
      </div>
    </UiStack>
  )
}

export function DocumentExamples() {
  const [text, setText] = useState(article),
    [file, setFile] = useState('routing')
  return (
    <UiStack>
      <p>Markdown stays plain text. Code changes use structured line data supplied by your application.</p>
      <div className="workspace-demo__two">
        <UiMarkdownEditor
          label="Knowledge article"
          value={text}
          onChange={setText}
          help="Try a heading, a checklist or a fenced code block; then select Preview."
        />
        <section className="workspace-demo__reading" aria-label="Published article">
          <span className="workspace-demo__eyebrow">READING VIEW</span>
          <UiMarkdown>{article}</UiMarkdown>
        </section>
      </div>
      <UiCodeDiff files={files} value={file} onChange={setFile} />
    </UiStack>
  )
}

/** Operations compose synthetic filters, pipeline cards and notifications. */
export function OperationExamples() {
  const [dragEnabled, setDragEnabled] = useState(true)
  const [query, setQuery] = useState(''),
    [search, setSearch] = useState(''),
    [command, setCommand] = useState(false),
    [selection, setSelection] = useState(''),
    [team, setTeam] = useState('all'),
    [view, setView] = useState('all'),
    [saved, setSaved] = useState(false)
  const [schedule, setSchedule] = useState<UiSchedule>({
    enabled: true,
    kind: 'weekly',
    everyMinutes: 30,
    time: '09:00',
    weekdays: [1, 3, 5],
    timezone: 'Etc/UTC',
  })
  const [notices, setNotices] = useState<UiNotification[]>([
    {
      id: 'n1',
      title: 'Dispatch checks completed',
      description: '12 routing checks passed. Review the summary when ready.',
      timestamp: 'Today · 09:42',
      unread: true,
      tone: 'success',
    },
    {
      id: 'n2',
      title: 'Queue connection interrupted',
      description: 'Avery can retry the read without changing any request.',
      timestamp: 'Today · 09:40',
      unread: true,
      tone: 'warning',
    },
    { id: 'n3', title: 'Weekly guide updated', timestamp: 'Yesterday · 16:20' },
  ])
  const [cards, setCards] = useState([
    { id: 'r1', title: 'Prepare the northern delivery', team: 'north', stage: 'review' },
    { id: 'r2', title: 'Confirm stock availability', team: 'west', stage: 'intake' },
    { id: 'r3', title: 'Attach the packing checklist', team: 'north', stage: 'ready' },
  ])
  const commands = [
    {
      id: 'overview',
      label: 'Dispatch overview',
      group: 'Documents',
      description: 'Queues, readiness and working notes',
      icon: <UiBootstrapIcon name="grid" />,
    },
    {
      id: 'guide',
      label: 'Dispatch guide',
      group: 'Knowledge',
      description: 'Regional routing and fallback rules',
      icon: <UiBootstrapIcon name="file-earmark-text" />,
    },
    {
      id: 'archive',
      label: 'Archived requests',
      group: 'Records',
      description: 'Unavailable in the demo',
      disabled: true,
      icon: <UiBootstrapIcon name="archive" />,
    },
  ].filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(search.toLowerCase()))
  const filtered = cards.filter(
    (card) =>
      (!query || card.title.toLowerCase().includes(query.toLowerCase())) &&
      (team === 'all' || card.team === team),
  )
  return (
    <UiStack>
      <div className="workspace-demo__toolbar">
        <p>Reusable patterns for daily work, global search and scheduled operations.</p>
        <UiButton type="button" onClick={() => setCommand(true)}>
          <UiBootstrapIcon name="search" /> Search workspace
        </UiButton>
      </div>
      <UiFilterBar
        views={[
          { id: 'all', label: 'All requests' },
          { id: 'north', label: 'North team' },
        ]}
        activeView={view}
        onViewChange={(id) => {
          setView(id)
          setTeam(id === 'north' ? 'north' : 'all')
        }}
        onReset={() => {
          setQuery('')
          setTeam('all')
          setView('all')
          setSaved(false)
        }}
        onSaveView={() => setSaved(true)}
        summary={`${filtered.length} requests${saved ? ' · Demo view saved' : ''}`}
      >
        <UiField label="Search requests">
          {(bindings) => (
            <UiInput
              id={bindings.id}
                aria-describedby={bindings.describedBy}
                aria-invalid={bindings.invalid}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title…"
            />
          )}
        </UiField>
        <UiField label="Team">
          {(bindings) => (
            <UiSelect
              id={bindings.id}
                aria-describedby={bindings.describedBy}
                aria-invalid={bindings.invalid}
              value={team}
              onChange={(event) => {
                setTeam(event.target.value)
                setView('')
              }}
            >
              <option value="all">All teams</option>
              <option value="north">North</option>
              <option value="west">West</option>
            </UiSelect>
          )}
        </UiField>
      </UiFilterBar>
      <label><input type="checkbox" checked={dragEnabled} onChange={event => setDragEnabled(event.target.checked)} /> Enable drag and drop</label>
      <UiBoard
        dragAndDrop={dragEnabled}
        onMove={({ itemId, toColumnId }) => setCards(previous => previous.map(item => item.id === itemId ? { ...item, stage: toColumnId } : item))}
        label="Dispatch pipeline"
        columns={[
          { id: 'intake', title: 'Intake' },
          { id: 'review', title: 'In review' },
          { id: 'ready', title: 'Ready' },
        ].map((stage) => ({
          ...stage,
          items: filtered
            .filter((card) => card.stage === stage.id)
            .map((card) => ({
              id: card.id,
              label: card.title,
              content: (
                <UiStack>
                  <strong>{card.title}</strong>
                  <UiBadge>{card.team === 'north' ? 'North team' : 'West team'}</UiBadge>

                </UiStack>
              ),
            })),
        }))}
      />
      <div className="workspace-demo__two">
        <UiNotificationList
          items={notices}
          onOpen={(id) => setSelection(notices.find((item) => item.id === id)?.title ?? '')}
          onMarkRead={(id) =>
            setNotices((previous) =>
              previous.map((item) => (item.id === id ? { ...item, unread: false } : item)),
            )
          }
          onMarkAllRead={() => setNotices((previous) => previous.map((item) => ({ ...item, unread: false })))}
        />
        <UiScheduleEditor
          value={schedule}
          onChange={setSchedule}
          timezones={[
            { value: 'Etc/UTC', label: 'UTC' },
            { value: 'Europe/London', label: 'Europe / London' },
            { value: 'America/New_York', label: 'America / New York' },
          ]}
          error={
            schedule.enabled && schedule.kind === 'weekly' && !schedule.weekdays.length
              ? 'Select at least one weekday.'
              : undefined
          }
        />
      </div>
      {selection && <p role="status">Opened in this demo: {selection}</p>}
      <UiCommandPalette
        open={command}
        onClose={() => setCommand(false)}
        query={search}
        onQueryChange={setSearch}
        items={commands}
        onSelect={(id) => {
          setSelection(commands.find((item) => item.id === id)?.label ?? '')
          setCommand(false)
        }}
      />
    </UiStack>
  )
}

/** Local-only batch submission demonstrates the same card embedded in a message.
 * Keeping it in the scrollable transcript avoids squeezing the chat composer. */
function AgentQuestionExample() {
  const [reply, setReply] = useState('')
  const [request, setRequest] = useState(0)
  const [fail, setFail] = useState(false)
  return <UiStack>
    <h3 id="agent-questions">Answer a group of questions</h3>
    <UiAiChat title="Planning assistant" description="Choose a preset or write your own answer for every question."
      showHistory={false} conversations={[]} activeConversationId="questions" onNewConversation={() => {}}
      onSelectConversation={() => {}} onSend={text => setReply(text)}
      messages={[{ id: 'questions', role: 'assistant', content: 'Before I prepare the operations report, please confirm these details.',
        contentAfter: <UiAgentQuestions requestId={`report-${request}`} questions={[
          { id: 'scope', title: 'Which queues should the report cover?', options: [
            { id: 'all', label: 'All queues', description: 'Include every active operations team.' },
            { id: 'priority', label: 'Priority queues', description: 'Focus on urgent requests.' }] },
          { id: 'period', title: 'Which time period should I use?', options: [
            { id: 'week', label: 'This week' }, { id: 'month', label: 'This month' }] }
        ]} onSubmit={async answers => {
          await new Promise(resolve => setTimeout(resolve, 650))
          if (fail) throw new Error('Demo connection failed. Your answers are preserved; try again.')
          setReply(answers.map(answer => `${answer.questionId}: ${answer.kind === 'custom' ? answer.text : answer.optionId}`).join('\n'))
        }} /> }, ...(reply ? [{ id: 'answer', role: 'user' as const, content: reply }] : [])]} />
    <div><UiButton onClick={() => { setRequest(value => value + 1); setReply('') }}>Start a new question group</UiButton>
      <label><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Simulate answer submission failure</label></div>
  </UiStack>
}
