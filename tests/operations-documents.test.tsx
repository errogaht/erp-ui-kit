import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UiCommandPalette, UiNotificationList, UiScheduleEditor, UiBoard } from '../src/UiOperations'
import { UiMarkdown, UiMarkdownEditor, UiCodeDiff } from '../src/UiDocuments'

describe('search and operations', () => {
  it('focuses search, skips disabled results and restores focus on Escape', async () => {
    // The command palette behaves as one combobox, not a page full of tab stops.
    const user = userEvent.setup(),
      select = vi.fn()
    function Host() {
      const [open, setOpen] = useState(false),
        [query, setQuery] = useState('')
      return (
        <>
          <button onClick={() => setOpen(true)}>Open search</button>
          <UiCommandPalette
            open={open}
            onClose={() => setOpen(false)}
            query={query}
            onQueryChange={setQuery}
            items={[
              { id: 'a', label: 'Alpha' },
              { id: 'b', label: 'Beta', disabled: true },
              { id: 'c', label: 'Charlie' },
            ]}
            onSelect={select}
          />
        </>
      )
    }
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Open search' }))
    const input = screen.getByRole('combobox')
    await waitFor(() => expect(input).toHaveFocus())
    await user.keyboard('{ArrowDown}{Enter}')
    expect(select).toHaveBeenCalledExactlyOnceWith('c')
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Charlie' }).id)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Open search' })).toHaveFocus()
  })
  it('does not select stale results while loading or displaying an error', async () => {
    const user = userEvent.setup(),
      select = vi.fn(),
      props = {
        open: true,
        onClose: () => {},
        query: '',
        onQueryChange: () => {},
        items: [{ id: 'a', label: 'Alpha' }],
        onSelect: select,
      }
    const { rerender } = render(<UiCommandPalette {...props} loading />)
    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{Enter}')
    expect(select).not.toHaveBeenCalled()
    rerender(<UiCommandPalette {...props} error="Search unavailable" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Search unavailable')
    expect(screen.queryByRole('option')).toBeNull()
  })
  it('keeps notification opening independent of marking read', async () => {
    const user = userEvent.setup(),
      open = vi.fn(),
      read = vi.fn()
    render(
      <UiNotificationList
        items={[{ id: 'a', title: 'Review ready', unread: true }]}
        onOpen={open}
        onMarkRead={read}
      />,
    )
    expect(read).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Review ready' }))
    expect(open).toHaveBeenCalledWith('a')
    expect(read).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Mark Review ready as read' }))
    expect(read).toHaveBeenCalledWith('a')
  })
  it('uses ISO weekdays and disables recurrence when scheduling is off', async () => {
    const user = userEvent.setup(),
      change = vi.fn(),
      schedule = {
        enabled: true,
        kind: 'weekly' as const,
        everyMinutes: 30,
        time: '09:00',
        weekdays: [1],
        timezone: 'Etc/UTC',
      }
    const { rerender } = render(
      <UiScheduleEditor
        value={schedule}
        onChange={change}
        timezones={[{ value: 'Etc/UTC', label: 'UTC' }]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Sunday' }))
    expect(change).toHaveBeenCalledWith({ ...schedule, weekdays: [1, 7] })
    rerender(
      <UiScheduleEditor
        value={{ ...schedule, enabled: false }}
        onChange={change}
        timezones={[{ value: 'Etc/UTC', label: 'UTC' }]}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Repeat' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Monday' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Enable scheduled runs' })).toBeEnabled()
  })
  it('renders empty board lanes and retains native controls inside cards', async () => {
    const user = userEvent.setup(),
      click = vi.fn()
    render(
      <UiBoard
        label="Pipeline"
        columns={[
          { id: 'a', title: 'Intake', items: [] },
          {
            id: 'b',
            title: 'Review',
            items: [{ id: 'one', content: <button onClick={click}>Open request</button> }],
          },
        ]}
      />,
    )
    expect(screen.getByText('No items.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open request' }))
    expect(click).toHaveBeenCalledTimes(1)
  })
})
describe('documents and code changes', () => {
  it('keeps Markdown as text and blocks HTML, unsafe links and implicit remote images', () => {
    // Articles may come from files or models, so markup is never executable.
    const { container } = render(
      <UiMarkdown>
        {
          '<script>alert(1)</script>\n\n[bad](javascript:alert)\n\n![tracking](https://example.com/pixel.png)\n\n**Good text**'
        }
      </UiMarkdown>,
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('a')?.getAttribute('href')).not.toMatch(/^javascript:/)
    expect(screen.getByText('Good text')).toBeInTheDocument()
  })
  it('round-trips the exact Markdown draft through preview mode', async () => {
    const user = userEvent.setup()
    function Editor() {
      const [value, setValue] = useState('## First')
      return <UiMarkdownEditor label="Article" value={value} onChange={setValue} />
    }
    render(<Editor />)
    await user.type(screen.getByRole('textbox', { name: 'Article' }), '\n\nNew **text**')
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Write' }))
    expect(screen.getByRole('textbox')).toHaveValue('## First\n\nNew **text**')
  })
  it('shows unequal additions/deletions, split headers and partial/binary states without invented lines', async () => {
    const user = userEvent.setup(),
      files = [
        {
          id: 'a',
          path: 'route.ts',
          truncated: true,
          hunks: [
            {
              id: 'h',
              label: '@@',
              lines: [
                { kind: 'deletion' as const, oldLine: 1, text: 'old' },
                { kind: 'addition' as const, newLine: 1, text: 'new' },
                { kind: 'addition' as const, newLine: 2, text: 'extra' },
              ],
            },
          ],
        },
        { id: 'b', path: 'map.png', binary: true, hunks: [] },
      ]
    function Diff() {
      const [value, setValue] = useState('a')
      return <UiCodeDiff files={files} value={value} onChange={setValue} />
    }
    render(<Diff />)
    expect(screen.getByText('2 added · 1 removed')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Split' }))
    expect(screen.getByRole('columnheader', { name: 'Before' })).toBeInTheDocument()
    expect(screen.getByText('+ extra')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Partial preview')
    await user.click(screen.getByRole('button', { name: 'map.png' }))
    expect(screen.getByText('Binary file — no text preview.')).toBeInTheDocument()
  })
})

it('represents an unfinished interval as null instead of sending NaN to the host', async () => {
  // Users must be able to erase a number while editing; validation happens on save.
  const user = userEvent.setup(), change = vi.fn()
  render(<UiScheduleEditor value={{ enabled: true, kind: 'interval', everyMinutes: 30, time: '09:00', weekdays: [], timezone: 'UTC' }} onChange={change} timezones={[{ value: 'UTC', label: 'UTC' }]} />)
  await user.clear(screen.getByRole('spinbutton', { name: 'Interval (minutes)' }))
  expect(change).toHaveBeenLastCalledWith(expect.objectContaining({ everyMinutes: null }))
})
