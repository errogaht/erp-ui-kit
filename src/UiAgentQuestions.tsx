import { useId, useRef, useState } from 'react'
import { UiBadge, UiButton } from './Ui'
import { UiTextarea } from './UiControls'
import './ui-agent-questions.css'

export type UiAgentQuestion = {
  id: string
  title: string
  description?: string
  options: readonly { id: string; label: string; description?: string }[]
}
export type UiAgentAnswer = { questionId: string } & (
  | { kind: 'option'; optionId: string }
  | { kind: 'custom'; text: string }
)
export type UiAgentQuestionsProps = {
  /** Change identity whenever the question set changes; IDs must be unique within a request. */
  requestId: string
  questions: readonly UiAgentQuestion[]
  title?: string
  description?: string
  disabled?: boolean
  onSubmit: (answers: readonly UiAgentAnswer[]) => void | Promise<void>
}

/** A single submission owns the whole question group. The host owns transport and
 * persistence; drafts survive failed sends and a new request starts fresh.
 * Custom text is an alternative to a preset, never an ambiguous second answer. */
export function UiAgentQuestions(props: UiAgentQuestionsProps) {
  return <QuestionRequest key={props.requestId} {...props} />
}

function QuestionRequest({ questions, title = 'A few questions before I continue',
  description = 'Answer every question, then send your answers together.', disabled = false,
  onSubmit }: UiAgentQuestionsProps) {
  const id = useId()
  const [drafts, setDrafts] = useState<Partial<Record<string, { choice: string | null; custom: boolean; text: string }>>>({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  const answers = questions.flatMap<UiAgentAnswer>(question => {
    const draft = drafts[question.id]
    if (draft?.custom && draft.text.trim()) return [{ questionId: question.id, kind: 'custom', text: draft.text.trim() }]
    if (draft && !draft.custom && question.options.some(option => option.id === draft.choice))
      return [{ questionId: question.id, kind: 'option', optionId: draft.choice! }]
    return []
  })
  const complete = questions.length > 0 && answers.length === questions.length
  const frozen = disabled || busy || sent
  const update = (questionId: string, change: Partial<{ choice: string | null; custom: boolean; text: string }>) => {
    setDrafts(current => ({ ...current, [questionId]: { choice: null, custom: false, text: '', ...current[questionId], ...change } }))
    setError('')
  }
  return (
    <form className="ui-kit-agent-questions" aria-labelledby={`${id}-title`} aria-busy={busy}
      onSubmit={async event => {
        event.preventDefault()
        if (!complete || frozen || lock.current) return
        // The synchronous lock covers double clicks before React renders busy state.
        lock.current = true
        setBusy(true)
        setError('')
        try { await onSubmit(answers); setSent(true) }
        catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not send answers. Try again.') }
        finally { lock.current = false; setBusy(false) }
      }}>
      <header><div><strong id={`${id}-title`}>{title}</strong><p>{description}</p></div>
        <UiBadge tone={sent ? 'success' : 'accent'}>{sent ? 'Answered' : 'Your input needed'}</UiBadge>
      </header>
      <div className="ui-kit-agent-questions__list">
        {questions.map((question, index) => {
          const draft = drafts[question.id]
          const prefix = `${id}-${index}`
          return <fieldset key={question.id} disabled={frozen} aria-describedby={question.description ? `${prefix}-description` : undefined}>
            <legend><span>{index + 1}</span>{question.title}</legend>
            <div className="ui-kit-agent-questions__answers">
            {question.description && <p id={`${prefix}-description`}>{question.description}</p>}
            <div className="ui-kit-agent-questions__options">
              {question.options.map(option => <label key={option.id} className="ui-kit-agent-questions__option">
                <input type="radio" name={prefix} checked={!draft?.custom && draft?.choice === option.id}
                  onChange={() => update(question.id, { choice: option.id, custom: false })} />
                <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
              </label>)}
            </div>
            <label className="ui-kit-agent-questions__custom" htmlFor={`${prefix}-custom`}>
              <input id={`${prefix}-custom`} type="radio" name={prefix} checked={draft?.custom ?? false}
                onChange={() => update(question.id, { custom: true })} />Your own answer
            </label>
            <UiTextarea aria-label={`Your answer: ${question.title}`} rows={2} value={draft?.text ?? ''}
              placeholder="Write your answer…" onChange={event => update(question.id, { text: event.target.value, custom: true })} />
            </div>
          </fieldset>
        })}
      </div>
      <footer><span role="status">{sent ? 'Answers sent. The agent can continue.' : `${answers.length} of ${questions.length} answered`}</span>
        {!sent && <UiButton type="submit" variant="primary" disabled={!complete || frozen}>{busy ? 'Sending answers…' : 'Send answers'}</UiButton>}
      </footer>
      {error && <p className="ui-kit-agent-questions__error" role="alert">{error}</p>}
    </form>
  )
}
