# Component catalog

Import components from `@errogaht/erp-ui-kit`. Import `@errogaht/erp-ui-kit/style.css` once and place application UI inside `.ui-kit-surface`. The [live catalog](https://errogaht.github.io/erp-ui-kit/) shows representative states. Props and types are defined in the exported TypeScript declarations.

| Area | Exports | Use |
| --- | --- | --- |
| Workspace | `UiWorkspace`, `UiWorkspaceTabs`, `UiResizableSplit`, `UiTree`, `UiBreadcrumbs` | Retained documents, resizable panes and keyboard navigation. |
| Agent activity | `UiExecutionLog`, `UiPromptActions`, `UiApprovalCard`, `UiVoiceControl`, `UiAgentQuestions` | Inspectable execution, presets, decisions and recording states. |
| Documents | `UiMarkdown`, `UiMarkdownEditor`, `UiCodeDiff` | Plain Markdown and structured split/unified code changes. |
| Operations | `UiCommandPalette`, `UiFilterBar`, `UiNotificationList`, `UiScheduleEditor`, `UiBoard` | Search, saved views, notifications, recurrence input and generic pipelines. |
| Layout | `UiContainer`, `UiGrid`, `UiCell`, `UiStack`, `UiInline`, `UiSplit` | Responsive page and card composition. |
| Actions | `UiButton`, `UiLinkButton`, `UiIconButton`, `UiActionTile`, `UiFormActionRow` | Native actions and aligned field actions. |
| Forms | `UiField`, `UiInput`, `UiSelect`, `UiTextarea`, `UiChoice`, `UiCombobox`, `UiAsyncCombobox`, `UiBadgeSelect` | Labels, validation, native controls and searchable selectors. |
| Navigation | `UiSegmented`, `UiTabs`, `UiPagination`, `UiPopoverMenu`, `UiDisclosure`, `UiSidebarNav`, `UiTopNav` | View switching and disclosure. |
| Feedback | `UiToaster`, `UiBadge`, `UiNotice`, `UiProgress`, `UiSkeleton`, `UiEmpty`, `UiHelp`, `UiDialog` | State and guidance. |
| Information | `UiInfoTip`, `UiCallout`, `UiEmptyState`, `UiSectionHeading` | Clickable contextual help, explanatory blocks, actionable empty states, and section titles. |
| Records | `UiCard`, `UiPanel`, `UiAsidePanel`, `UiMetric`, `UiFacts`, `UiTable`, `UiItemRow`, `UiLineItem`, `UiValueCard`, `UiFile`, `UiTimeline`, `UiPhotoUpload`, `UiAvatarUpload` | Data and record structure. |
| Inbox | `UiInboxCard`, `UiMessage`, `UiComposer`, `UiReplySettings`, `UiConversationCanvas`, `UiQuote`, `UiAttachmentLink`, `UiImagePreview`, `UiStatusLine`, `UiAvatar` | Conversations and message history. |
| AI chat | `UiAiChat` | Complete assistant surface: conversation history/search, model and effort choice, Markdown/code, file attachments, sources, streaming state, stop, retry, edit, copy and feedback. |
| Task tracker | `UiTaskList`, `UiTaskDetail`, `UiRichTextEditor` | Filtered list and board, task details, subtasks, attachments, combined comments/audit/worklog feed and formatted images. |
| Audit | `UiHistoryEvent`, `UiChangeList`, `UiChangeRow`, `UiComparison` | Changes and before/after values. |
| Admin patterns | `UiCrudScreen` | Controlled CRUD template with table, dialog editing, validation, import/export and batch actions. |
| Icons | `UiBootstrapIcon`, `UiIcon` | Complete pinned Bootstrap Icons set and compatibility names. |

For icon discovery, use the [searchable gallery](https://errogaht.github.io/erp-ui-kit/#icons) or `npm run icons:search -- <concept>`. The search accepts English icon names and common concepts such as `chat`, `payment`, and `delivery`. `UiBootstrapIcon` accepts a typed official name; its CSS and font ship with the package.

`UiInput`, `UiSelect`, `UiCombobox`, and `UiAsyncCombobox` share a 36px regular height and a 28px compact height (`density="compact"`). Use `UiField` for a matching label line, errors and `help={<UiInfoTip label="About this field">…</UiInfoTip>}`. `UiTextarea` is intentionally multiline. Place hints or errors below the control and align form rows by their label and control, not by the bottom of optional hint text.

## Agent decision path

1. Search this table and the [live catalog](https://errogaht.github.io/erp-ui-kit/).
2. Prefer composition of existing parts. Keep app-specific labels and record data in the host.
3. If a reusable element is missing, add it to this repository, export it in `src/index.ts`, document it here and add a live example.
4. Release a versioned tag and update each consumer to that tag. Test the changed screens before deployment.

The library is intentionally scoped to presentation. It does not own fetches, permissions, routing, currency formatting, or application state.

`UiAiChat` is controlled: pass `conversations`, `messages`, `activeConversationId`, `isGenerating`, and callbacks for the actions your host supports. `onSend(text, files)` receives the text and selected `File` objects; upload and AI streaming belong to the host. The component holds only the unsent draft, selected files, search query and edit UI. Omit an optional callback to hide its action. See the [interactive local demo](https://errogaht.github.io/erp-ui-kit/#ai-chat) and [integration guide](ai-chat.md).

The [admin CRUD template](admin-patterns.md) composes fields, navigation and a compact table for entity management.

The task tracker has a [live list and detail demo](https://errogaht.github.io/erp-ui-kit/#tasks) and a [data and integration guide](tasks.md). The host supplies task records and persists patches/comments. `UiRichTextEditor` returns Tiptap JSON; both read-only comments and editing use the same document renderer.

See the [workspace integration guide](workspace.md) for retained-document activity, AI-chat extension slots, asynchronous send recovery and host boundaries. The exported `useUiDocumentActive()` hook is nonvisual and is not included in the component count.

## Visual feedback

The desktop catalog includes [Agentation](https://www.agentation.com/). Open its toolbar in the bottom-right corner, select an element, add a note, and copy the feedback into your agent conversation. Notes stay in your browser; no MCP endpoint or webhook is configured. All section anchors share the same feedback collection. Global Agentation shortcuts are disabled to preserve the interactive examples' keyboard behavior. This integration belongs to the docs site only and is not exported by the UI library.

## Toast notifications

Mount `UiToaster` once at the application root, outside retained document panels, and use `uiToast.success`, `.info`, `.warning`, `.error`, `.loading`, `.promise` or `uiToast(message)`. The [live toast examples](https://errogaht.github.io/erp-ui-kit/#toasts) cover all six `position` values: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`. Sonner handles stacking, dismissal, announcements and timers; UI Kit provides scoped visual styling. Optional actions, descriptions, duration, visible count and per-toast position overrides use the Sonner API. To target multiple hosts, pair `UiToaster id` with the toast's `toasterId`. Message contents, async work and action callbacks belong to the consuming application.

```tsx
<UiToaster position="top-right" />
// Call from a user action or completed operation, not during render.
uiToast.success('Dispatch saved', { description: 'Ready for review.' })
```

## Board movement

`UiBoard` is controlled. Supply `onMove({ itemId, fromColumnId, toColumnId })` and update `columns` when the host accepts a move. Each item can supply `label` for accessible movement controls. Item and column IDs must be unique within the board. Cross-column dragging starts from the grip; card inputs and actions retain their normal behavior. `dragAndDrop={false}` hides the grip while keeping the keyboard/touch move selects. Omitting `onMove` keeps a static board with no movement controls. Same-column and foreign drops are ignored; ordering within a column is not changed by this API. The host owns validation, persistence and errors.

## Grouped agent questions

`UiAgentQuestions` collects one preset or custom answer per question and submits the complete group once. All questions are required; no answer is preselected. Rejected submissions retain drafts, successful submissions lock the group. Change `requestId` when replacing questions. The host owns persistence and transport. Place the card in `UiAiChatMessage.contentAfter` to keep long forms in the scrollable transcript.
