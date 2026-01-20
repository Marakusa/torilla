import '../App.css'
import Header from '../Header'
import { useParams } from "react-router"
import NotFound from "../errors/NotFound"
import demoAssets from "../demo/assets.json"
import ImageCarousel from "../components/ImageCarousel"
import ProfileLink from "../components/ProfileLink"
import StarRating from "../components/StarRating"
import { currencySymbols } from "../utils/Currencies"

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyleKit } from '@tiptap/extension-text-style'

const extensions = [TextStyleKit, StarterKit]

function ProductPage() {
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
    editable: false,
    content: initialContent ?? '',
  });

  const priceNumber: number = (product.versions[0]?.price ?? 0);
  
  return (
    <>
      <Header />
      <div className="content">
        <ImageCarousel images={product.images ?? []} />
        <div className="product-content">
          <div className="product-body">
            <div className="product-header">
              <h1>{product?.title}</h1>
              <div className="product-header-details">
                <ProfileLink username={product?.vendor?.username} displayName={product?.vendor?.displayName} avatarUrl={product?.vendor.avatar} />
                <StarRating rating={product?.rating} ratings={product?.ratings} />
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
