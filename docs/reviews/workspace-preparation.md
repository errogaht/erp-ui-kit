# Workspace preparation

Status: implemented for 0.7.0, reviewed 2026-09-27.

## Scope

Audit the private reference application's routes and extract reusable presentation patterns into this package. Do not migrate the reference application. All catalog data must be invented; no customer content, credentials, private screenshots or API logic belongs in this repository.

## Coverage map

Source audit: all 23 route patterns in the reference route table and their page modules, including nested dialogs. Browser review covered the rendered surfaces below; exceptions are recorded explicitly.

| Surface | Existing kit coverage | Addition / improvement |
| --- | --- | --- |
| Global IDE shell | Sidebar/top navigation, layout, ordinary tabs | Retained document tabs, dirty/close contract, resizable panels, tree, breadcrumbs, workspace composition |
| Today / overview | Cards, metrics, facts, badges, notices | Reusable filter/saved-view bar; compose existing cards for follow-up state |
| Clients / client detail | CRUD, cards, facts, timeline | Shared workspace and filter patterns |
| Projects / project detail | Cards, tables, tasks, tabs | Tree navigation and retained document panels |
| Deals / deal detail | Fields, records, activity | Generic board with arbitrary cards, not task-specific data |
| Tasks / task detail / workcard | List/board, detail, rich text, activity, dialogs | Reusable Markdown rendering, workspace tabs; compose domain status/requirements from existing primitives |
| Session list / session detail / task chat | Basic AI chat | Execution cards, prompt actions, approval/questions composition, voice state control, extension slots in AI chat |
| Inbox / discussion / attachments | Conversation primitives, file/image, composer | Voice control; shared Markdown and activity blocks |
| Knowledge list / article / editor | Sidebar, fields, rich text | Plain Markdown editor + preview; existing rich-text JSON contract remains intact |
| Agents / schedule dialog / run detail | CRUD, fields, progress | Controlled recurrence editor, execution log |
| Outbound list / exact preview | Messages, notices, dialog | Generic approval card with explicit pending state and host-owned decisions |
| Secret metadata / execution / settings | Table, fields, notices, help | Compose existing parts; no secret retrieval or runtime logic |
| Marketplace list / order / conversation / settings | Inbox cards, metrics, facts, forms | Shared board, voice and activity patterns |
| Global search / notifications | Dialog, input, list primitives | Command palette and notification list |
| Session changes | Field comparisons only | Structured code diff with split/unified display and line numbers |

## Implementation boundaries

- Controlled public data/callback APIs. Routing, storage, network, recording, model execution and financial rules stay in consumers.
- New APIs are additive. Keep current `UiTabs` and AI-chat integrations working.
- Keyboard navigation, focus restoration, retained drafts, inactive-panel semantics, responsive overflow, long labels and empty/error states are acceptance requirements.
- Document route activity must be available to consumers to suspend polling and portals; hiding a panel alone is insufficient.
- Prefer composition where a page differs only in business labels.

## Browser coverage and limits

| Route family | Live review |
| --- | --- |
| Today, overview, accounting, settings | Loaded dashboards, filters, forms and disclosures. |
| Clients, projects, deals | Lists/board and representative detail records; task/status controls and related-record panels. |
| Tasks | List and representative detail/workcard, requirements and nested sections. |
| Sessions | List and existing session detail, transcript, tools, prompts, composer, context and empty Git changes. |
| Inbox | List and selected conversation with attachments and reply controls; no messages sent. |
| Wiki | List, filters and a loaded article; editor contract also inspected in source. |
| Agents | Cards, history, settings dialog and existing run detail with input/result disclosures. No configuration saved or run launched. |
| Marketplace | Orders, conversation list, settings and journal. The live order feed was unavailable; order detail variants were inspected in source. |
| Outbound | Empty list; exact-preview detail inspected in source because no live item was available. |
| Secrets | Metadata table only; no secret revealed. |
| Operations | Attempted twice in separate tabs; remained on loading. Runner cards, job table and error states inspected in source. |
| Global shell | Document tabs, explorer, assistant side panel, search dialog and notification center. |

This is a presentation inventory, not a functional certification of the reference application. Reading representative records establishes page patterns; it does not mean every business record or production state was exercised. No reference application files or dependencies were changed.

## Verification

- 17 new exported components; catalog coverage now 88.
- Automated scenarios cover retained drafts, nested activity and portals, protected/denied closes, keyboard focus, tree events, splitter bounds, approvals, streaming disclosures, failed-send recovery, late sends, voice callbacks, search, notification intents, recurrence editing, Markdown safety and code diffs.
- TypeScript checks include source, examples and tests; CI runs the behavior suite.
- Browser visual review at approximately 1920px, 1440px and 390px widths: workspace, embedded assistant, documents/diffs and operations.
- Interactions reviewed: retained text, dirty close dialog, splitter pointer drag, tool panel, split diff, search dialog, disabled-preset help and expanded command output.
- Narrow-pane issue corrected in shared split CSS: explorer stacks above the document below 540px. Shared overlay activity prevents hidden documents from leaving interactive portals visible.
- Public examples contain only fictional operations data. No private screenshots, customer content, credentials or reference API implementation were copied.

## Delivery / adoption

See [workspace integration](../workspace.md) and [release notes](../../CHANGELOG.md). The release is additive; basic tabs, rich-text JSON and existing AI chat APIs remain available. Consumers must adopt a versioned dependency and separately verify real routes, persistence, streaming and permissions. Large logs/diffs remain host-bounded; scheduling and voice controls are presentation only.
