# Workspace and agent interfaces

The [workspace](https://errogaht.github.io/erp-ui-kit/#workspace), [agent activity](https://errogaht.github.io/erp-ui-kit/#agent-activity), [documents](https://errogaht.github.io/erp-ui-kit/#documents) and [operations](https://errogaht.github.io/erp-ui-kit/#operations) examples use fictional data and local state. No example calls a service, runs a command, records audio or sends a message externally.

Import from the package root and load `@errogaht/erp-ui-kit/style.css` once. Wrap the host in `.ui-kit-surface`.

## Retained documents

`UiTabs` remains the simple view switcher. `UiWorkspaceTabs` is for independently identified documents:

```tsx
<UiWorkspaceTabs
  items={documents}
  value={activeId}
  onChange={setActiveId}
  onClose={requestClose}
  renderPanel={(id, active) => <Document id={id} active={active} />}
/>
```

- Keep IDs unique and stable. An ID identifies a mounted document, not its position.
- Switching preserves mounted state, editor drafts and native disclosure state. Inactive panels are `hidden` and `inert`.
- `onClose` is a request. The host checks `dirty`, asks for save/discard if needed, and removes an item only after the decision. `closable: false` protects a pinned document.
- Use Left/Right/Home/End to select tabs, Delete to request closing, and Tab to enter the document. After an acknowledged close, focus returns to the remaining active tab.
- An invalid or removed `value` falls back to the first remaining item. For nearest-neighbor selection, update `value` and `items` together in the host.
- `useUiDocumentActive()` combines all enclosing document activity. Suspend polling, subscriptions, global shortcuts and third-party portals when false. Existing dialogs, popover menus, badge selectors, help handlers and combobox menus automatically follow this signal. The hook does not stop host effects by itself.
- Retention ends when the item is removed or the workspace unmounts. Persist durable drafts in the host if reload recovery is required. Bound the number of open documents for large applications.

`UiWorkspace` supplies title, navigation, explorer, document, inspector, tool dock and status slots. It does not create routes or register shortcuts. `UiResizableSplit` is a controlled percentage divider: arrows change 2 points, Shift+arrows 10, Home/End choose bounds; pointer dragging uses capture. Horizontal panes stack below 540px of container width by default (`stackOnNarrow={false}` opts out). A vertical split requires a bounded parent height. Store layout preferences in the host if needed.

`UiTree` exposes controlled selection and expansion. Up/Down/Home/End move focus; Left/Right collapse, expand or move between parent and child; Enter/Space selects; typing searches visible node labels. Disabled items remain discoverable but cannot be selected. `UiBreadcrumbs` uses native links supplied by the host.

## Agent activity and decisions

`UiExecutionLog` receives structured entries with stable IDs, kind, status and optional command/output/detail/location/exit code. Native disclosures preserve expansion during streaming. Redact secrets and bound output in the host before passing it to the renderer. The component displays literal text and does not execute it.

`UiPromptActions` gives each preset an action and a separately available explanation. `disabledReason` disables the action while keeping its help accessible. The host explicitly chooses whether a preset fills a draft or starts work; the catalog only fills a draft.

`UiApprovalCard` receives a unique `requestId`, controlled status and `onDecision`. A required acknowledgement starts unchecked. Decisions lock while an asynchronous callback settles; rejected promises show an error and allow retry. Update `status` after success. Changing `requestId` clears consent and pending local state. This UI is not authorization: verify the current proposal, permissions and idempotency on the server. Compose questions using `children` with existing `UiField`, choices and text controls.

`UiVoiceControl` renders idle/recording/processing/error states and start/stop/cancel callbacks. The host owns permissions, microphone streams, cancellation and transcription. Mounting the component never accesses a microphone. Append the returned transcript to a controlled chat draft only after checking the current document/session identity.

### AI chat extensions

`UiAiChat` keeps its existing API and adds:

| Prop | Purpose |
| --- | --- |
| `showHistory={false}` | Embed a session inside an existing document shell. |
| `headerContent` | Presets or contextual status above the transcript. |
| `beforeComposer` | Approval or structured question controls. |
| `composerActions` | Dictation or other host actions near attachments. |
| `draftValue`, `onDraftChange` | Host-owned drafts, including dictation and per-session persistence. |
| `message.activity` | Structured execution entries inside a message. |
| async `onSend` | Resolve after accepting the text/files; reject to retain them and show an error. |

Successful send clears only the unchanged draft and submitted files in the original conversation. A failed send retains both. While awaiting acceptance, typing remains possible and repeated submission is blocked. Streaming after acceptance remains controlled by `isGenerating` and `messages`. The local draft still resets when the conversation changes; use controlled drafts for cross-conversation retention.

## Documents and code changes

- `UiMarkdown` renders GFM, tables, checklists and code. Raw HTML stays disabled and unsafe URL protocols use the renderer's default filtering. Images are placeholders unless `allowImages` is explicitly enabled; hosts must decide which remote resources may load.
- `UiMarkdownEditor` edits a plain string and previews that same string. It deliberately does not convert through the existing rich-text JSON model. Save, conflict handling, permissions and file ownership belong to the host.
- `UiCodeDiff` expects structured files, hunks and lines; it does not parse patches or fetch Git. Provide real line numbers. Split mode pairs neighboring deletions/additions without fabricating missing source lines. Binary, empty and partial previews are explicit. Very large patches should be paginated or bounded upstream.

## Operations

- `UiCommandPalette`: controlled query/results/loading/error; combobox keyboard navigation, disabled items, Escape and focus restoration. Register global shortcuts and perform navigation in the host. Do not treat a stale search result as permission to act.
- `UiFilterBar`: compose field controls, saved views, summary, reset and save intents. Storage and query execution stay outside the kit.
- `UiNotificationList`: open and mark-read are separate callbacks. Merely rendering does not mark anything read. `statusLabel` is optional visible text; `tone` only changes presentation.
- `UiScheduleEditor`: controlled interval/daily/weekly input with ISO weekdays (Monday 1, Sunday 7), explicit time zone and optional host-computed next-run preview. Clearing the interval produces `null`. Validate positive whole minutes, nonempty selected weekdays, time, timezone and daylight-saving rules before saving. This component never runs a timer or computes recurrence.
- `UiBoard`: generic columns and arbitrary cards for pipelines/queues. Supply accessible move actions or native selects. The kit does not reorder data, interpret workflow rules or persist moves.

## Adoption boundary

The reference application was inspected to discover presentation patterns. It has not been migrated. Upgrade a consumer using a versioned dependency, integrate host adapters, and verify its real routing, stream lifecycle, permissions and persistence separately. English built-in labels follow this package's current convention; localization of all fixed strings remains future work.

## Grouped agent questions

Use `UiAgentQuestions` in a message's `contentAfter` slot to collect a complete
batch before the agent continues. Each question accepts exactly one preset or a
custom text answer. No option is selected automatically; whitespace-only custom
answers do not count. The submit callback receives discriminated answers keyed by
question ID, with option IDs or trimmed custom text.

Keep request, question and option IDs stable and unique. Change `requestId` when
replacing the question set. The component owns transient drafts, prevents duplicate
submissions, retains drafts after rejection and locks the form after success.
The consumer must persist the submitted batch and handle transport/idempotency;
remounting the component does not restore a previously completed request.

The transcript placement keeps long question groups scrollable without reducing
the height available to the normal message composer. The form may also be used
standalone, outside another HTML form.
