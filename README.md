# ERP UI Kit

A compact React component library for operational and ERP interfaces. The library includes layout, form controls, data presentation, inbox, conversation, and audit history primitives. It contains no application API calls or customer data.

**[Browse the component catalog](https://errogaht.github.io/erp-ui-kit/)** · [Agent guide](AGENTS.md) · [API index](docs/catalog.md)

## Install

The initial public release is distributed as a versioned GitHub dependency:

```sh
npm install github:errogaht/erp-ui-kit#v0.1.0
```

Import the package and its CSS once in the host app:

```tsx
import { UiButton, UiCard, UiField, UiInput } from '@errogaht/erp-ui-kit'
import '@errogaht/erp-ui-kit/style.css'

export function Example() {
  return <div className="ui-kit-surface"><UiCard title="Operations"><UiField label="Reference">{({ id }) => <UiInput id={id} />}</UiField><UiButton type="button">Save</UiButton></UiCard></div>
}
```

React and React DOM 19 are peer dependencies. The searchable combobox uses `react-select`. The host controls business state, localization, navigation, and data access. `UiComparison` accepts `beforeLabel` and `afterLabel` for localization.

For a new version, update the tag in `package.json` of the consuming project and run `npm install`. A GitHub release also contains the built npm tarball. The package can move to the public npm registry later without changing component imports.

## Development

```sh
npm ci
npm run typecheck
npm run build
npm run build:docs
```

Use the [agent guide](AGENTS.md) when adding components. The docs site uses the same source modules as the package so visual examples cannot drift from published components.
