import { TextStyleKit } from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
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
import { useLoadingBar } from "../context/LoadingContext";

const extensions = [TextStyleKit, StarterKit, Image, Link.configure({
  enableClickSelection: true,
  openOnClick: false,
  autolink: true,
  defaultProtocol: 'https',
  protocols: ['http', 'https'],
  isAllowedUri: (url, ctx) => {
    try {
      // construct URL
      const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

      // use default validation
      if (!ctx.defaultValidate(parsedUrl.href)) {
        return false
      }

      // disallowed protocols
      const disallowedProtocols = ['ftp', 'file', 'mailto']
      const protocol = parsedUrl.protocol.replace(':', '')

      if (disallowedProtocols.includes(protocol)) {
        return false
      }

      // only allow protocols specified in ctx.protocols
      const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

      if (!allowedProtocols.includes(protocol)) {
        return false
      }

      // disallowed domains
      const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
      const domain = parsedUrl.hostname

      if (disallowedDomains.includes(domain)) {
        return false
      }

      // all checks have passed
      return true
    } catch {
      return false
    }
  },
  shouldAutoLink: url => {
    try {
      // construct URL
      const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

      // only auto-link if the domain is not in the disallowed list
      const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
      const domain = parsedUrl.hostname

      return !disallowedDomains.includes(domain)
    } catch {
      return false
    }
  },
}),
];

function ProductPageEditor() {
  const { setLoading } = useLoadingBar();

  const { vendorName, urlId } = useParams<{ vendorName?: string, urlId?: string }>();
  const [fetching, setFetching] = useState<boolean>(true);
  const [product, setProduct] = useState<MarketItemProps | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetching(true);
    api.getProductByUrl(vendorName ?? "", urlId ?? "").then((fetchedProduct) => {
      setProduct(fetchedProduct);
      setFetching(false);
      setLoading(false);
    }).catch(() => {
      setFetching(false);
      setLoading(false);
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

  if (fetching) return (
    <>
      <Header />
    </>);
  if (!product) return (
    <>
      <Header />
      <NotFound />
    </>);

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

        <div className="editor-main">

          <div className="editor-main-item">
            <label>Title</label>
            <input type="text" id="product-title" name="title" value={product.title} className="text-field" />
          </div>

          <div className="editor-description">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="product-description-richtext-editor" />
          </div>

        </div>
      </div>
    </>
  );
}

export default ProductPageEditor
