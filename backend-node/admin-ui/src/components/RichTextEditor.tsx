import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect, useRef } from 'react'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('URL da Imagem')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    icon,
    title
  }: {
    onClick: () => void,
    isActive?: boolean,
    icon: string,
    title?: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isActive
        ? 'bg-secondary text-white shadow-md'
        : 'text-[#64748B] hover:bg-white hover:text-secondary hover:shadow-sm'
        }`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )

  const Divider = () => <div className="w-px h-6 bg-[#E2E8F0] mx-1"></div>

  return (
    <div className="flex items-center flex-wrap gap-2 p-3 border-b border-[#E2E8F0]/50 bg-white/40 sticky top-0 z-10">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        icon="format_bold"
        title="Negrito"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        icon="format_italic"
        title="Itálico"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        icon="format_underlined"
        title="Sublinhado"
      />

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        icon="format_h1"
        title="Título 1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        icon="format_h2"
        title="Título 2"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        icon="format_h3"
        title="Título 3"
      />

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        icon="format_list_bulleted"
        title="Lista com Marcadores"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        icon="format_list_numbered"
        title="Lista Numerada"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        icon="format_quote"
        title="Citação"
      />

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        icon="format_align_left"
        title="Alinhar à Esquerda"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        icon="format_align_center"
        title="Centralizar"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        icon="format_align_right"
        title="Alinhar à Direita"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
        icon="format_align_justify"
        title="Justificar"
      />

      <Divider />

      <ToolbarButton
        onClick={toggleLink}
        isActive={editor.isActive('link')}
        icon="link"
        title="Inserir Link"
      />
      <ToolbarButton
        onClick={addImage}
        icon="image"
        title="Inserir Imagem"
      />

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        icon="undo"
        title="Desfazer"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        icon="redo"
        title="Refazer"
      />
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva o conteúdo completo da matéria aqui...',
}: RichTextEditorProps) {
  const isInternalChange = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto my-4 shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-secondary underline hover:text-secondary/90 transition-colors',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm xl:prose-base max-w-none focus:outline-none min-h-[500px] p-6 text-[15px] leading-relaxed font-sans text-[#334155]',
      },
    },
    onUpdate: ({ editor }: { editor: { getHTML: () => string } }) => {
      isInternalChange.current = true
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    const current = editor.getHTML()
    const normalized = value || '<p></p>'
    if (current !== normalized) {
      editor.commands.setContent(normalized, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8 bg-white/40 text-[#94A3B8]">
        Carregando editor avançado...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white/40">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto wysiwyg-content cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
