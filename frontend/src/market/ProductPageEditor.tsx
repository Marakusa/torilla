import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Header from "../Header";
import MenuBar from "../components/RichTextEditorMenuBar";

const extensions = [TextStyleKit, StarterKit]

function ProductPageEditor() {
  const editor = useEditor({ extensions });

  const handleSave = () => {
    if (!editor) return;
    console.log(editor.getJSON());
  };



  return (
    <>
      <Header />
      <div className="content">
        <div className="editor-toolbar">
          <button onClick={handleSave} disabled={!editor}>Save</button>
        </div>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </>
  );
}

export default ProductPageEditor
