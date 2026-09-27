import { Toaster, toast } from 'sonner'
import type { ToasterProps } from 'sonner'
import './ui-toasts.css'

export type UiToasterProps = ToasterProps
export type UiToastPosition = NonNullable<ToasterProps['position']>

/** Mount once at the application root, outside retained document panels.
 * Sonner owns timers, stacking, live announcements and dismissal; the kit owns
 * visual tokens. Hosts own message content and async operations. Use distinct
 * toaster IDs when intentionally mounting multiple independent notification areas.
 */
export function UiToaster({ className = '', toastOptions, ...props }: UiToasterProps) {
  return <Toaster position="bottom-right" closeButton duration={5000} gap={8}
    {...props} className={`ui-kit-surface ui-kit-toaster ${className}`.trim()}
    toastOptions={{ ...toastOptions, className: `ui-kit-toast ${toastOptions?.className ?? ''}`.trim() }} />
}

/** The same Sonner instance powers success/info/warning/error/loading/promise,
 * actions, per-toast position overrides and dismissal without host API calls. */
export const uiToast: typeof toast = toast
