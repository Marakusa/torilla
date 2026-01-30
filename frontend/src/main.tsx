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
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./settings/SettingsPage";
import { LoadingBarProvider } from "./context/LoadingContext";
import Dashboard from "./dashboard/Dashboard";
import DashboardNotFound from "./errors/DashboardNotFound";
import DashboardMain from "./dashboard/DashboardMain";
import DashboardProducts from "./dashboard/DashboardProducts";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LoadingBarProvider>
        <AuthProvider>
          <Routes>
            <Route index element={<Home />} />
            <Route path="market" element={<Market />} />

            <Route path="login" element={<LoginPage />} />
            <Route path="logout" element={<LogoutPage />} />

            <Route path=":username" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route path=":vendorName/:urlId" element={<ProductPage />} />
            <Route path=":vendorName/:urlId/edit" element={<ProductPageEditor />} />

            <Route path="dashboard" element={<Dashboard />}>
              <Route index element={<DashboardMain />} />
              <Route path="products" element={<DashboardProducts />} />
              <Route path="*" element={<DashboardNotFound />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </LoadingBarProvider>
    </BrowserRouter>
  </StrictMode>,
)
