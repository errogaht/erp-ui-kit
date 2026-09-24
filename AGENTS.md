# ERP UI Kit agent guide

This repository is the source of truth for reusable React ERP interface components.

- Check `docs/catalog.md` and `src/index.ts` before adding a component.
- Change shared behavior in `src/`; do not repair one consuming page with a local CSS override.
- Keep business data, URLs, authorization, API calls, and app routing out of this package.
- Use English for API names, built-in labels, documentation, examples, and comments. Put all sample data in an invented, generic operations context.
- Every new component needs an export, scoped `ui-kit-*` styles, a catalog entry, and a visible example in the docs site.
- Keep native semantics, keyboard use, responsive layout, and CSS isolation working.
- Run `npm run typecheck`, `npm run build`, and `npm run build:docs` before release.
- Bump the version with semantic versioning. Tag `vX.Y.Z` only after the consumer impact is understood. The CI workflow publishes the catalog and attaches an installable package tarball to a GitHub release.
- Update consumers via a versioned dependency. Never install `main` in production.
