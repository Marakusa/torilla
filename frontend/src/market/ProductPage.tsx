import api from '../lib/torillaBackend'
import '../App.css'
import Header from '../Header'
import { useParams } from "react-router"
import NotFound from "../errors/NotFound"
import ImageCarousel from "../components/ImageCarousel"
import ProfileLink from "../components/ProfileLink"
import StarRating from "../components/StarRating"
import { currencySymbols } from "../utils/Currencies"

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { useEffect, useState } from "react"
import type { MarketItemProps } from "../props/MarketItemProps"

const extensions = [TextStyleKit, StarterKit, Image]

function ProductPage() {
  const { vendorName, urlId } = useParams<{ vendorName: string, urlId: string }>();
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

  if (fetching) return <></>;
  if (!product) return <NotFound />;

  const priceNumber: number = (product.versions[0]?.price ?? 0);

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
                <ProfileLink username={product?.vendor?.displayName} displayName={product?.vendor?.displayName} avatarUrl={""/*product?.vendor.avatar*/} />
                <StarRating rating={0} ratings={0} />
              </div>
            </div>
            <div className="product-tags">
              {product.tags?.map(tag => <span key={tag} className="product-tag">{tag}</span>)}
            </div>

            <div className="product-description">
              {editor ? <EditorContent editor={editor} /> : null}
            </div>
          </div>
          <div className="product-purchase">
            <div className="product-purchase-box">
              <p className="product-price">
                {
                  priceNumber === 0 ? "FREE" : `${currencySymbols[product.versions[0]?.currency ?? 'USD']}${priceNumber.toFixed(2)}`
                }
              </p>
              <button className="button-primary">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductPage
