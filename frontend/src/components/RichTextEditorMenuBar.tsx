import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { FaBold, FaCode, FaItalic, FaLink, FaListOl, FaListUl, FaQuoteRight, FaRedo, FaStrikethrough, FaUndo } from "react-icons/fa"
import { MdHorizontalRule } from "react-icons/md"

function MenuBar({ editor }: { editor: Editor }) {
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isLink: ctx.editor.isActive('link') ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      }
    },
  })

  function setText(value: string): void {
    switch (value) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'h1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bulletlist':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedlist':
        editor.chain().focus().toggleOrderedList().run();
        break;
    }
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <select onChange={(e) => setText(e.target.value)} className="dropdown" value={editorState.isHeading1 ? "h1" :
                                                                                      editorState.isHeading2 ? "h2" :
                                                                                      editorState.isHeading3 ? "h3" : "paragraph"}>
          <option value="paragraph">Paragraph</option>
          <option value="h1">Header</option>
          <option value="h2">Title</option>
          <option value="h3">Subtitle</option>
        </select>
        
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={editorState.isBold ? 'is-active' : ''}
        >
          <FaBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          className={editorState.isItalic ? 'is-active' : ''}
        >
          <FaItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={editorState.isStrike ? 'is-active' : ''}
        >
          <FaStrikethrough />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          className={editorState.isCode ? 'is-active' : ''}
        >
          <FaCode />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editorState.isBlockquote ? 'is-active' : ''}
        >
          <FaQuoteRight />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleLink().run()}
          className={editorState.isLink ? 'is-active' : ''}
        >
          <FaLink />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState.isBulletList ? 'is-active' : ''}
        >
          <FaListUl />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.isOrderedList ? 'is-active' : ''}
        >
          <FaListOl />
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}><MdHorizontalRule /></button>
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo}>
          <FaUndo />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo}>
          <FaRedo />
        </button>
      </div>
    </div>
  )
}

export default MenuBar;