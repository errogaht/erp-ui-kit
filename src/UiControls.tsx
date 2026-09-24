import type { ComponentPropsWithRef } from 'react'
import './ui-kit.css'

/** Native controls keep refs, form names, validation and keyboard events intact.
 * Labels/validation belong to UiField or the consuming screen. Never intercept
 * change/submit here: formatting and persistence are application responsibilities.
 */
export function UiInput({ className = '', density = 'regular', ...props }: ComponentPropsWithRef<'input'> & { density?: 'regular' | 'compact' }) {
  return <input className={`ui-kit-control${density === 'compact' ? ' ui-kit-control--compact' : ''} ${className}`.trim()} {...props} />
}
export function UiSelect({ className = '', density = 'regular', ...props }: ComponentPropsWithRef<'select'> & { density?: 'regular' | 'compact' }) {
  return <select className={`ui-kit-control${density === 'compact' ? ' ui-kit-control--compact' : ''} ${className}`.trim()} {...props} />
}
export function UiTextarea({ className = '', ...props }: ComponentPropsWithRef<'textarea'>) {
  return <textarea className={`ui-kit-control ${className}`.trim()} {...props} />
}
