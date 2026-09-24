import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import type { JSONContent } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { UiBootstrapIcon } from './UiBootstrapIcon'
import './ui-tasks.css'

export type UiRichTextContent = JSONContent
export const emptyRichText: UiRichTextContent = { type: 'doc', content: [{ type: 'paragraph' }] }

/**
 * A reusable WYSIWYG field with a structured JSON contract. Tiptap renders
 * both editable and read-only content, so comments never need raw HTML injection.
 * Persist the JSON in the host; this component only owns editor selection/UI.
 */
export function UiRichTextEditor({ value = emptyRichText, onChange, readOnly = false, placeholder = 'Write a comment…', ariaLabel = 'Rich text editor', className = '' }: {
  value?: UiRichTextContent
  onChange?: (value: UiRichTextContent) => void
  readOnly?: boolean
  placeholder?: string
  ariaLabel?: string
  className?: string
}) {
  const onChangeRef = useRef(onChange)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState('')
  const [imageOpen, setImageOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [imageError, setImageError] = useState('')
  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), Placeholder.configure({ placeholder }), Image],
    content: value,
    editable: !readOnly,
    editorProps: { attributes: { 'aria-label': ariaLabel } },
    onUpdate: ({ editor: current }) => onChangeRef.current?.(current.getJSON()),
  })
  const state = useEditorState({ editor, selector: ({ editor: current }) => ({
    bold: current?.isActive('bold') ?? false,
    italic: current?.isActive('italic') ?? false,
    underline: current?.isActive('underline') ?? false,
    strike: current?.isActive('strike') ?? false,
    heading: current?.isActive('heading', { level: 2 }) ?? false,
    bullet: current?.isActive('bulletList') ?? false,
    ordered: current?.isActive('orderedList') ?? false,
    quote: current?.isActive('blockquote') ?? false,
    code: current?.isActive('code') ?? false,
    link: current?.isActive('link') ?? false,
  }) })
  useEffect(() => { editor?.setEditable(!readOnly) }, [editor, readOnly])
  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])
  if (!editor) return <div aria-label={ariaLabel} className={`ui-kit-rich-text ui-kit-rich-text--loading ${className}`.trim()} />
  const tools = [
    { label: 'Bold', icon: 'type-bold', active: state?.bold, run: () => editor.chain().focus().toggleBold().run() },
    { label: 'Italic', icon: 'type-italic', active: state?.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { label: 'Underline', icon: 'type-underline', active: state?.underline, run: () => editor.chain().focus().toggleUnderline().run() },
    { label: 'Strikethrough', icon: 'type-strikethrough', active: state?.strike, run: () => editor.chain().focus().toggleStrike().run() },
    { label: 'Heading', icon: 'type-h2', active: state?.heading, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Bulleted list', icon: 'list-ul', active: state?.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'Numbered list', icon: 'list-ol', active: state?.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: 'Quote', icon: 'blockquote-left', active: state?.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: 'Inline code', icon: 'code-slash', active: state?.code, run: () => editor.chain().focus().toggleCode().run() },
  ] as const
  const saveLink = (event: React.FormEvent) => {
    event.preventDefault()
    const href = linkUrl.trim()
    if (!/^https?:\/\/\S+$/i.test(href) && !/^mailto:[^\s@]+@[^\s@]+$/i.test(href)) { setLinkError('Enter an http, https or mailto URL.'); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    setLinkOpen(false)
    setLinkError('')
  }
  const saveImage = (event: React.FormEvent) => {
    event.preventDefault()
    const src = imageUrl.trim()
    // Image storage belongs to the host; only explicit web URLs enter persisted rich text.
    if (!/^https?:\/\/\S+$/i.test(src)) { setImageError('Enter an http or https image URL.'); return }
    editor.chain().focus().setImage({ src, alt: imageAlt.trim() || 'Attached image' }).run()
    setImageOpen(false)
    setImageError('')
    setImageUrl('')
    setImageAlt('')
  }
  return <div className={`ui-kit-rich-text ${readOnly ? 'ui-kit-rich-text--readonly' : ''} ${className}`.trim()}>
    {!readOnly && <div aria-label="Formatting" className="ui-kit-rich-text__toolbar" role="toolbar">
      {tools.map(tool => <button aria-label={tool.label} aria-pressed={tool.active} className={tool.active ? 'is-active' : ''} key={tool.label} onClick={tool.run} title={tool.label} type="button"><UiBootstrapIcon name={tool.icon} /></button>)}
      <span aria-hidden="true" className="ui-kit-rich-text__separator" />
      <button aria-label="Insert link" aria-expanded={linkOpen} aria-pressed={state?.link} onClick={() => { setLinkUrl(editor.getAttributes('link').href ?? ''); setLinkError(''); setLinkOpen(open => !open) }} title="Insert link" type="button"><UiBootstrapIcon name="link-45deg" /></button>
      <button aria-label="Insert image" aria-expanded={imageOpen} onClick={() => { setImageError(''); setImageOpen(open => !open) }} title="Insert image" type="button"><UiBootstrapIcon name="image" /></button>
      <span aria-hidden="true" className="ui-kit-rich-text__separator" />
      <button aria-label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} title="Undo" type="button"><UiBootstrapIcon name="arrow-counterclockwise" /></button>
      <button aria-label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} title="Redo" type="button"><UiBootstrapIcon name="arrow-clockwise" /></button>
    </div>}
    {linkOpen && !readOnly && <form className="ui-kit-rich-text__link" onSubmit={saveLink}><label>Link URL<input autoFocus inputMode="url" onChange={event => setLinkUrl(event.target.value)} placeholder="https://example.com" type="text" value={linkUrl} /></label><button type="submit">Apply</button><button onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false) }} type="button">Remove</button>{linkError && <small role="alert">{linkError}</small>}</form>}
    {imageOpen && !readOnly && <form className="ui-kit-rich-text__link" onSubmit={saveImage}><label>Image URL<input autoFocus inputMode="url" onChange={event => setImageUrl(event.target.value)} placeholder="https://example.com/image.jpg" type="text" value={imageUrl} /></label><label>Alternative text<input onChange={event => setImageAlt(event.target.value)} placeholder="Describe the image" value={imageAlt} /></label><button type="submit">Insert</button>{imageError && <small role="alert">{imageError}</small>}</form>}
    <EditorContent className="ui-kit-rich-text__body" editor={editor} />
  </div>
}
