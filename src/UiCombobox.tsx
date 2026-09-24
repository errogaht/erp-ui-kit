import Select, { type GroupBase, type Props } from 'react-select'
import AsyncSelect, { type AsyncProps } from 'react-select/async'
import './ui-kit.css'

/** Searchable selects keep react-select keyboard and async behavior while the UI Kit owns every visible state. */
export function UiCombobox<Option>(props: Props<Option, false, GroupBase<Option>>) {
  return <Select<Option, false, GroupBase<Option>> {...props} className={`ui-kit-combobox ${props.className ?? ''}`.trim()} classNamePrefix="ui-kit-combobox" />
}

/** Remote catalog lookup uses the same control and menu styling as local option lists. */
export function UiAsyncCombobox<Option>(props: AsyncProps<Option, false, GroupBase<Option>>) {
  return <AsyncSelect<Option, false, GroupBase<Option>> {...props} className={`ui-kit-combobox ${props.className ?? ''}`.trim()} classNamePrefix="ui-kit-combobox" />
}
