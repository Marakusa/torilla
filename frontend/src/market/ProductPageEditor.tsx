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
import { useEffect, useRef, useState } from "react";
import type { MarketItemProps, AssetVersion } from "../props/MarketItemProps";
import api, { isTorillaApiException } from "../lib/torillaBackend";
import "./ProductPageEditor.css";
import { useLoadingBar } from "../context/LoadingContext";
import { useAuth } from "../context/AuthContext";
import InputWithPrefix from "../components/InputWithPrefix";
import { currencySymbols } from "../utils/Currencies";
import { FaLink, FaPlay, FaTrash, FaUpload } from "react-icons/fa";

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

  const iconUploadInput = useRef<HTMLInputElement | null>(null);
  const [icon, setIcon] = useState<string | undefined>(undefined);

  const thumbnailUploadInput = useRef<HTMLInputElement | null>(null);
  const [thumbnails, setThumbnails] = useState<{ url: string, video: boolean }[]>([]);

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
      setIcon(fetchedProduct.iconUrl);
      setThumbnails(fetchedProduct.thumbnails.map(t => ({ url: t, video: (/^(data:video)|\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i).test(t) })));
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

  function thumbnailsSelected(changed: React.ChangeEvent<HTMLInputElement>) {
    const files = changed.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const newThumbnails: { url: string, video: boolean }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newFile: { url: string, video: boolean } = {
        url: URL.createObjectURL(file),
        video: (/^(video)|\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i).test(file.type),
      };
      newThumbnails.push(newFile);
    }
    setThumbnails([...thumbnails, ...newThumbnails]);
    uploadThumbnails(files);
  }
  function deleteThumbnail(index: number) {
    setThumbnails(thumbnails.filter((_, i) => i !== index));
  }
  async function uploadThumbnails(thumbnailFiles: FileList) {
    try {
      if (thumbnailFiles.length === 0) {
        toast.error("No files provided.", { className: "toast-error" });
        return;
      }

      toast.error("Not implemented yet.", { className: "toast-error" });
      //await api.uploadProductThumbnails(thumbnailFiles);
      //await handleSave();
    } catch (ex) {
      console.error(ex);
      toast.error("Failed to upload thumbnails.", { className: "toast-error" });
    }
  }

  function iconSelected(changed: React.ChangeEvent<HTMLInputElement>) {
    const files = changed.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    setIcon(URL.createObjectURL(file));
    uploadIcon(file);
  }
  function deleteIcon() {
    setIcon(undefined);
  }
  async function uploadIcon(iconFile: File) {
    try {
      if (!iconFile) {
        toast.error("No file provided.", { className: "toast-error" });
        return;
      }
      toast.error("Not implemented yet.", { className: "toast-error" });
      //await api.uploadProductIcon(iconFile);
      //await handleSave();
    } catch (ex) {
      console.error(ex);
      toast.error("Failed to upload icon.", { className: "toast-error" });
    }
  }

  function thumbnailOnMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
    e.preventDefault();

    if (e.target !== e.currentTarget.firstChild as HTMLImageElement) return;

    const target = e.currentTarget as HTMLDivElement;
    const parent = target.parentElement as HTMLElement;
    if (!parent) return;

    const children = Array.from(parent.querySelectorAll('.editor-thumbnail')) as HTMLDivElement[];
    const startIndex = children.indexOf(target);
    if (startIndex === -1) return;

    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // create visual clone that follows the cursor
    const clone = target.cloneNode(true) as HTMLDivElement;
    clone.style.position = 'fixed';
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '10000';
    clone.style.opacity = '0.9';
    document.body.appendChild(clone);

    // Vertical drop indicator
    const dropIndicator = document.createElement('div');
    dropIndicator.className = 'thumbnail-drop-indicator';
    document.body.appendChild(dropIndicator);

    // placeholder in the list
    const placeholder = document.createElement('div');
    placeholder.className = 'thumbnail-placeholder';
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.display = getComputedStyle(target).display;
    placeholder.style.verticalAlign = getComputedStyle(target).verticalAlign;
    parent.insertBefore(placeholder, target);

    // hide original while dragging
    target.style.visibility = 'hidden';
    target.style.width = '0px';

    function onMouseMove(ev: MouseEvent): void {
      clone.style.left = `${ev.clientX - offsetX}px`;
      clone.style.top = `${ev.clientY - offsetY}px`;
      
      // Display vertical line indicating drop position
      let dropIndex = findDropIndex(ev.clientX, ev.clientY);
      if (dropIndex >= startIndex) {
        dropIndex += 1; // account for placeholder removal
      }
      const kids = Array.from(parent.children).filter(c => c !== placeholder) as HTMLElement[];
      if (kids.length === 0) {
        dropIndicator.style.left = `${parent.getBoundingClientRect().left}px`;
        dropIndicator.style.top = `${parent.getBoundingClientRect().top + parent.getBoundingClientRect().height / 2}px`;
      } else if (dropIndex >= kids.length) {
        const lastKidRect = kids[kids.length - 1].getBoundingClientRect();
        dropIndicator.style.left = `${lastKidRect.right}px`;
        dropIndicator.style.top = `${lastKidRect.top + lastKidRect.height / 2}px`;
      } else {
        const kidRect = kids[dropIndex].getBoundingClientRect();
        dropIndicator.style.left = `${kidRect.left}px`;
        dropIndicator.style.top = `${kidRect.top + kidRect.height / 2}px`;
      }
    }

    function findDropIndex(clientX: number, clientY: number): number {
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      if (!el) return startIndex;
      // find nearest .editor-thumbnail inside the same parent (ignore placeholder)
      let node: HTMLElement | null = el;
      while (node && node !== parent) {
        if (node.classList && node.classList.contains('editor-thumbnail')) {
          return Array.from(parent.querySelectorAll('.editor-thumbnail')).indexOf(node as HTMLDivElement);
        }
        node = node.parentElement;
      }
      // if over parent but not over a child, attempt to determine by x position
      const kids = Array.from(parent.children).filter(c => c !== placeholder) as HTMLElement[];
      for (let i = 0; i < kids.length; i++) {
        const r = kids[i].getBoundingClientRect();
        if (clientX < r.left + r.width / 2) return i;
      }
      return kids.length - 1;
    }

    function onMouseUp(ev: MouseEvent): void {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      dropIndicator.remove();

      const dropIndex = findDropIndex(ev.clientX, ev.clientY);

      // cleanup visuals
      clone.remove();
      placeholder.remove();
      target.style.visibility = '';
      target.style.width = '';

      // reorder state if changed
      if (dropIndex !== startIndex) {
        setThumbnails(prev => {
          const arr = [...prev];
          const [item] = arr.splice(startIndex, 1);
          // clamp dropIndex to valid range after removal
          const insertAt = Math.max(0, Math.min(dropIndex, arr.length));
          arr.splice(insertAt, 0, item);
          return arr;
        });
      }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  return (
    <>
      <Header />

      <Toaster />

      <div className="content editor-content" id="page-editor-root">
        <div className="editor-toolbar">
          <h2>{product.title}</h2>
          <button onClick={() => {
            handleSave();
            navigate(`${window.location.protocol}//${window.location.host}/${product.vendor.username}/${product.shortUrl}`);
          }} disabled={!editor || saving} className="button-secondary">{saving ? "..." : "Product Page"}</button>
          <button onClick={handleSave} disabled={!editor || saving} className="button-primary">{saving ? "..." : "Save"}</button>
        </div>

        <div className="editor-main">

          <div className="editor-main-left">

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

              <label>Thumbnails</label>

              <div className="editor-thumbnails">
                {thumbnails.map((thumbnail, index) =>
                  <div key={index} className="editor-thumbnail" onMouseDown={thumbnailOnMouseDown}>
                    {thumbnail.video ? (
                      <>
                        <video src={thumbnail.url} height={92} muted playsInline loop preload="metadata"></video>
                        <span className="play-button"><FaPlay /></span>
                      </>
                    ) : (
                      <img src={thumbnail.url} height={92} />
                    )}
                    <button className="editor-thumbnail-delete" onClick={() => deleteThumbnail(index)}><FaTrash /></button>
                  </div>
                )}
              </div>

              <button
                className="button-primary button-iconed"
                onClick={() => {
                  thumbnailUploadInput.current?.click();
                }}
              >
                <FaUpload /> Upload file
              </button>
              <button
                className="button-secondary button-iconed"
                onClick={() => {
                  const url = prompt("Enter media URL:");
                  if (url) {
                    setThumbnails([...thumbnails, url]);
                  }
                }}
              >
                <FaLink /> Link media
              </button>

              <input type="file" id="product-thumbnails" name="thumbnails" hidden ref={thumbnailUploadInput} multiple accept="image/*, video/*" onChange={(e) => thumbnailsSelected(e)} />

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

                      <div className="editor-main-item">
                        <label>Features</label>

                        {(version.features ?? []).map((feature, index) => (
                          <div key={index} className="editor-feature-row">
                            <input
                              type="text"
                              className="text-field"
                              value={feature}
                              onChange={(e) => {
                                const newValue = e.target.value;

                                setProduct(prevProduct => {
                                  if (!prevProduct) return prevProduct;

                                  const newVersions = prevProduct.versions.map(v => {
                                    if (v.$id !== version.$id) return v;

                                    const newFeatures = [...v.features];
                                    newFeatures[index] = newValue;

                                    return { ...v, features: newFeatures };
                                  });

                                  return { ...prevProduct, versions: newVersions };
                                });
                              }}
                            />

                            <button
                              className="button-secondary"
                              onClick={() => {
                                setProduct(prevProduct => {
                                  if (!prevProduct) return prevProduct;

                                  const newVersions = prevProduct.versions.map(v => {
                                    if (v.$id !== version.$id) return v;

                                    return {
                                      ...v,
                                      features: v.features.filter((_, i) => i !== index),
                                    };
                                  });

                                  return { ...prevProduct, versions: newVersions };
                                });
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}

                        <button
                          className="button-secondary"
                          onClick={() => {
                            setProduct(prevProduct => {
                              if (!prevProduct) return prevProduct;

                              const newVersions = prevProduct.versions.map(v =>
                                v.$id === version.$id
                                  ? { ...v, features: [...v.features, ""] }
                                  : v
                              );

                              return { ...prevProduct, versions: newVersions };
                            });
                          }}
                        >
                          + Add Feature
                        </button>

                      </div>
                    </div>;
                  })
                }

                <button onClick={() => {
                  const newVersion: AssetVersion = {
                    $id: "new_" + nextVersionId,
                    name: "",
                    currency: "USD",
                    price: 0,
                    features: [],
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

          <div className="editor-main-right">

            <div className="editor-main-item">
              <label>Icon</label>
              <img src={icon ?? "/default-icon.webp"} />
              <button className="button-primary button-iconed" onClick={() => {
                iconUploadInput.current?.click();
              }}><FaUpload /> Upload file</button>
              {icon && <button className="button-secondary button-iconed" onClick={() => deleteIcon()}><FaTrash /> Delete file</button>}
              <input type="file" id="product-icon" name="icon" hidden ref={iconUploadInput} accept="image/*" onChange={(e) => iconSelected(e)} />
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

export default ProductPageEditor
