import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null
    }

    const buttonClass = (isActive) =>
        `p-2 rounded-lg transition-all duration-200 ${isActive
            ? 'bg-primary text-white shadow-md'
            : 'text-slate-400 hover:bg-white/10 hover:text-white'
        }`

    return (
        <div className="flex gap-1 p-2 border-b border-white/10 mb-2 overflow-x-auto">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive('bold'))}
                title="Bold"
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive('italic'))}
                title="Italic"
            >
                <em>I</em>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={buttonClass(editor.isActive('strike'))}
                title="Strike"
            >
                <s>S</s>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={buttonClass(editor.isActive('code'))}
                title="Code"
            >
                {`</>`}
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 self-center"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={buttonClass(editor.isActive('heading', { level: 2 }))}
                title="Heading 2"
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive('bulletList'))}
                title="Bullet List"
            >
                • List
            </button>
        </div>
    )
}

const RichTextEditor = ({ value, onChange, placeholder = "Write something..." }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-slate-500 before:float-left before:h-0 before:pointer-events-none',
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[100px] px-4 py-2 text-slate-200',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    // Update content if value changes externally (e.g. clear form)
    // Note: This needs care to avoid cursor jumping, but for clearing it's fine
    if (editor && value === '' && editor.getText() !== '') {
        editor.commands.clearContent()
    }

    return (
        <div className="bg-surface/50 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-200">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}

export default RichTextEditor
