import type { UiRichTextContent } from './UiRichTextEditor'

/** Data contracts contain no persistence or project-specific workflow rules. */
export type UiTaskPerson = { id: string; name: string; initials?: string }
export type UiTaskPriority = 'lowest' | 'low' | 'medium' | 'high' | 'critical'
export type UiTaskKind = 'task' | 'bug' | 'story' | 'epic'
export type UiTaskStatusOption = { value: string; label: string; tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }
export type UiTaskSubtask = { id: string; key?: string; title: string; done: boolean }
export type UiTaskAttachment = { id: string; name: string; detail?: string; url?: string }
export type UiTaskRecord = {
  id: string
  key: string
  title: string
  kind: UiTaskKind
  status: string
  priority: UiTaskPriority
  assignee?: UiTaskPerson
  reporter?: UiTaskPerson
  description?: UiRichTextContent
  labels?: readonly string[]
  project?: string
  sprint?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  estimate?: string
  subtasks?: readonly UiTaskSubtask[]
  attachments?: readonly UiTaskAttachment[]
}
export type UiTaskComment = { id: string; author: UiTaskPerson; createdAt: string; content: UiRichTextContent; edited?: boolean }
export type UiTaskActivity = { id: string; actor: UiTaskPerson; action: string; at: string }
