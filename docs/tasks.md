# Task tracker integration

The [live task tracker](https://errogaht.github.io/erp-ui-kit/#tasks) demonstrates three public components: `UiTaskList`, `UiTaskDetail`, and `UiRichTextEditor`. They use fictional English data and have no API calls, persistence, workflow rules, or permissions.

```tsx
import { UiTaskList, UiTaskDetail } from '@errogaht/erp-ui-kit'
import type { UiTaskRecord, UiTaskStatusOption, UiTaskComment } from '@errogaht/erp-ui-kit'
import '@errogaht/erp-ui-kit/style.css'

const statuses: UiTaskStatusOption[] = [
  { value: 'todo', label: 'To do', tone: 'neutral' },
  { value: 'doing', label: 'In progress', tone: 'accent' },
  { value: 'done', label: 'Done', tone: 'success' },
]

// The host loads records and handles navigation and persistence.
<UiTaskList
  tasks={tasks}
  statuses={statuses}
  onTaskOpen={task => openTask(task.id)}
  onCreateTask={() => createTask()}
/>

<UiTaskDetail
  task={activeTask}
  statuses={statuses}
  people={people}
  comments={comments}
  activity={activity}
  onChange={patch => updateTask(activeTask.id, patch)}
  onAddComment={content => postComment(activeTask.id, content)}
/>
```

`UiTaskList` filters, sorts and paginates the supplied `tasks` array in the browser. Pass the full intended list; for a server-paged source, compose a host-specific list around the same task data contract. The `statuses` array should cover every task status, including board columns; statuses with `tone: 'success'` count as completed. Optional bulk changes call `onBulkStatusChange(ids, status)`.

`UiTaskDetail` shows title, status, priority, assignee, due date, description, subtasks, attachments, comments and activity. Optional callbacks enable editing. The host validates transitions, permission checks, uploads and persistence. Due dates and timestamps should be ISO strings.

Descriptions and comments are `UiRichTextContent` (Tiptap JSON). `UiRichTextEditor` exposes structured JSON through `onChange` and renders the same data read-only. It supports headings, bold, italic, underline, strike, lists, quotes, inline code, links, undo and redo. Store the JSON as data; do not inject unsanitized HTML into the page. The editor runs client-side and uses `immediatelyRender: false` for React SSR compatibility.
