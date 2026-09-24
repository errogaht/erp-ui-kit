# Component catalog

Import components from `@errogaht/erp-ui-kit`. Import `@errogaht/erp-ui-kit/style.css` once and place application UI inside `.ui-kit-surface`. The [live catalog](https://errogaht.github.io/erp-ui-kit/) shows representative states. Props and types are defined in the exported TypeScript declarations.

| Area | Exports | Use |
| --- | --- | --- |
| Layout | `UiContainer`, `UiGrid`, `UiCell`, `UiStack`, `UiInline`, `UiSplit` | Responsive page and card composition. |
| Actions | `UiButton`, `UiLinkButton`, `UiIconButton`, `UiActionTile`, `UiFormActionRow` | Native actions and aligned field actions. |
| Forms | `UiField`, `UiInput`, `UiSelect`, `UiTextarea`, `UiChoice`, `UiCombobox`, `UiAsyncCombobox` | Labels, validation, native controls and searchable selectors. |
| Navigation | `UiSegmented`, `UiTabs`, `UiPagination`, `UiPopoverMenu`, `UiDisclosure` | View switching and disclosure. |
| Feedback | `UiBadge`, `UiNotice`, `UiProgress`, `UiSkeleton`, `UiEmpty`, `UiHelp`, `UiDialog` | State and guidance. |
| Information | `UiInfoTip`, `UiCallout`, `UiEmptyState`, `UiSectionHeading` | Clickable contextual help, explanatory blocks, actionable empty states, and section titles. |
| Records | `UiCard`, `UiPanel`, `UiAsidePanel`, `UiMetric`, `UiFacts`, `UiTable`, `UiItemRow`, `UiLineItem`, `UiValueCard`, `UiFile`, `UiTimeline` | Data and record structure. |
| Inbox | `UiInboxCard`, `UiMessage`, `UiComposer`, `UiConversationCanvas`, `UiQuote`, `UiAttachmentLink`, `UiImagePreview`, `UiStatusLine`, `UiAvatar` | Conversations and message history. |
| AI chat | `UiAiChat` | Complete assistant surface: conversation history/search, model choice, Markdown/code, file attachments, sources, streaming state, stop, retry, edit, copy and feedback. |
| Audit | `UiHistoryEvent`, `UiChangeList`, `UiChangeRow`, `UiComparison` | Changes and before/after values. |
| Icons | `UiIcon`, `UiBootstrapIcon` | Existing stroke icons and the complete pinned Bootstrap Icons set. |

For icon discovery, use the [searchable gallery](https://errogaht.github.io/erp-ui-kit/#icons) or `npm run icons:search -- <concept>`. The search accepts English icon names and common concepts such as `chat`, `payment`, and `delivery`. `UiBootstrapIcon` accepts a typed official name; its CSS and font ship with the package.

`UiInput`, `UiSelect`, `UiCombobox`, and `UiAsyncCombobox` share a 36px regular height and a 28px compact height (`density="compact"`). Use `UiField` for a matching label line, errors and `help={<UiInfoTip label="About this field">…</UiInfoTip>}`. `UiTextarea` is intentionally multiline. Place hints or errors below the control and align form rows by their label and control, not by the bottom of optional hint text.

## Agent decision path

1. Search this table and the [live catalog](https://errogaht.github.io/erp-ui-kit/).
2. Prefer composition of existing parts. Keep app-specific labels and record data in the host.
3. If a reusable element is missing, add it to this repository, export it in `src/index.ts`, document it here and add a live example.
4. Release a versioned tag and update each consumer to that tag. Test the changed screens before deployment.

The library is intentionally scoped to presentation. It does not own fetches, permissions, routing, currency formatting, or application state.

`UiAiChat` is controlled: pass `conversations`, `messages`, `activeConversationId`, `isGenerating`, and callbacks for the actions your host supports. `onSend(text, files)` receives the text and selected `File` objects; upload and AI streaming belong to the host. The component holds only the unsent draft, selected files, search query and edit UI. Omit an optional callback to hide its action. See the [interactive local demo](https://errogaht.github.io/erp-ui-kit/#ai-chat) and [integration guide](ai-chat.md).
