import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UiAgentQuestions } from '../src/UiAgentQuestions'

const questions = [
  { id: 'scope', title: 'Scope?', options: [{ id: 'all', label: 'All queues' }, { id: 'urgent', label: 'Urgent only' }] },
  { id: 'period', title: 'Period?', options: [{ id: 'week', label: 'This week' }] },
]
describe('grouped agent questions', () => {
  it('requires every answer and submits custom text instead of the previous preset', async () => {
    // A group must reach the host atomically, with no default or ambiguous answers.
    const user = userEvent.setup(), submit = vi.fn()
    render(<UiAgentQuestions requestId="one" questions={questions} onSubmit={submit} />)
    expect(screen.getByRole('button', { name: 'Send answers' })).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: 'All queues' }))
    expect(screen.getByRole('button', { name: 'Send answers' })).toBeDisabled()
    await user.type(screen.getByRole('textbox', { name: 'Your answer: Scope?' }), '  North team  ')
    expect(screen.getByRole('radio', { name: 'All queues' })).not.toBeChecked()
    await user.type(screen.getByRole('textbox', { name: 'Your answer: Period?' }), '   ')
    expect(screen.getByRole('button', { name: 'Send answers' })).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: 'This week' }))
    await user.click(screen.getByRole('button', { name: 'Send answers' }))
    expect(submit).toHaveBeenCalledWith([
      { questionId: 'scope', kind: 'custom', text: 'North team' },
      { questionId: 'period', kind: 'option', optionId: 'week' },
    ])
    expect(screen.getByRole('status')).toHaveTextContent('Answers sent')
    expect(screen.getByRole('radio', { name: 'This week' })).toBeDisabled()
  })
  it('locks pending submission and preserves answers after failure for retry', async () => {
    // Slow or failed transport must not duplicate batches or discard user work.
    const user = userEvent.setup()
    let reject!: (error: Error) => void
    const submit = vi.fn().mockImplementationOnce(() => new Promise<void>((_, fail) => { reject = fail }))
    render(<UiAgentQuestions requestId="one" questions={questions} onSubmit={submit} />)
    await user.click(screen.getByRole('radio', { name: 'All queues' }))
    await user.click(screen.getByRole('radio', { name: 'This week' }))
    await user.dblClick(screen.getByRole('button', { name: 'Send answers' }))
    expect(submit).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Sending answers…' })).toBeDisabled()
    await act(async () => reject(new Error('Connection lost')))
    expect(screen.getByRole('alert')).toHaveTextContent('Connection lost')
    expect(screen.getByRole('radio', { name: 'All queues' })).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Send answers' }))
    expect(submit).toHaveBeenCalledTimes(2)
  })
  it('resets drafts for a new request and supports native radio keyboard navigation', async () => {
    // Replacing a request cannot reuse decisions from an earlier question group.
    const user = userEvent.setup(), submit = vi.fn()
    const { rerender } = render(<UiAgentQuestions requestId="one" questions={questions} onSubmit={submit} />)
    await user.click(screen.getByRole('radio', { name: 'All queues' }))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Urgent only' })).toBeChecked()
    rerender(<UiAgentQuestions requestId="two" questions={questions} onSubmit={submit} />)
    expect(screen.getByRole('radio', { name: 'Urgent only' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Send answers' })).toBeDisabled()
  })
})
