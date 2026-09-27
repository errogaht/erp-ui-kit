import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UiBoard } from '../src/UiOperations'
import { UiTaskList } from '../src/UiTaskList'
import { UiBadgeSelect } from '../src/UiExtras'
import { UiInfoTip } from '../src/UiInformation'

const columns = [
  { id: 'todo', title: 'To do', items: [{ id: 'a', label: 'Inspect shipment', content: <strong>Inspect shipment</strong> }] },
  { id: 'done', title: 'Done', items: [] },
]
const transfer = () => ({ setData: vi.fn(), effectAllowed: '', dropEffect: '' })

describe('Board movement', () => {
  it('requests a cross-column move without mutating host data', () => {
    // An empty destination must accept a card; the host remains authoritative.
    const onMove = vi.fn()
    render(<UiBoard label="Pipeline" columns={columns} onMove={onMove} />)
    const dataTransfer = transfer()
    fireEvent.dragStart(screen.getByLabelText('Drag Inspect shipment'), { dataTransfer })
    fireEvent.dragOver(screen.getByRole('region', { name: 'Done' }), { dataTransfer })
    fireEvent.drop(screen.getByRole('region', { name: 'Done' }), { dataTransfer })
    expect(onMove).toHaveBeenCalledExactlyOnceWith({ itemId: 'a', fromColumnId: 'todo', toColumnId: 'done' })
    expect(within(screen.getByRole('region', { name: 'To do' })).getByText('Inspect shipment')).toBeInTheDocument()
  })
  it('ignores foreign and same-column drops', () => {
    // A drag from another board/browser must never be interpreted as a local card.
    const onMove = vi.fn()
    render(<UiBoard label="Pipeline" columns={columns} onMove={onMove} />)
    const dataTransfer = transfer()
    fireEvent.drop(screen.getByRole('region', { name: 'Done' }), { dataTransfer })
    fireEvent.dragStart(screen.getByLabelText('Drag Inspect shipment'), { dataTransfer })
    fireEvent.drop(screen.getByRole('region', { name: 'To do' }), { dataTransfer })
    expect(onMove).not.toHaveBeenCalled()
  })
  it('keeps an accessible move control with dragging disabled', async () => {
    // Apps may disallow dragging while preserving keyboard/touch status changes.
    const user = userEvent.setup(), onMove = vi.fn()
    render(<UiBoard label="Pipeline" columns={columns} onMove={onMove} dragAndDrop={false} />)
    expect(screen.queryByLabelText('Drag Inspect shipment')).not.toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Move Inspect shipment to column'), 'done')
    expect(onMove).toHaveBeenCalledExactlyOnceWith({ itemId: 'a', fromColumnId: 'todo', toColumnId: 'done' })
  })
  it('has no movement controls without a host callback', () => {
    // Existing static boards remain static after upgrading the package.
    render(<UiBoard label="Pipeline" columns={columns} />)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Drag Inspect shipment')).not.toBeInTheDocument()
  })
})

it('task status filtering uses the same colored badges as task rows', async () => {
  // Status colors must be visible before selection and filtering must still work.
  const user = userEvent.setup()
  render(<UiTaskList tasks={[
    { id: 'a', key: 'OPS-1', title: 'Inspect shipment', status: 'todo', priority: 'medium', kind: 'task' },
    { id: 'b', key: 'OPS-2', title: 'Prepare route', status: 'done', priority: 'low', kind: 'task' },
  ]} statuses={[{ value: 'todo', label: 'To do', tone: 'warning' }, { value: 'done', label: 'Done', tone: 'success' }]} onTaskOpen={() => {}} />)
  await user.click(screen.getByRole('button', { name: 'Filter by status' }))
  expect(within(screen.getByRole('option', { name: 'Done' })).getByText('Done')).toHaveClass('ui-kit-badge--success')
  await user.click(screen.getByRole('option', { name: 'Done' }))
  expect(screen.queryByText('Inspect shipment')).not.toBeInTheDocument()
  expect(screen.getByText('Prepare route')).toBeInTheDocument()
})

it('the simplified info trigger preserves disclosure and Escape focus behavior', async () => {
  // Visual simplification must not turn the help into a pointer-only tooltip.
  const user = userEvent.setup()
  render(<UiInfoTip label="About reference numbers">Reference help</UiInfoTip>)
  const trigger = screen.getByRole('button', { name: 'About reference numbers' })
  await user.click(trigger)
  expect(screen.getByRole('note')).toHaveTextContent('Reference help')
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('note')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})


it('badge menu keyboard navigation advances exactly one option through its portal', async () => {
  // React portal bubbling must not skip colors or dispatch a status change twice.
  const user = userEvent.setup(), onChange = vi.fn()
  render(<UiBadgeSelect label="Choose status" value="todo" onChange={onChange} options={[
    { value: 'todo', label: 'To do' }, { value: 'review', label: 'Review' }, { value: 'done', label: 'Done' },
  ]} />)
  await user.click(screen.getByRole('button', { name: 'Choose status' }))
  await user.keyboard('{ArrowDown}{Enter}')
  expect(onChange).toHaveBeenCalledExactlyOnceWith('review')
})
