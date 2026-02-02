import api from '../lib/torillaBackend'
import '../App.css'
import './ProductPage.css'
import Header from '../Header'
import { NavLink, useParams } from "react-router"
import NotFound from "../errors/NotFound"
import ImageCarousel from "../components/ImageCarousel"
import ProfileLink from "../components/ProfileLink"
import StarRating from "../components/StarRating"
import { currencySymbols } from "../utils/Currencies"

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link';
import { TextStyleKit } from '@tiptap/extension-text-style'
import { useEffect, useState } from "react"
import type { MarketItemProps } from "../props/MarketItemProps"
import ProductDetailedReviews from "../components/ProductDetailedReviews"
import { useLoadingBar } from "../context/LoadingContext"
import { useAuth } from "../context/AuthContext"
import { FaPen } from "react-icons/fa"

const extensions = [TextStyleKit, StarterKit, Image, Link.configure({
  openOnClick: true,
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

function ProductPage() {
  const { user } = useAuth();
  const { setLoading } = useLoadingBar();

  const { vendorName, urlId } = useParams<{ vendorName: string, urlId: string }>();
  const [fetching, setFetching] = useState<boolean>(true);
  const [product, setProduct] = useState<MarketItemProps | null>(null);

  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);

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
    editable: false,
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

  return (
    <>
      <Header />
      <div className="content">
        <ImageCarousel images={product.thumbnails ?? []} />
        <div className="product-content">
          <div className="product-body">
            <div className="product-header">
              <h1>{product?.title}</h1>
              <div className="product-header-details">
                <ProfileLink username={product?.vendor?.username} displayName={product?.vendor?.displayName} avatarUrl={product?.vendor?.avatarUrl} />
                <StarRating rating={product?.reviewValue} ratings={product?.reviewCount} />
              </div>
            </div>
            <div className="product-tags">
              {product.tags?.map(tag => <span key={tag} className="product-tag">{tag}</span>)}
            </div>

            <div className="product-description">
              {editor ? <EditorContent editor={editor} /> : null}
            </div>
          </div>

          <div className="product-right-content">
            {user?.user?.$id === product.vendor.$id && <NavLink to="edit" className="button-secondary button-iconed"><FaPen /> Edit Product </NavLink>}
            <div className="product-purchase">
              {
                product.versions.length > 1 ?
                  <div className="product-purchase-box-multi">
                    {
                      product.versions.map((version, index) =>
                        <button key={version.$id} className={`product-version ${selectedVersionIndex === index ? "button-primary product-version-selected" : "button-secondary"}`} onClick={() => setSelectedVersionIndex(index)}>
                          <p className="product-version-title"><span className="product-version-price">{(version.price ?? 0) === 0 ? "FREE" : `${currencySymbols[version.currency ?? 'USD']}${(version.price ?? 0).toFixed(2)}`}</span>{version.name}</p>
                          {
                            version.features.length > 0 && <ul>
                              {
                                version.features.map((feature) => <li>{feature}</li>)
                              }
                            </ul>
                          }
                        </button>
                      )
                    }
                    <button className="button-primary">Buy Now</button>
                  </div>
                  :
                  <div className="product-purchase-box">
                    <p className="product-price">
                      {
                        (product.versions[0]?.price ?? 0) === 0 ? "FREE" : `${currencySymbols[product.versions[0]?.currency ?? 'USD']}${(product.versions[0]?.price ?? 0).toFixed(2)}`
                      }
                    </p>
                    {
                      product.versions[0]?.features.length > 0 && <ul>
                        {
                          product.versions[0]?.features.map((feature) => <li>{feature}</li>)
                        }
                      </ul>
                    }
                    <button className="button-primary">Buy Now</button>
                  </div>
              }
            </div>

            <ProductDetailedReviews product={product} />
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductPage
