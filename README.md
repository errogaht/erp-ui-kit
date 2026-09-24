# ERP UI Kit

A compact React component library for operational and ERP interfaces. The library includes layout, form controls, data presentation, inbox, conversation, and audit history primitives. It contains no application API calls or customer data.

**[Browse the component catalog](https://errogaht.github.io/erp-ui-kit/)** · [Agent guide](AGENTS.md) · [API index](docs/catalog.md)

## Install

The initial public release is distributed as a versioned GitHub dependency:

```sh
npm install github:errogaht/erp-ui-kit#v0.3.0
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

Native inputs and selects and both searchable comboboxes have the same regular and compact heights. `UiField` accepts a clickable `UiInfoTip` in its `help` prop. `UiCallout`, `UiEmptyState`, and `UiSectionHeading` provide reusable information layouts; see the [Information examples](https://errogaht.github.io/erp-ui-kit/#information).

## Bootstrap Icons

`UiBootstrapIcon` supports every name in the pinned official Bootstrap Icons set. The icon font is bundled into the package stylesheet, so no CDN or Bootstrap CSS is required. The older `UiIcon` remains available for existing consumers.

```tsx
import { UiBootstrapIcon, UiButton, UiBadge, UiNotice } from '@errogaht/erp-ui-kit'

<UiBootstrapIcon name="truck" label="Delivery" size={24} />
<UiButton type="button"><UiBootstrapIcon name="floppy" /> Save</UiButton>
<UiBadge tone="success"><UiBootstrapIcon name="check-circle" /> Complete</UiBadge>
<UiNotice tone="warning"><UiBootstrapIcon name="exclamation-triangle" /> Review the details.</UiNotice>
```

Search the [interactive icon catalog](https://errogaht.github.io/erp-ui-kit/#icons) or run `npm run icons:search -- payment` in this repository. Use `label` for a meaningful standalone icon; icons next to visible text are decorative by default. The pinned icon assets are from [Bootstrap Icons](https://icons.getbootstrap.com/) under the MIT license.

For a new version, update the tag in `package.json` of the consuming project and run `npm install`. A GitHub release also contains the built npm tarball. The package can move to the public npm registry later without changing component imports.

## Development

```sh
npm ci
npm run typecheck
npm run build
npm run build:docs
```

Use the [agent guide](AGENTS.md) when adding components. The docs site uses the same source modules as the package so visual examples cannot drift from published components.
