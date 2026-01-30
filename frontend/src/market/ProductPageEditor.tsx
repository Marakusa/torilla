import toast, { Toaster } from 'react-hot-toast';
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
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import type { MarketItemProps, AssetVersion } from "../props/MarketItemProps";
import api, { isTorillaApiException } from "../lib/torillaBackend";
import "./ProductPageEditor.css";
import { useLoadingBar } from "../context/LoadingContext";
import { useAuth } from "../context/AuthContext";
import InputWithPrefix from "../components/InputWithPrefix";
import { currencySymbols } from "../utils/Currencies";
import { FaTrash } from "react-icons/fa";

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
  const navigate = useNavigate();

  const { user, loadingAuth } = useAuth();
  const { setLoading } = useLoadingBar();

  const { vendorName, urlId } = useParams<{ vendorName?: string, urlId?: string }>();
  const [fetching, setFetching] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [product, setProduct] = useState<MarketItemProps | null>(null);

  const [nextVersionId, setNextVersionId] = useState<number>(1);

  useEffect(() => {
    if (product) {
      return;
    }

    setLoading(true);
    setFetching(true);
    api.getProductByUrl(vendorName ?? "", urlId ?? "").then((fetchedProduct) => {
      setProduct(fetchedProduct);
      setFetching(false);
    }).catch(() => {
      setFetching(false);
      setLoading(false);
    });
  }, [api, vendorName, urlId]);

  useEffect(() => {
    if (fetching || loadingAuth) {
      return;
    }

    setLoading(false);

    if (!loadingAuth && user?.user?.$id !== product?.vendor.$id) {
      navigate("/market");
    }
  }, [loadingAuth, user, navigate, fetching, product])

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
  if (loadingAuth) return (
    <>
      <Header />
    </>);

  const handleSave = async () => {
    try {
      if (!editor || saving) return;

      setSaving(true);

      const json = JSON.stringify(editor.getJSON());
      const bytes = new TextEncoder().encode(json);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const newProduct: MarketItemProps = { ...product };
      newProduct.description = base64;
      await api.updateProduct(product.$id, newProduct);
      toast.success("Product saved successfully.", { className: "toast-success" });

      setSaving(false);
    } catch (ex) {
      if (isTorillaApiException(ex)) {
        toast.error(ex.message, { className: "toast-error" });
        setSaving(false);
      } else if (typeof ex === "string") {
        toast.error(ex, { className: "toast-error" });
        setSaving(false);
      } else {
        toast.error("Failed to save product.", { className: "toast-error" });
        setSaving(false);
      }
    }
  };

  return (
    <>
      <Header />

      <Toaster />

      <div className="content editor-content" id="page-editor-root">
        <div className="editor-toolbar">
          <button onClick={() => {
            handleSave();
            navigate(`${window.location.protocol}//${window.location.host}/${product.vendor.username}/${product.shortUrl}`);
          }} disabled={!editor || saving} className="button-secondary">{saving ? "..." : "Product Page"}</button>
          <button onClick={handleSave} disabled={!editor || saving} className="button-primary">{saving ? "..." : "Save"}</button>
        </div>

        <div className="editor-main">

          <div className="editor-main-item">
            <label>Title</label>
            <input type="text" id="product-title" name="title" value={product.title} className="text-field" onChange={(e) => {
              const newTitle = e.target.value;

              setProduct(prevProduct => {
                if (!prevProduct) return prevProduct;

                prevProduct.title = newTitle;

                return { ...prevProduct };
              });
            }} />
          </div>

          <div className="editor-main-item">
            <label>Description</label>
            <div className="editor-description">
              <MenuBar editor={editor} />
              <EditorContent editor={editor} className="product-description-richtext-editor" />
            </div>
          </div>

          <div className="editor-main-item">
            <label>Short URL</label>
            <InputWithPrefix id="product-short-url" name="short-url" prefix={`${window.location.protocol}//${window.location.host}/${product.vendor.username}/`} value={product.shortUrl} onChange={(e) => {
              const newShortUrl = e.target.value;

              setProduct(prevProduct => {
                if (!prevProduct) return prevProduct;

                prevProduct.shortUrl = newShortUrl;

                return { ...prevProduct };
              });
            }} />
          </div>

          <div className="editor-main-item">

            <h2>Product Versions</h2>

            <div className="editor-versions">
              {
                product.versions.map(version => {
                  return <div key={version.$id} className="editor-version">

                    <div className="editor-version-header">

                      <h3>{version.name}</h3>

                      {product.versions.length > 1 && <button onClick={() => {
                        setProduct(prevProduct => prevProduct ? {
                          ...prevProduct,
                          versions: prevProduct.versions.filter((f) => f.$id !== version.$id)
                        } : prevProduct);
                      }} className="button-secondary"><FaTrash /></button>}

                    </div>

                    <div className="editor-main-item">
                      <label>Name</label>
                      <input type="text" id={`product-version-${version.$id}-title`} name={`version-${version.$id}-title`} value={version.name} className="text-field" onChange={(e) => {
                        const newName = e.target.value;

                        setProduct(prevProduct => {
                          if (!prevProduct) return prevProduct;

                          const newVersions = prevProduct.versions.map(v =>
                            v.$id === version.$id ? { ...v, name: newName } : v
                          );

                          return { ...prevProduct, versions: newVersions };
                        });
                      }} />
                    </div>
                    <div className="editor-main-item">
                      <label>Price</label>
                      <InputWithPrefix type="number" step=".01" min="0" id={`product-version-${version.$id}-price`} name={`version-${version.$id}-price`} prefix={currencySymbols[version?.currency ?? ''] + " " + version?.currency} value={version.price} onChange={(e) => {
                        const newPrice = Number(e.target.value);

                        setProduct(prevProduct => {
                          if (!prevProduct) return prevProduct;

                          const newVersions = prevProduct.versions.map(v =>
                            v.$id === version.$id ? { ...v, price: newPrice } : v
                          );

                          return { ...prevProduct, versions: newVersions };
                        });
                      }} />
                    </div>
                  </div>;
                })
              }

              <button onClick={() => {
                const newVersion: AssetVersion = {
                  $id: "new_" + nextVersionId,
                  name: "",
                  currency: "USD",
                  price: 0
                };
                setNextVersionId(nextVersionId + 1);
                setProduct(prevProduct => prevProduct ? {
                  ...prevProduct,
                  versions: [...prevProduct.versions, newVersion]
                } : prevProduct);
              }} className="button-primary">+ New Version</button>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

export default ProductPageEditor
