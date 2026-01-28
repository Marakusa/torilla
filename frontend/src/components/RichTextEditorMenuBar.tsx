import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { useCallback, useState, useRef, useEffect } from "react";
import { FaBold, FaCode, FaImage, FaItalic, FaLink, FaListOl, FaListUl, FaQuoteRight, FaRedo, FaStrikethrough, FaUndo } from "react-icons/fa"
import { MdHorizontalRule } from "react-icons/md"

function MenuBar({ editor }: { editor: Editor }) {
  const addImage = useCallback((url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      setImageUrlFieldValue("");
      setImageDialog(false);
    }
  }, [editor]);
  function setLink() {
    if (editorState.lastChainFocus) {
      editorState.lastChainFocus().toggleLink({ href: linkUrlFieldValue }).run();
      setLinkDialog(false);
    }
  }
  function removeLink() {
    if (editorState.lastChainFocus) {
      editorState.lastChainFocus().unsetLink().run();
      setLinkDialog(false);
    }
  }

  const [linkUrlFieldValue, setLinkUrlFieldValue] = useState("");
  const [linkDialog, setLinkDialog] = useState(false);
  const linkDialogRef = useRef<HTMLDivElement | null>(null);
  const linkButtonRef = useRef<HTMLButtonElement | null>(null);

  const [imageUrlFieldValue, setImageUrlFieldValue] = useState("");
  const [imageDialog, setImageDialog] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!imageDialog && !linkDialog) {
        return;
      }
      const target = e.target as Node | null;
      if (!target) return;
      if ((dialogRef.current && dialogRef.current.contains(target)) || (linkDialogRef.current && linkDialogRef.current.contains(target))) return;
      if ((buttonRef.current && buttonRef.current.contains(target)) || (linkButtonRef.current && linkButtonRef.current.contains(target))) return;
      if (imageDialog) {
        setImageUrlFieldValue("");
        setImageDialog(false);
      }
      if (linkDialog) {
        setLinkUrlFieldValue("");
        setLinkDialog(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (imageDialog && e.key == "Enter") {
        addImage(imageUrlFieldValue);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageDialog, imageUrlFieldValue, linkDialog]);

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
        isImage: ctx.editor.isActive('image') ?? false,
        lastChainFocus: () => ctx.editor.chain().focus(),
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

        <div style={{ display: "flex" }}>
          <button
            onClick={() => {
              if (linkDialog) {
                setLinkUrlFieldValue("");
              }
              setLinkDialog(!linkDialog);
            }}
            ref={linkButtonRef}
          >
            <FaLink />
          </button>
          {
            linkDialog && (
              <div ref={linkDialogRef} className="richtext-dialog">
                <input className="text-field" type="url" id="link-url" placeholder="Add a Link..." onChange={(e) => setLinkUrlFieldValue(e.target.value)} value={linkUrlFieldValue} />
                <button className="button-secondary" onClick={() => setLink()}>Add Link</button>
                {editorState.isLink && <button className="button-secondary" onClick={() => removeLink()}>Remove Link</button>}
              </div>
            )
          }
        </div>

        <div style={{ display: "flex" }}>
          <button
            onClick={() => {
              if (imageDialog) {
                setImageUrlFieldValue("");
              }
              setImageDialog(!imageDialog);
            }}
            ref={buttonRef}
          >
            <FaImage />
          </button>
          {
            imageDialog && (
              <div ref={dialogRef} className="richtext-dialog">
                <input className="text-field" type="url" id="image-url" placeholder="Image URL..." onChange={(e) => setImageUrlFieldValue(e.target.value)} value={imageUrlFieldValue} />
                <span>or</span>
                <input type="file" id="image-file" hidden />
                <button className="button-secondary">Upload Image</button>
              </div>
            )
          }
        </div>

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
