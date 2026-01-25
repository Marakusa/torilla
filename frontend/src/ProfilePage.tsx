import { useParams } from "react-router";
import Header from "./Header";
import api from "./lib/torillaBackend";
import './ProfilePage.css';
import type { ProfileProps } from "./props/ProfileProps";
import { useEffect, useState } from "react";
import NotFound from "./errors/NotFound";
import type { MarketItemProps } from "./props/MarketItemProps";
import Asset from "./market/MarketItem";
import Footer from "./Footer";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [fetching, setFetching] = useState<boolean>(true);
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [products, setProducts] = useState<MarketItemProps[] | null>(null);
  const [fetchingProducts, setFetchingProducts] = useState<boolean>(false);
  const [fetchedProducts, setFetchedProducts] = useState<boolean>(false);

  useEffect(() => {
    setFetching(true);
    api.getProfile(username ?? "").then((fetchedProfile) => {
      setProfile(fetchedProfile);
      setFetching(false);
    }).catch(() => {
      setFetching(false);
    });
  }, [api, username]);

  async function fetchProducts() {
    if (fetchingProducts) {
      return;
    }

    setFetchingProducts(true);
    const fetchedProducts = await api.listProductsFromUser(username ?? "");
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

  if (fetching) return (
    <>
      <Header />
    </>);
  if (!profile) return (
    <>
      <Header />
      <NotFound />
    </>);

  return (
    <>
      <Header />

      <div className="profile-default-banner"></div>

      <div className="content profile-content">
        <div className="user-data">
          <img src={profile.avatarUrl} alt={profile.displayName?.slice(0, 1) || profile.username?.slice(0, 1) || "?"} className="profile-avatar" />
          <h1>{profile.displayName}</h1>
          <h2><span style={{ userSelect: "none", fontSize: "medium" }}>&gt;</span>{profile.username}</h2>
        </div>
        <div>
          <h2>Products</h2>
          <div className="profile-assets">
            {products?.map((asset, index) => (
              <Asset key={index} {...asset} />
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
