import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Header from "../Header";
import '../App.css';
import './ProductPage.css';
import MenuBar from "../components/RichTextEditorMenuBar";
import NotFound from "../errors/NotFound";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import type { MarketItemProps } from "../props/MarketItemProps";
import api from "../lib/torillaBackend";
import "./ProductPageEditor.css";

const extensions = [TextStyleKit, StarterKit, Image]

function ProductPageEditor() {
  const { vendorName, urlId } = useParams<{ vendorName?: string, urlId?: string }>();
  const [fetching, setFetching] = useState<boolean>(true);
  const [product, setProduct] = useState<MarketItemProps | null>(null);

  useEffect(() => {
    setFetching(true);
    api.getProductByUrl(vendorName ?? "", urlId ?? "").then((fetchedProduct) => {
      setProduct(fetchedProduct);
      setFetching(false);
    }).catch(() => {
      setFetching(false);
    });
  }, [api, vendorName, urlId]);

  const editor = useEditor({
    extensions,
    content: '',
  });

  useEffect(() => {
    if (!editor || !product) return;

    let content: any = '';
    try {
      const storedFull = localStorage.getItem(`product-${product.shortUrl}`);
      if (storedFull) {
        const parsed = JSON.parse(storedFull);
        content = parsed.content ?? parsed;
      } else if (product.description) {
        const bytes = Uint8Array.from(atob(product.description), c => c.charCodeAt(0));
        const jsonString = new TextDecoder().decode(bytes);
        content = JSON.parse(jsonString);
      }
    } catch (e) {
      console.error("Failed to load stored product content:", e);
      content = '';
    }

    editor.commands.setContent(content);
  }, [editor, product]);

  if (fetching) return <></>;
  if (!product) return <NotFound />;

  const handleSave = () => {
    if (!editor) return;
    const json = JSON.stringify(editor.getJSON());
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    console.log(base64);
  };

  return (
    <>
      <Header />
      <div className="content" id="page-editor-root">
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
