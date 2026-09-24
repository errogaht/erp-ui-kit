import type { SVGProps } from 'react'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import type { BootstrapIconName } from './UiBootstrapIcon'

type IconName = 'search' | 'filter' | 'refresh' | 'attach' | 'close' | 'check' | 'warning' | 'info' | 'clock' | 'message' | 'wallet' | 'box' | 'arrow-right'
const icons: Record<IconName, BootstrapIconName> = {
  search: 'search', filter: 'sliders', refresh: 'arrow-clockwise', attach: 'paperclip', close: 'x-lg',
  check: 'check-lg', warning: 'exclamation-triangle', info: 'info-circle', clock: 'clock',
  message: 'chat-left-text', wallet: 'wallet2', box: 'box-seam', 'arrow-right': 'arrow-right',
}

/** Compatibility names render the official Bootstrap glyphs, preserving existing imports. */
export function UiIcon({ name, className, style, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <UiBootstrapIcon name={icons[name]} className={className} style={style} label={props['aria-label']} />
}
