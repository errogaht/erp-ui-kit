import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UiWorkspaceTabs, UiResizableSplit, UiTree, useUiDocumentActive } from '../src/UiWorkspace'

function Document({ id }: { id: string }) {
  const [draft, setDraft] = useState(''),
    active = useUiDocumentActive()
  return (
    <>
      <input aria-label={`${id} draft`} value={draft} onChange={(event) => setDraft(event.target.value)} />
      <span>{active ? 'active' : 'suspended'}</span>
    </>
  )
}
function Tabs() {
  const [items, setItems] = useState([
      { id: 'a', label: 'Alpha', closable: false },
      { id: 'b', label: 'Beta', dirty: true },
      { id: 'c', label: 'Gamma' },
    ]),
    [value, setValue] = useState('a')
  return (
    <UiWorkspaceTabs
      items={items}
      value={value}
      onChange={setValue}
      onClose={(id) => setItems((previous) => previous.filter((item) => item.id !== id))}
      renderPanel={(id) => <Document id={id} />}
    />
  )
}
describe('retained documents', () => {
  it('preserves local drafts and exposes inactive documents without keyboard leakage', async () => {
    // A worker switches records mid-edit; hidden panels stay mounted and inert.
    const user = userEvent.setup()
    render(<Tabs />)
    await user.type(screen.getByLabelText('a draft'), 'Keep this note')
    await user.click(screen.getByRole('tab', { name: /Beta/ }))
    const panels = screen.getAllByRole('tabpanel', { hidden: true })
    expect(panels[0]).toHaveAttribute('hidden')
    expect(panels[0]).toHaveAttribute('inert')
    expect(within(panels[0]).getByText('suspended')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Alpha' }))
    expect(screen.getByLabelText('a draft')).toHaveValue('Keep this note')
    expect(screen.getAllByRole('tab').filter((tab) => tab.tabIndex === 0)).toHaveLength(1)
  })
  it('supports arrows, End, protected tabs and deferred close requests', async () => {
    // Deletion is a request; protected Alpha cannot be closed by the keyboard.
    const user = userEvent.setup()
    render(<Tabs />)
    screen.getByRole('tab', { name: 'Alpha' }).focus()
    await user.keyboard('{Delete}')
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: /Beta/ })).toHaveFocus()
    await user.keyboard('{Delete}')
    expect(screen.queryByRole('tab', { name: /Beta/ })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveFocus()
  })
  it('does not delete a dirty document when the host declines its close request', async () => {
    const request = vi.fn(),
      user = userEvent.setup()
    render(
      <UiWorkspaceTabs
        items={[{ id: 'a', label: 'Alpha', dirty: true }]}
        value="a"
        onChange={() => {}}
        onClose={request}
        renderPanel={() => 'Draft'}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Close Alpha' }))
    expect(request).toHaveBeenCalledWith('a')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Draft')
  })
  it('renders the empty state without dangling tab references', () => {
    render(<UiWorkspaceTabs items={[]} onChange={() => {}} renderPanel={() => null} />)
    expect(screen.getByText('No documents open.')).toBeInTheDocument()
    expect(screen.queryByRole('tab')).toBeNull()
  })
})
describe('split and tree keyboard contracts', () => {
  it('bounds resize keys and ignores keys on the other axis', () => {
    // The first pane remains between configured percentages in either direction.
    const onChange = vi.fn()
    render(
      <UiResizableSplit
        label="Inspector size"
        value={30}
        min={20}
        max={60}
        onChange={onChange}
        first="A"
        second="B"
      />,
    )
    const divider = screen.getByRole('separator')
    fireEvent.keyDown(divider, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith(20)
    fireEvent.keyDown(divider, { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith(60)
    fireEvent.keyDown(divider, { key: 'ArrowRight', shiftKey: true })
    expect(onChange).toHaveBeenLastCalledWith(40)
    fireEvent.keyDown(divider, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenCalledTimes(3)
    expect(divider).toHaveAttribute('aria-orientation', 'vertical')
  })
  it('selects a child exactly once, preserves focus, collapses to its parent and skips disabled activation', async () => {
    // Nested clicks/focus must never bubble into an ancestor selection.
    const select = vi.fn(),
      user = userEvent.setup()
    function Tree() {
      const [expanded, setExpanded] = useState(['group'])
      return (
        <UiTree
          label="Files"
          nodes={[
            {
              id: 'group',
              label: 'Group',
              children: [
                { id: 'a', label: 'Alpha' },
                { id: 'b', label: 'Beta', disabled: true },
              ],
            },
            { id: 'z', label: 'Zulu' },
          ]}
          expanded={expanded}
          onExpandedChange={setExpanded}
          onSelect={select}
        />
      )
    }
    render(<Tree />)
    await user.click(screen.getByRole('treeitem', { name: 'Alpha' }))
    expect(select).toHaveBeenCalledExactlyOnceWith('a')
    expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveFocus()
    await user.keyboard('{ArrowDown}{Enter}')
    expect(select).toHaveBeenCalledTimes(1)
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('treeitem', { name: 'Group' })).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.queryByRole('treeitem', { name: 'Alpha' })).toBeNull()
    await user.keyboard('z')
    expect(screen.getByRole('treeitem', { name: 'Zulu' })).toHaveFocus()
  })
})

// Portals must follow the whole retained-document ancestry, including nested tabs.
it('suspends an open dialog in a nested inactive document and restores it on return', async () => {
  const { UiDialog } = await import('../src/Ui')
  function Nested() {
    const [active, setActive] = useState('a')
    return (
      <UiWorkspaceTabs
        items={[
          { id: 'a', label: 'Outer A' },
          { id: 'b', label: 'Outer B' },
        ]}
        value={active}
        onChange={setActive}
        renderPanel={(id) =>
          id === 'a' ? (
            <UiWorkspaceTabs
              items={[{ id: 'inner', label: 'Inner' }]}
              value="inner"
              onChange={() => {}}
              renderPanel={() => (
                <UiDialog open title="Retained decision" onClose={() => {}}>
                  Review
                </UiDialog>
              )}
            />
          ) : (
            'Other document'
          )
        }
      />
    )
  }
  const user = userEvent.setup()
  render(<Nested />)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await user.click(screen.getByRole('tab', { name: 'Outer B' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  await user.click(screen.getByRole('tab', { name: 'Outer A' }))
  expect(screen.getByRole('dialog')).toHaveFocus()
})

it('removes a badge portal and closes controlled combobox menus in an inactive document', async () => {
  // Body portals sit outside hidden panel DOM, so React activity must gate them.
  const { UiCombobox } = await import('../src/UiCombobox')
  const { UiBadgeSelect } = await import('../src/UiExtras')
  const user = userEvent.setup()
  const props = { items: [{ id: 'a', label: 'Document A' }, { id: 'b', label: 'Document B' }], onChange: () => {}, renderPanel: (id: string) => id === 'a' ? <><UiBadgeSelect label="Queue status" value="ready" options={[{ value: 'ready', label: 'Ready' }]} onChange={() => {}} /><UiCombobox aria-label="Queue" menuIsOpen options={[{ value: 'north', label: 'North queue' }]} /></> : 'Other' }
  const { rerender } = render(<UiWorkspaceTabs {...props} value="a" />)
  await user.click(screen.getByRole('button', { name: 'Queue status' }))
  expect(screen.getByRole('listbox', { name: 'Queue status' })).toBeInTheDocument()
  const combo = screen.getByRole('combobox', { name: 'Queue' })
  expect(combo).toHaveAttribute('aria-expanded', 'true')
  rerender(<UiWorkspaceTabs {...props} value="b" />)
  expect(screen.queryByRole('listbox', { name: 'Queue status' })).toBeNull()
  expect(combo).toHaveAttribute('aria-expanded', 'false')
})
