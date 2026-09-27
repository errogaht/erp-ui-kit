# Catalog feedback — 2026-09-27

Version 0.9.0 preserves the parallel 0.8.0 question-group release.

- Task filter, bulk and detail status controls reuse `UiBadgeSelect`. Portal keyboard events are handled once.
- Task kind glyphs align with row selection. The icon gallery composes badge/status spacing with `UiStack`.
- Info disclosures retain keyboard/focus behavior with a single circle glyph.
- `UiBoard` adds controlled cross-column moves. `onMove` enables movement, `dragAndDrop={false}` disables pointer dragging, and the select remains available for keyboard/touch users. No API calls or optimistic persistence belong to the kit.
- `UiToaster`/`uiToast` wrap Sonner 2.0.8 with scoped kit styles. Six positions, descriptions, actions, async notifications and dismissal are shown in the catalog. Mount at the app root, outside retained tabs.

Validation: targeted regression tests cover moves, ignored foreign/same-column drops, disabled/static boards, badge filtering and keyboard handling, and info disclosure focus. Browser checks cover real dragging, status colors, all six toast positions, close/Undo, reload-free interaction and desktop/mobile screenshots. Existing component coverage and release checks also run before publication. Consumer applications require an explicit versioned dependency upgrade; none is changed by this release.
