import type { ReactNode, SVGProps } from 'react'

type IconName =
  | 'search'
  | 'filter'
  | 'refresh'
  | 'attach'
  | 'close'
  | 'check'
  | 'warning'
  | 'info'
  | 'clock'
  | 'message'
  | 'wallet'
  | 'box'
  | 'arrow-right'

/** One 20px stroke family keeps controls legible at the chat UI's dense scale. */
export function UiIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 4.1 4.1" />
      </>
    ),
    filter: (
      <>
        <path d="M3 5h18M6 12h12M9 19h6" />
        <circle cx="8" cy="5" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
    refresh: (
      <>
        {/* Open arcs meet arrow tips without crossing the arrowheads at 16px. */}
        <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16M8 16H3v5" />
      </>
    ),
    attach: <path d="m8 12.5 5.7-5.7a3.4 3.4 0 0 1 4.8 4.8l-7.7 7.7a5 5 0 0 1-7.1-7.1L12.2 3.7" />,
    close: <path d="M5 5 19 19M19 5 5 19" />,
    check: <path d="m4.5 12.5 5 5L20 7" />,
    warning: (
      <>
        <path d="M11 3.4 2.5 18a1.4 1.4 0 0 0 1.2 2h16.6a1.4 1.4 0 0 0 1.2-2L13 3.4a1.2 1.2 0 0 0-2 0Z" />
        <path d="M12 8v5M12 17h.01" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    message: <path d="M4 4h16v13H9l-5 4V4Z" />,
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="1" />
        <path d="M3 6V4h15M15 12h6M17 14h.01" />
      </>
    ),
    box: (
      <>
        <path d="m12 2 9 4.5v11L12 22l-9-4.5v-11L12 2ZM3 6.5l9 5 9-5M12 11.5V22" />
      </>
    ),
    'arrow-right': <path d="M4 12h16m-6-6 6 6-6 6" />,
  }
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
