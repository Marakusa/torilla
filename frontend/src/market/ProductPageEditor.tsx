import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Header from "../Header";
import MenuBar from "../components/RichTextEditorMenuBar";
import NotFound from "../errors/NotFound";
import { useParams } from "react-router";

const extensions = [TextStyleKit, StarterKit, Image]

function ProductPageEditor() {
  return (<></>)
}
/*function ProductPageEditor() {
  const { vendorName, urlId } = useParams<{ vendorName?: string, urlId?: string }>();
  
  const product = demoAssets.find(asset => asset.urlId.toLowerCase() === urlId?.toLowerCase() && asset.vendor?.username.toLowerCase() === vendorName?.toLowerCase());

  if (!product) {
    return <NotFound />;
  }

  let initialContent: any = product.content ?? null;
  try {
    const storedFull = localStorage.getItem(`product-${product.urlId}`);
    if (storedFull) {
      const parsed = JSON.parse(storedFull);
      initialContent = parsed.content ?? parsed;
    } else {
      const storedContent = localStorage.getItem(`product-content-${product.urlId}`);
      if (storedContent) initialContent = JSON.parse(storedContent);
    }
  } catch (e) {
    console.error("Failed to load stored product content:", e);
  }

  const editor = useEditor({
    extensions,
    content: initialContent ?? '',
  });

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
}*/

export default ProductPageEditor
