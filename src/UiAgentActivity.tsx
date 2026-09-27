import { useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { UiBadge, UiButton } from './Ui'
import { UiInfoTip } from './UiInformation'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import type { BootstrapIconName } from './UiBootstrapIcon'
import './ui-agent-activity.css'

export type UiExecutionEntry = {
  id: string
  title: string
  kind: 'command' | 'tool' | 'analysis' | 'plan' | 'file' | 'search'
  status: 'queued' | 'running' | 'success' | 'error' | 'cancelled'
  summary?: string
  command?: string
  output?: string
  detail?: string
  timestamp?: string
  duration?: string
  location?: string
  exitCode?: number
}
const activityIcons: Record<UiExecutionEntry['kind'], BootstrapIconName> = {
  command: 'terminal',
  tool: 'tools',
  analysis: 'stars',
  plan: 'list-check',
  file: 'file-earmark-diff',
  search: 'search',
}
const activityLabels = {
  queued: 'Queued',
  running: 'Running',
  success: 'Completed',
  error: 'Failed',
  cancelled: 'Cancelled',
} as const
/** Stable entry IDs preserve native disclosure state through streaming updates.
 * Logs are text, not Markdown. The host pairs events, redacts and bounds output;
 * the component never runs commands or treats output as interactive markup. */
export function UiExecutionLog({
  entries,
  label = 'Execution activity',
  empty = 'No activity yet.',
}: {
  entries: readonly UiExecutionEntry[]
  label?: string
  empty?: ReactNode
}) {
  return (
    <section className="ui-kit-execution" aria-label={label}>
      {entries.length ? (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id} className={`ui-kit-execution__entry ui-kit-execution__entry--${entry.status}`}>
              <details>
                <summary>
                  <UiBootstrapIcon name={activityIcons[entry.kind]} />
                  <span className="ui-kit-execution__title">
                    <strong>{entry.title}</strong>
                    {entry.summary && <small>{entry.summary}</small>}
                  </span>
                  <UiBadge
                    tone={
                      entry.status === 'error'
                        ? 'danger'
                        : entry.status === 'success'
                          ? 'success'
                          : entry.status === 'running'
                            ? 'accent'
                            : 'neutral'
                    }
                  >
                    {activityLabels[entry.status]}
                  </UiBadge>
                  {entry.timestamp && <time>{entry.timestamp}</time>}
                  <UiBootstrapIcon name="chevron-down" />
                </summary>
                <div className="ui-kit-execution__body">
                  {entry.command && (
                    <pre aria-label="Command">
                      <code>{entry.command}</code>
                    </pre>
                  )}
                  {entry.detail && <p>{entry.detail}</p>}
                  {entry.output !== undefined && (
                    <pre aria-label="Output">
                      <code>{entry.output || '(No output)'}</code>
                    </pre>
                  )}
                  {!entry.command && !entry.detail && entry.output === undefined && (
                    <p>No details available.</p>
                  )}
                  <footer>
                    {entry.location && <code>{entry.location}</code>}
                    {entry.exitCode !== undefined && <span>Exit {entry.exitCode}</span>}
                    {entry.duration && <span>{entry.duration}</span>}
                  </footer>
                </div>
              </details>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ui-kit-execution__empty">{empty}</p>
      )}
    </section>
  )
}

export type UiPromptAction = {
  id: string
  label: string
  description: string
  disabledReason?: string
  icon?: BootstrapIconName
}
/** Presets expose their consequence even when disabled. Selecting a preset is
 * explicit; whether it fills a draft or submits a prompt is the host's contract. */
export function UiPromptActions({
  items,
  onSelect,
  label = 'Quick actions',
  disabled = false,
}: {
  items: readonly UiPromptAction[]
  onSelect: (id: string) => void
  label?: string
  disabled?: boolean
}) {
  return (
    <section className="ui-kit-prompt-actions" aria-label={label}>
      <strong>{label}</strong>
      <div>
        {items.map((item) => (
          <div className="ui-kit-prompt-actions__item" key={item.id}>
            <UiButton
              type="button"
              disabled={disabled || Boolean(item.disabledReason)}
              onClick={() => onSelect(item.id)}
            >
              {item.icon && <UiBootstrapIcon name={item.icon} />}
              {item.label}
            </UiButton>
            <UiInfoTip label={`About ${item.label}`}>
              {item.description}
              {item.disabledReason && (
                <>
                  <br />
                  {item.disabledReason}
                </>
              )}
            </UiInfoTip>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Authorization belongs to the host. This card requests a decision, retains
 * its error on rejection, and prevents duplicate clicks while a promise settles.
 * Use a new key/requestId for each proposal so consent cannot cross requests. */
export function UiApprovalCard({
  requestId,
  title,
  description,
  children,
  confirmLabel = 'Approve',
  rejectLabel = 'Decline',
  acknowledgement,
  disabledReason,
  status = 'pending',
  onDecision,
}: {
  requestId: string
  title: string
  description: ReactNode
  children?: ReactNode
  confirmLabel?: string
  rejectLabel?: string
  acknowledgement?: string
  disabledReason?: string
  status?: 'pending' | 'approved' | 'rejected' | 'expired'
  onDecision: (decision: 'approve' | 'reject') => void | Promise<void>
}) {
  // Keyed inner state ensures a different proposal never inherits consent/busy/error.
  return (
    <ApprovalRequest
      key={requestId}
      {...{
        title,
        description,
        children,
        confirmLabel,
        rejectLabel,
        acknowledgement,
        disabledReason,
        status,
        onDecision,
      }}
    />
  )
}
function ApprovalRequest({
  title,
  description,
  children,
  confirmLabel,
  rejectLabel,
  acknowledgement,
  disabledReason,
  status,
  onDecision,
}: Omit<Parameters<typeof UiApprovalCard>[0], 'requestId'>) {
  const [checked, setChecked] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const lock = useRef(false),
    id = useId()
  const decide = async (decision: 'approve' | 'reject') => {
    if (
      lock.current ||
      status !== 'pending' ||
      disabledReason ||
      (decision === 'approve' && acknowledgement && !checked)
    )
      return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      await onDecision(decision)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not record your decision. Try again.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return (
    <section className="ui-kit-approval" aria-labelledby={id} aria-busy={busy}>
      <header>
        <UiBootstrapIcon name="shield-check" />
        <strong id={id}>{title}</strong>
        <UiBadge tone={status === 'approved' ? 'success' : status === 'rejected' ? 'neutral' : 'warning'}>
          {status === 'pending'
            ? 'Decision needed'
            : status === 'approved'
              ? 'Approved'
              : status === 'expired'
                ? 'Expired'
                : 'Declined'}
        </UiBadge>
      </header>
      <div className="ui-kit-approval__body">
        <div>{description}</div>
        {children}
        {error && (
          <p role="alert" className="ui-kit-approval__error">
            {error}
          </p>
        )}
        {status === 'pending' && acknowledgement && (
          <label className="ui-kit-approval__check">
            <input
              type="checkbox"
              checked={checked}
              disabled={busy || Boolean(disabledReason)}
              onChange={(event) => setChecked(event.target.checked)}
            />
            {acknowledgement}
          </label>
        )}
        {disabledReason && <p role="status">{disabledReason}</p>}
      </div>
      {status === 'pending' && (
        <footer>
          <UiButton
            type="button"
            disabled={busy || Boolean(disabledReason)}
            onClick={() => void decide('reject')}
          >
            {rejectLabel}
          </UiButton>
          <UiButton
            type="button"
            variant="primary"
            disabled={busy || Boolean(disabledReason) || Boolean(acknowledgement && !checked)}
            onClick={() => void decide('approve')}
          >
            {busy ? 'Submitting…' : confirmLabel}
          </UiButton>
        </footer>
      )}
    </section>
  )
}

/** Presentation-only recording state. The host owns microphone permission,
 * audio lifetime, transcription and appending text; mounting never records. */
export function UiVoiceControl({
  state,
  duration,
  error,
  onStart,
  onStop,
  onCancel,
  disabledReason,
}: {
  state: 'idle' | 'recording' | 'processing'
  duration?: string
  error?: string
  onStart: () => void
  onStop: () => void
  onCancel: () => void
  disabledReason?: string
}) {
  return (
    <div className={`ui-kit-voice ui-kit-voice--${state}`}>
      <div className="ui-kit-voice__controls">
        {state === 'idle' ? (
          <UiButton type="button" disabled={Boolean(disabledReason)} onClick={onStart}>
            <UiBootstrapIcon name="mic" /> Dictate
          </UiButton>
        ) : state === 'recording' ? (
          <>
            <span className="ui-kit-voice__indicator" aria-hidden="true" />
            <span>Recording {duration}</span>
            <UiButton type="button" onClick={onStop}>
              <UiBootstrapIcon name="stop-fill" /> Finish recording
            </UiButton>
            <UiButton type="button" variant="quiet" onClick={onCancel}>
              Cancel
            </UiButton>
          </>
        ) : (
          <>
            <span role="status">Transcribing…</span>
            <UiButton type="button" variant="quiet" onClick={onCancel}>
              Cancel
            </UiButton>
          </>
        )}
        {disabledReason && <UiInfoTip label="Why dictation is unavailable">{disabledReason}</UiInfoTip>}
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
