# ERP UI Kit agent guide

This repository is the source of truth for reusable React ERP interface components.

- Check `docs/catalog.md` and `src/index.ts` before adding a component.
- For icons, search the gallery at `https://errogaht.github.io/erp-ui-kit/#icons` or run `npm run icons:search -- <English concept>`. Use `UiBootstrapIcon` for new work and keep `UiIcon` for existing consumers. Prefer an existing official glyph over adding project-specific SVGs.
- Change shared behavior in `src/`; do not repair one consuming page with a local CSS override.
- Keep business data, URLs, authorization, API calls, and app routing out of this package.
- Use English for API names, built-in labels, documentation, examples, and comments. Put all sample data in an invented, generic operations context.
- Every new component needs an export, scoped `ui-kit-*` styles, a catalog entry, and a visible example in the docs site. `npm run check:catalog` verifies complete coverage.
- Keep native semantics, keyboard use, responsive layout, and CSS isolation working.
- Run `npm run typecheck`, `npm run build`, and `npm run build:docs` before release.
- Bump the version with semantic versioning. Tag `vX.Y.Z` only after the consumer impact is understood. The CI workflow publishes the catalog and attaches an installable package tarball to a GitHub release.
- Update consumers via a versioned dependency. Never install `main` in production.
