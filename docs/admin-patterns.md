# Admin patterns

The [live CRUD screen](https://errogaht.github.io/erp-ui-kit/#admin-patterns) composes the same UI Kit fields, table, dialog, pagination, badges and navigation. It is a reusable screen template, not a data service.

```tsx
import { UiCrudScreen, UiBadge } from '@errogaht/erp-ui-kit'
import type { UiCrudRecord } from '@errogaht/erp-ui-kit'

<UiCrudScreen
  title="Records"
  rows={records}
  columns={[
    { key: 'id', label: 'Reference' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', render: value => <UiBadge>{String(value)}</UiBadge> },
  ]}
  fields={[
    { key: 'id', label: 'Reference', required: true },
    { key: 'name', label: 'Name', required: true },
    { key: 'status', label: 'Status', type: 'select', required: true, options: statuses },
  ]}
  validate={(draft, editingId) =>
    records.some(row => row.id === draft.id && row.id !== editingId)
      ? 'Reference already exists.' : undefined
  }
  onCreate={draft => saveNewRecord(draft)}
  onUpdate={(id, draft) => saveRecord(id, draft)}
  onDelete={id => deleteRecord(id)}
  onImport={file => importRecords(file)}
  onExport={rows => exportRecords(rows)}
/>
```

`rows` is controlled. The host loads records and updates them after successful writes. The screen handles local search, sort, page selection, edit drafts and native required-field validation. Narrow containers show labeled record cards with visible edit/delete actions, a sort control and page selection. `validate` can keep the dialog open with a record-specific error. `bulkActions` receives selected rows; deletion asks for confirmation. `onImport` gets a `File` and `onExport` receives either selected rows or the filtered list. The host decides file format, parsing, permissions and API calls; set `importAccept` to match its accepted format. The demo implements a local JSON round trip.

`UiPhotoUpload` supplies a chosen image `File` and previews it. `UiAvatarUpload` produces a circular 256px PNG after dragging and resizing a crop circle directly over the photo. The live preview follows the selection, and arrow keys provide keyboard adjustment. Both leave upload and storage to the host. `UiSidebarNav` and `UiTopNav` receive link items and a controlled `activeId`.
