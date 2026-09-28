# Changelog

## 0.9.2 — 2026-09-28

- Place toast dismissal inside the top-right corner in every screen position; reserve space so text cannot overlap the close control.

## 0.9.1 — 2026-09-27

### Improved

- Agent questions use separate bordered cards, larger numbered headings and divided answer bodies. Presets and custom input are visibly grouped on desktop and mobile.

## 0.9.0 — 2026-09-27

- Add `UiToaster` and `uiToast`, styled Sonner notifications with six positions, actions and async states.
- Add controlled cross-column `UiBoard` moves, an optional drag handle and keyboard/touch move controls. Static boards remain unchanged without `onMove`.
- Use status badges in task filter and bulk menus; align task kind icons with row selection.
- Simplify info triggers to a single circle glyph and space the icon gallery's status examples.
- Preserve the 0.7.1 agent chat layout fixes.


## 0.8.0 — 2026-09-27

### Added

- `UiAgentQuestions`: required question groups with preset or custom answers, progress, atomic asynchronous submission, retry and completed states.
- `UiAiChatMessage.contentAfter` for interactive message content in the scrollable transcript.
- Interactive question-group demo, mobile layout and keyboard/transport regression coverage. Catalog now contains 89 components.

Existing chat APIs remain compatible. Question transport and persistence belong to the consumer.

## 0.7.1 — 2026-09-27

### Fixed

- Unified AI chat gutters and full-width messages, activity, approval and composer.
- Compact prompt toolbar and responsive approval layout preserve more transcript space.
- Message avatars share the author row; composer uses a single focus outline.
- Latest-message control stays within the transcript instead of overlapping approval actions.
- Existing public APIs remain unchanged.

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
