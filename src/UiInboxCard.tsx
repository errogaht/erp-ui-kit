import { UiBadge } from './Ui'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import type { ReactNode } from 'react'

export type UiInboxSignal = { label: string; tone: 'neutral' | 'accent' | 'warning' | 'danger' | 'success'; title?: string }

/**
 * Dense inbox row: avatar/count have fixed columns; every business label wraps
 * in the remaining width. The caller supplies display-ready facts and owns
 * selection/navigation. This component never classifies a reply or calls APIs.
 * Use multiple signals instead of hiding critical decisions in a tooltip.
 */
export function UiInboxCard({
  title,
  subtitle,
  signals,
  classification,
  classificationTitle,
  owner,
  ownerLabel = 'Owner',
  channels,
  preview,
  unread = 0,
  active = false,
  alerts = [],
  onClick,
  footer,
  avatar,
}: {
  title: string
  subtitle?: string
  signals: readonly UiInboxSignal[]
  classification?: string
  classificationTitle?: string
  owner?: string
  ownerLabel?: string
  channels: readonly ('telegram' | 'whatsapp')[]
  preview?: string
  unread?: number
  active?: boolean
  alerts?: readonly string[]
  onClick: () => void
  footer?: ReactNode
  avatar?: ReactNode
}) {
  return (
    <button
      className={`ui-kit-inbox-card${active ? ' is-active' : ''}${unread > 0 ? ' is-unread' : ''}`}
      aria-pressed={active}
      onClick={onClick}
      type="button"
    >
      <span className="ui-kit-inbox-card__avatar" aria-hidden="true">
        {avatar ?? <UiBootstrapIcon name="chat-left-text" />}
      </span>
      <span className="ui-kit-inbox-card__copy">
        <strong className="ui-kit-inbox-card__title">{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
        <span className="ui-kit-inbox-card__signals">
          {signals.map((signal) => (
            <span key={signal.label} title={signal.title}><UiBadge tone={signal.tone}>{signal.label}</UiBadge></span>
          ))}
        </span>
        {classification ? (
          <span className="ui-kit-inbox-card__classification" title={classificationTitle}>{classification}</span>
        ) : null}
        {/* Ownership and channels describe one routing fact, so keep them together when space allows. */}
        <span className="ui-kit-inbox-card__routing">
          {owner !== undefined ? <span>{ownerLabel}: {owner}</span> : null}
          <span className="ui-kit-inbox-card__signals">
            {channels.length
              ? channels.map((channel) => (
                  <UiBadge key={channel} tone={channel}>
                    {channel === 'telegram' ? 'TG' : 'WA'}
                  </UiBadge>
                ))
              : 'No channel'}
          </span>
        </span>
        {alerts.map((alert) => (
          <strong className="ui-kit-inbox-card__alert" key={alert}>
            {alert}
          </strong>
        ))}
        {preview ? <span className="ui-kit-inbox-card__preview">{preview}</span> : null}
        {footer ? <span className="ui-kit-inbox-card__footer">{footer}</span> : null}
      </span>
      {unread > 0 ? (
        <span
          className="ui-kit-inbox-card__count"
          aria-label={`Unread messages: ${unread}`}
        >
          {unread}
        </span>
      ) : null}
    </button>
  )
}
