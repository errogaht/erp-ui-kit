import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { UiButton, UiSegmented } from './Ui'
import { UiTextarea } from './UiControls'
import './ui-documents.css'

/** Shared GFM renderer. Raw HTML is never enabled, images require an explicit
 * opt-in, and remote links retain react-markdown's safe URL transformation. */
export function UiMarkdown({
  children,
  allowImages = false,
  className = '',
}: {
  children: string
  allowImages?: boolean
  className?: string
}) {
  return (
    <div className={`ui-kit-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) =>
            allowImages ? (
              <img src={src} alt={alt ?? ''} loading="lazy" />
            ) : (
              <span className="ui-kit-markdown__image">[Image: {alt || 'attachment'}]</span>
            ),
          table: ({ children }) => (
            <div className="ui-kit-markdown__table">
              <table>{children}</table>
            </div>
          ),
          a: ({ href, children }) => (
            <a href={href} rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

/** Plain Markdown contract for file-backed articles; it intentionally does not
 * convert through the rich-text editor's JSON. Preview and edit share one draft. */
export function UiMarkdownEditor({
  label,
  value,
  onChange,
  disabled = false,
  error,
  help,
  actions,
  rows = 12,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  help?: ReactNode
  actions?: ReactNode
  rows?: number
}) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const id = useId()
  return (
    <section className="ui-kit-markdown-editor" aria-label={label}>
      <header>
        <strong>{label}</strong>
        <UiSegmented
          label={`${label} mode`}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'edit', label: 'Write' },
            { value: 'preview', label: 'Preview' },
          ]}
        />
      </header>
      {mode === 'edit' ? (
        <UiTextarea
          aria-label={label}
          aria-describedby={help || error ? `${id}-help` : undefined}
          aria-invalid={Boolean(error)}
          value={value}
          disabled={disabled}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <div className="ui-kit-markdown-editor__preview" aria-label={`${label} preview`}>
          {value.trim() ? <UiMarkdown>{value}</UiMarkdown> : <p>Nothing to preview yet.</p>}
        </div>
      )}
      {(help || error) && (
        <div
          id={`${id}-help`}
          className={error ? 'ui-kit-markdown-editor__error' : 'ui-kit-markdown-editor__help'}
          role={error ? 'alert' : undefined}
        >
          {error || help}
        </div>
      )}
      <footer>
        <span>Markdown supported · {value.length.toLocaleString('en-US')} characters</span>
        {actions}
      </footer>
    </section>
  )
}

export type UiDiffLine = {
  kind: 'context' | 'addition' | 'deletion'
  text: string
  oldLine?: number
  newLine?: number
}
export type UiDiffHunk = { id: string; label: string; lines: readonly UiDiffLine[] }
export type UiDiffFile = {
  id: string
  path: string
  previousPath?: string
  hunks: readonly UiDiffHunk[]
  binary?: boolean
  truncated?: boolean
}
/** A structured, read-only diff. Parsing patches, fetching commits and deciding
 * attribution are host responsibilities. Source is rendered as text, never HTML.
 * Adjacent deletion/addition runs pair in split mode without inventing line data. */
export function UiCodeDiff({
  files,
  value,
  onChange,
  label = 'Code changes',
  mode: controlledMode,
  onModeChange,
  empty = 'No changes to display.',
}: {
  files: readonly UiDiffFile[]
  value?: string
  onChange: (id: string) => void
  label?: string
  mode?: 'unified' | 'split'
  onModeChange?: (mode: 'unified' | 'split') => void
  empty?: ReactNode
}) {
  const [localMode, setLocalMode] = useState<'unified' | 'split'>('unified')
  const mode = controlledMode ?? localMode
  const current = files.find((file) => file.id === value) ?? files[0]
  const setMode = (next: 'unified' | 'split') => {
    if (controlledMode === undefined) setLocalMode(next)
    onModeChange?.(next)
  }
  const paired = (lines: readonly UiDiffLine[]) => {
    const rows: { left?: UiDiffLine; right?: UiDiffLine }[] = []
    for (let i = 0; i < lines.length;) {
      if (lines[i].kind === 'context') {
        rows.push({ left: lines[i], right: lines[i] })
        i++
        continue
      }
      const removed: UiDiffLine[] = [],
        added: UiDiffLine[] = []
      while (i < lines.length && lines[i].kind !== 'context') {
        const line = lines[i++]
        ;(line.kind === 'deletion' ? removed : added).push(line)
      }
      for (let j = 0; j < Math.max(removed.length, added.length); j++)
        rows.push({ left: removed[j], right: added[j] })
    }
    return rows
  }
  return (
    <section className="ui-kit-code-diff" aria-label={label}>
      <header>
        <strong>{label}</strong>
        <UiSegmented
          label="Diff view"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'unified', label: 'Unified' },
            { value: 'split', label: 'Split' },
          ]}
        />
      </header>
      <div className="ui-kit-code-diff__files" role="group" aria-label="Changed files">
        {files.map((file) => (
          <UiButton
            key={file.id}
            type="button"
            aria-pressed={file.id === current?.id}
            onClick={() => onChange(file.id)}
          >
            {file.path}
          </UiButton>
        ))}
      </div>
      {!current ? (
        <p className="ui-kit-code-diff__notice">{empty}</p>
      ) : (
        <>
          <div className="ui-kit-code-diff__path">
            <code>
              {current.previousPath ? `${current.previousPath} → ` : ''}
              {current.path}
            </code>
            <span>
              {current.hunks.reduce(
                (count, hunk) => count + hunk.lines.filter((line) => line.kind === 'addition').length,
                0,
              )}{' '}
              added ·{' '}
              {current.hunks.reduce(
                (count, hunk) => count + hunk.lines.filter((line) => line.kind === 'deletion').length,
                0,
              )}{' '}
              removed
            </span>
          </div>
          {current.binary ? (
            <p className="ui-kit-code-diff__notice">Binary file — no text preview.</p>
          ) : !current.hunks.length ? (
            <p className="ui-kit-code-diff__notice">No text changes in this file.</p>
          ) : (
            <div
              className="ui-kit-code-diff__scroll"
              tabIndex={0}
              role="region"
              aria-label={`${current.path} diff`}
            >
              <table className={`ui-kit-code-diff__table ui-kit-code-diff__table--${mode}`}>
                <caption className="ui-kit-doc-sr">
                  {current.path}: {mode} diff
                </caption>
                <thead>
                  <tr>
                    {mode === 'split' ? (
                      <>
                        <th colSpan={2}>Before</th>
                        <th colSpan={2}>After</th>
                      </>
                    ) : (
                      <>
                        <th>Old</th>
                        <th>New</th>
                        <th>Change</th>
                        <th>Source</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {current.hunks.map((hunk) => (
                    <DiffHunk key={hunk.id} hunk={hunk} mode={mode} rows={paired(hunk.lines)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {current.truncated && (
            <p className="ui-kit-code-diff__notice" role="status">
              Partial preview. More changes exist outside this excerpt.
            </p>
          )}
        </>
      )}
    </section>
  )
}

/** Line markers remain visible in addition to color, including blank-line edits. */
function DiffHunk({
  hunk,
  mode,
  rows,
}: {
  hunk: UiDiffHunk
  mode: 'split' | 'unified'
  rows: { left?: UiDiffLine; right?: UiDiffLine }[]
}) {
  return (
    <>
      <tr className="ui-kit-code-diff__hunk">
        <th colSpan={4} scope="colgroup">
          {hunk.label}
        </th>
      </tr>
      {mode === 'unified'
        ? hunk.lines.map((line, index) => (
            <tr key={index} className={`ui-kit-code-diff__${line.kind}`}>
              <td className="ui-kit-code-diff__number">{line.oldLine}</td>
              <td className="ui-kit-code-diff__number">{line.newLine}</td>
              <td aria-label={line.kind}>
                {line.kind === 'addition' ? '+' : line.kind === 'deletion' ? '−' : ' '}
              </td>
              <td>
                <code>{line.text || ' '}</code>
              </td>
            </tr>
          ))
        : rows.map((row, index) => (
            <tr key={index}>
              <td className={`ui-kit-code-diff__number ui-kit-code-diff__${row.left?.kind ?? 'blank'}`}>
                {row.left?.oldLine}
              </td>
              <td className={`ui-kit-code-diff__${row.left?.kind ?? 'blank'}`}>
                <code>{row.left ? `${row.left.kind === 'deletion' ? '−' : ' '} ${row.left.text}` : ''}</code>
              </td>
              <td className={`ui-kit-code-diff__number ui-kit-code-diff__${row.right?.kind ?? 'blank'}`}>
                {row.right?.newLine}
              </td>
              <td className={`ui-kit-code-diff__${row.right?.kind ?? 'blank'}`}>
                <code>
                  {row.right ? `${row.right.kind === 'addition' ? '+' : ' '} ${row.right.text}` : ''}
                </code>
              </td>
            </tr>
          ))}
    </>
  )
}
