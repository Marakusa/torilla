import './App.css'
import './Market.css'
import Header from './Header'
import Asset from "./market/MarketItem"
import api from './lib/torillaBackend'
import { useEffect, useState } from "react"
import type { MarketItemProps } from "./props/MarketItemProps"
import Footer from "./Footer"

function Market() {
  const [products, setProducts] = useState<MarketItemProps[] | null>(null);
  const [fetchingProducts, setFetchingProducts] = useState<boolean>(false);
  const [fetchedProducts, setFetchedProducts] = useState<boolean>(false);

  async function fetchProducts() {
    if (fetchingProducts) {
      return;
    }

    setFetchingProducts(true);
    const fetchedProducts = await api.listProducts();
    setProducts(fetchedProducts);
    setFetchingProducts(false);
    setFetchedProducts(true);
  }

  useEffect(() => {
    if (fetchedProducts || fetchingProducts) {
      return;
    }
    fetchProducts();
  }, [products, fetchingProducts]);

  return (
    <>
      <Header />
      <div className="content">
        <h1>Market</h1>
        <div className="market-assets">
          {products?.map((asset, index) => (
            <Asset key={index} {...asset} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Market
