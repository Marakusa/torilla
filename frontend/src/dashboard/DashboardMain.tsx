import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { MarketItemProps } from "../props/MarketItemProps";
import api from "../lib/torillaBackend";
import { useNavigate } from "react-router";

export default function DashboardMain() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<MarketItemProps[] | null>(null);
  const [fetchingProducts, setFetchingProducts] = useState<boolean>(false);
  const [fetchedProducts, setFetchedProducts] = useState<boolean>(false);

  async function fetchProducts() {
    if (fetchingProducts) {
      return;
    }
    setFetchingProducts(true);
    const fetchedProducts = await api.listProductsFromUser(user?.user.username ?? "");
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
    <div className="dashboard-content">
      <h1>Hello, {user?.user.displayName}!</h1>

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <h2>Balance</h2>
          <h1>0,00 EUR</h1>
        </div>

        <div className="dashboard-card">
          <h2>Sales (7 days)</h2>
          <h1>0,00 EUR</h1>
        </div>

        <div className="dashboard-card">
          <h2>Sales (30 days)</h2>
          <h1>0,00 EUR</h1>
        </div>

        <div className="dashboard-card">
          <h2>Sales (Total)</h2>
          <h1>0,00 EUR</h1>
        </div>

      </div>

      <div className="dashboard-section">
        <h2>Products</h2>
        {products === null ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>You have no products yet. <a href="/dashboard/new">Create your first product now!</a></p>
        ) : (
          <table className="dashboard-products-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.$id} onClick={() => navigate("/" + product.vendor.username + "/" + product.shortUrl + "/edit")} style={{ cursor: "pointer" }}>
                  <td className="dashboard-product-list-icon"><img src={product.iconUrl} alt={product.title} style={{ width: "64px", height: "64px", objectFit: "cover" }} /></td>
                  <td>{product.title}</td>
                  <td>{product.versions.length > 0 ? `${product.versions[0].currency} ${product.versions[0].price?.toFixed(2)}` : "N/A"}</td>
                  <td>{0}</td>
                  <td>{new Date(product.$createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
