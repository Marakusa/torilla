import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import Home from './Home'
import Market from "./Market";
import NotFound from "./errors/NotFound";
import ProductPage from "./market/ProductPage";
import ProductPageEditor from "./market/ProductPageEditor";
import LoginPage from "./LoginPage";
import LogoutPage from "./LogoutPage";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="market" element={<Market />} />
        
        <Route path="login" element={<LoginPage />} />
        <Route path="logout" element={<LogoutPage />} />

        <Route path=":vendorName/:urlId" element={<ProductPage />} />
        <Route path=":vendorName/:urlId/edit" element={<ProductPageEditor />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
