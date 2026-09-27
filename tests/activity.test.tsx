import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UiApprovalCard, UiExecutionLog, UiVoiceControl, UiPromptActions } from '../src/UiAgentActivity'
import { UiAiChat } from '../src/UiAiChat'

describe('agent actions', () => {
  it('requires consent, prevents duplicate decisions and keeps failures recoverable', async () => {
    // Slow backend acknowledgement must not create a second approval.
    const user = userEvent.setup()
    let reject!: (error: Error) => void
    const decision = vi.fn(
      () =>
        new Promise<void>((_, fail) => {
          reject = fail
        }),
    )
    render(
      <UiApprovalCard
        requestId="r1"
        title="Apply rule"
        description="Affects the default queue."
        acknowledgement="I reviewed the rule"
        onDecision={decision}
      />,
    )
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled()
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    await user.click(screen.getByRole('button', { name: 'Submitting…' }))
    expect(decision).toHaveBeenCalledTimes(1)
    await act(async () => reject(new Error('Temporary failure')))
    expect(screen.getByRole('alert')).toHaveTextContent('Temporary failure')
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled()
  })
  it('resets consent when the proposal identity changes and hides completed actions', async () => {
    const user = userEvent.setup(),
      props = {
        title: 'Proposal',
        description: 'Review me',
        acknowledgement: 'Reviewed',
        onDecision: vi.fn(),
      }
    const { rerender } = render(<UiApprovalCard requestId="a" {...props} />)
    await user.click(screen.getByRole('checkbox'))
    rerender(<UiApprovalCard requestId="b" {...props} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    rerender(<UiApprovalCard requestId="b" status="expired" {...props} />)
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull()
  })
  it('retains disclosure expansion on streaming updates and renders output as literal text', () => {
    // Tool output must neither create HTML nor reopen an explicitly closed card.
    const entry = {
      id: 'command',
      kind: 'command' as const,
      title: 'Build',
      status: 'running' as const,
      output: '<button>run</button>',
    }
    const { container, rerender } = render(<UiExecutionLog entries={[entry]} />)
    const detail = container.querySelector('details')!
    fireEvent.click(container.querySelector('summary')!)
    expect(detail.open).toBe(true)
    expect(screen.queryByRole('button', { name: 'run' })).toBeNull()
    rerender(
      <UiExecutionLog entries={[{ ...entry, output: '<button>run</button>\nDone', status: 'success' }]} />,
    )
    expect(detail.open).toBe(true)
    expect(screen.getByLabelText('Output')).toHaveTextContent('Done')
  })
  it('has no recording side effect on mount and keeps disabled preset explanations usable', async () => {
    const user = userEvent.setup(),
      start = vi.fn(),
      select = vi.fn()
    render(
      <>
        <UiVoiceControl
          state="idle"
          disabledReason="No microphone"
          onStart={start}
          onStop={() => {}}
          onCancel={() => {}}
        />
        <UiPromptActions
          items={[
            {
              id: 'publish',
              label: 'Publish',
              description: 'Publishes the report.',
              disabledReason: 'Review required.',
            },
          ]}
          onSelect={select}
        />
      </>,
    )
    expect(start).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Dictate' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'About Publish' }))
    expect(screen.getByRole('note')).toHaveTextContent('Review required.')
    expect(select).not.toHaveBeenCalled()
  })
})
describe('async chat drafts', () => {
  const base = {
    conversations: [],
    messages: [],
    onNewConversation: () => {},
    onSelectConversation: () => {},
    showHistory: false,
  }
  it('keeps draft and attachments after rejection, then clears them after acknowledgement', async () => {
    // A send failure must be retryable without retyping or reattaching files.
    const user = userEvent.setup(),
      send = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(undefined)
    render(<UiAiChat {...base} activeConversationId="a" onSend={send} />)
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Review this')
    await user.upload(
      screen.getByLabelText('Attach files', { selector: 'input' }),
      new File(['notes'], 'notes.txt', { type: 'text/plain' }),
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline')
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('Review this')
    expect(screen.getByRole('button', { name: 'Remove notes.txt' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(''))
    expect(screen.queryByRole('button', { name: 'Remove notes.txt' })).toBeNull()
  })
  it('does not erase a different conversation draft after a late send completes', async () => {
    const user = userEvent.setup()
    let finish!: () => void
    const send = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    const { rerender } = render(<UiAiChat {...base} activeConversationId="a" onSend={send} />)
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'First')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    rerender(<UiAiChat {...base} activeConversationId="b" onSend={send} />)
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Second')
    await act(async () => finish())
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('Second')
  })
  it('does not clear a newly entered identical draft after leaving and returning to a session', async () => {
    // Identity alone is insufficient: a later visit has a separate draft lifetime.
    const user = userEvent.setup()
    let finish!: () => void
    const send = () => new Promise<void>(resolve => { finish = resolve })
    const { rerender } = render(<UiAiChat {...base} activeConversationId="a" onSend={send} />)
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Same text')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    rerender(<UiAiChat {...base} activeConversationId="b" onSend={send} />)
    rerender(<UiAiChat {...base} activeConversationId="a" onSend={send} />)
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Same text')
    await act(async () => finish())
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('Same text')
  })
  it('allows host dictation to append to a controlled draft and shows activity inside a message', async () => {
    const user = userEvent.setup()
    function Host() {
      const [draft, setDraft] = useState('Typed')
      return (
        <UiAiChat
          {...base}
          draftValue={draft}
          onDraftChange={setDraft}
          onSend={() => {}}
          messages={[
            {
              id: 'a',
              role: 'assistant',
              content: 'Done',
              activity: [{ id: 'tool', title: 'Read queue', status: 'success', kind: 'tool' }],
            },
          ]}
          composerActions={
            <button type="button" onClick={() => setDraft((previous) => previous + ' dictated')}>
              Append voice
            </button>
          }
        />
      )
    }
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Append voice' }))
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('Typed dictated')
    expect(screen.getByText('Read queue')).toBeInTheDocument()
    expect(screen.queryByLabelText('Conversation history')).toBeNull()
  })
})
