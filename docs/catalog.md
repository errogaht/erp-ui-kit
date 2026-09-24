# Component catalog

Import components from `@errogaht/erp-ui-kit`. Import `@errogaht/erp-ui-kit/style.css` once and place application UI inside `.ui-kit-surface`. The [live catalog](https://errogaht.github.io/erp-ui-kit/) shows representative states. Props and types are defined in the exported TypeScript declarations.

| Area | Exports | Use |
| --- | --- | --- |
| Layout | `UiContainer`, `UiGrid`, `UiCell`, `UiStack`, `UiInline`, `UiSplit` | Responsive page and card composition. |
| Actions | `UiButton`, `UiLinkButton`, `UiIconButton`, `UiActionTile`, `UiFormActionRow` | Native actions and aligned field actions. |
| Forms | `UiField`, `UiInput`, `UiSelect`, `UiTextarea`, `UiChoice`, `UiCombobox`, `UiAsyncCombobox` | Labels, validation, native controls and searchable selectors. |
| Navigation | `UiSegmented`, `UiTabs`, `UiPagination`, `UiPopoverMenu`, `UiDisclosure` | View switching and disclosure. |
| Feedback | `UiBadge`, `UiNotice`, `UiProgress`, `UiSkeleton`, `UiEmpty`, `UiHelp`, `UiDialog` | State and guidance. |
| Records | `UiCard`, `UiPanel`, `UiAsidePanel`, `UiMetric`, `UiFacts`, `UiTable`, `UiItemRow`, `UiLineItem`, `UiValueCard`, `UiFile`, `UiTimeline` | Data and record structure. |
| Inbox | `UiInboxCard`, `UiMessage`, `UiComposer`, `UiConversationCanvas`, `UiQuote`, `UiAttachmentLink`, `UiImagePreview`, `UiStatusLine`, `UiAvatar` | Conversations and message history. |
| Audit | `UiHistoryEvent`, `UiChangeList`, `UiChangeRow`, `UiComparison` | Changes and before/after values. |
| Icons | `UiIcon` | Small consistent stroke icons. |

## Agent decision path

1. Search this table and the [live catalog](https://errogaht.github.io/erp-ui-kit/).
2. Prefer composition of existing parts. Keep app-specific labels and record data in the host.
3. If a reusable element is missing, add it to this repository, export it in `src/index.ts`, document it here and add a live example.
4. Release a versioned tag and update each consumer to that tag. Test the changed screens before deployment.

The library is intentionally scoped to presentation. It does not own fetches, permissions, routing, currency formatting, or application state.
