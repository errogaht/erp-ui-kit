import Select, { type GroupBase, type Props } from 'react-select'
import AsyncSelect, { type AsyncProps } from 'react-select/async'
import './ui-kit.css'

/** Searchable selects keep react-select keyboard and async behavior while the UI Kit owns every visible state. */
export function UiCombobox<Option>({ density = 'regular', ...props }: Props<Option, false, GroupBase<Option>> & { density?: 'regular' | 'compact' }) {
  return <Select<Option, false, GroupBase<Option>> {...props} className={`ui-kit-combobox${density === 'compact' ? ' ui-kit-combobox--compact' : ''} ${props.className ?? ''}`.trim()} classNamePrefix="ui-kit-combobox" />
}

/** Remote catalog lookup uses the same control and menu styling as local option lists. */
export function UiAsyncCombobox<Option>({ density = 'regular', ...props }: AsyncProps<Option, false, GroupBase<Option>> & { density?: 'regular' | 'compact' }) {
  return <AsyncSelect<Option, false, GroupBase<Option>> {...props} className={`ui-kit-combobox${density === 'compact' ? ' ui-kit-combobox--compact' : ''} ${props.className ?? ''}`.trim()} classNamePrefix="ui-kit-combobox" />
}
