# AI chat integration

[`UiAiChat`](https://errogaht.github.io/erp-ui-kit/#ai-chat) is a complete, controlled assistant interface. It has no backend or storage. The application supplies conversation history and messages, then implements the callbacks that match its capabilities.

```tsx
import { UiAiChat } from '@errogaht/erp-ui-kit'
import type { UiAiChatConversation, UiAiChatMessage } from '@errogaht/erp-ui-kit'
import '@errogaht/erp-ui-kit/style.css'

const conversations: UiAiChatConversation[] = [{ id: 'first', title: 'Planning' }]
const messages: UiAiChatMessage[] = [
  { id: 'm1', role: 'assistant', content: 'How can I help?' },
]

<UiAiChat
  conversations={conversations}
  activeConversationId="first"
  messages={messages}
  models={[{ id: 'standard', label: 'Standard' }]}
  selectedModelId={modelId}
  onModelChange={setModelId}
  efforts={[{ id: 'low', label: 'Low' }, { id: 'high', label: 'High' }]}
  selectedEffortId={effortId}
  onEffortChange={setEffortId}
  isGenerating={false}
  onNewConversation={() => createConversation()}
  onSelectConversation={id => selectConversation(id)}
  onSend={(text, files) => sendToAgent(text, files)}
/>
```

The host should append the user message when `onSend` runs, then append an assistant message with `status: 'streaming'`. Update its `content` as tokens arrive and set `status: 'complete'` when finished. Set `isGenerating` while a request is active and wire `onStop` to cancel it. A failed request can set `error` and/or `status: 'error'` on the affected message. Keep conversation IDs and message IDs stable across updates.

The file picker, drag and drop, and clipboard paste provide `File` objects through `onSend`. The host validates, uploads and stores them. For existing files, provide `attachments` with a URL. Provide source links through `sources`; URLs are rendered as external links. Markdown uses `react-markdown` and `remark-gfm`; raw HTML is not enabled. Avoid placing secrets in message text.

Optional callbacks reveal their corresponding actions: `onRegenerate`, `onEditMessage`, `onFeedback`, `onRenameConversation`, `onDeleteConversation`, `onModelChange`, and `onEffortChange`. Model and effort are independent controlled choices using the same `UiSelect` geometry as other Kit forms; the host maps them to provider-specific request parameters. The component also includes history search, a keyboard-contained mobile history drawer, code/message copying, a latest-message jump, keyboard send, empty-state suggestions and accessible loading feedback. Labels are English in the public kit; a future localization prop can be added if a consumer needs another language.
