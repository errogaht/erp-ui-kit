# Agent chat layout review — 0.7.1

## Shared layout contract

The header, prompt toolbar, message content, activity cards, pending decision and composer share one horizontal gutter: 20px on desktop and 12px on mobile. Messages and composer no longer have independent 900px limits. Avatars sit in the author row so message cards use the same edges as the composer.

The pending decision keeps its actions beside the content when space permits and stacks below 600px container width. The latest-message control is anchored to a dedicated transcript wrapper; variable-height decisions cannot move it over approval buttons. Native scrolling and existing public APIs remain intact.

## Verification

- Visually inspected embedded chat at 1920px and 1440px viewport widths, plus 390px mobile.
- Inspected standalone chat with history, model controls, Markdown table and code block at 1440px.
- Checked expanded execution details, approval checkbox enabling its action, textarea focus and latest-message navigation.
- Measured matching message/approval/composer left edges and widths: 1300px at the wide desktop check, 330px on mobile. Mobile document width matched the 390px viewport.
- All 25 automated behavior tests pass; typecheck, catalog coverage (88 components), library build and docs build pass.
- Docs build retains the existing large-bundle warning. No application consumers were upgraded.
