# Changelog

## 0.7.0 — 2026-09-27

### Added

- 17 presentation components for retained workspaces, agent activity, documents and operations; 88 catalog components in total.
- Retained document tabs with dirty/close requests, keyboard navigation and nested activity context; resizable panes, tree, breadcrumbs and slot-based workspace.
- Inspectable execution entries, prompt explanations, asynchronous approval cards and host-controlled voice states.
- Plain Markdown rendering/editing and structured split/unified code diff, including binary and partial previews.
- Command palette, saved-view filter bar, notification list, recurrence editor and generic board.
- Interactive fictional examples, route-pattern audit and integration guide.
- Automated behavior tests and a CI test gate.

### Improved

- AI chat supports embedded sessions, contextual extension slots, controlled drafts and structured activity.
- Asynchronous sends retain drafts/files after failure and protect newer conversations from late completion.
- Shared dialogs follow retained-document activity, including nested workspaces.

### Compatibility

Existing APIs remain available. This release adds no application API, router, recording or execution dependency. Consumers must still integrate their own persistence, stream lifecycle, authorization and localization. No consumer application was migrated as part of this release.
