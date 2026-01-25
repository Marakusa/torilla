import config from '../../public/config.json';
import type { MarketItemProps } from "../props/MarketItemProps";
import type { ProfileProps } from "../props/ProfileProps";
import type { SessionLoginProps } from "../props/SessionLoginProps";
import Cookies from 'universal-cookie';

export interface TorillaApiException {
  message: string;
}

async function request(method: string, endpoint: string, data?: string | undefined): Promise<any> {
  const cookies = new Cookies(null, { path: '/' });

  const requestInit: RequestInit = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": cookies.get("X-Session-Token")
    }
  };

  if (data) {
    requestInit.body = data;
  }

  const response = await fetch(config.backend.host + endpoint, requestInit);

  const body = await response.json();
  if (response.ok) {
    return body;
  }

  const exception: TorillaApiException = {
    message: body.message
  };
  throw exception;
}

const getProfile = async (username: string): Promise<ProfileProps> => await request("GET", "/profiles/" + username);
const getAccount = async (): Promise<SessionLoginProps> => await request("GET", "/auth/account");
const login = async (email: string, password: string): Promise<SessionLoginProps> => await request("POST", "/auth/login", JSON.stringify({ email: email, password: password }));
const register = async (username: string, email: string, password: string) => await request("POST", "/auth/register", JSON.stringify({ username: username, email: email, password: password }));
const listProducts = async (): Promise<MarketItemProps[]> => await request("GET", "/products/list");
const listProductsFromUser = async (username: string): Promise<MarketItemProps[]> => await request("GET", "/products/list/" + username);
const getProductById = async (id: string): Promise<MarketItemProps> => await request("GET", "/products/" + id);
const getProductByUrl = async (vendor: string, shortUrl: string): Promise<MarketItemProps> => await request("GET", "/products/" + vendor + "/" + shortUrl);
const updateProductDescription = async (id: string, data: string | null): Promise<MarketItemProps> => await request("POST", "/products/" + id + "/description", data ?? "{}");

const api = {
  getProfile,
  getAccount,
  login,
  register,
  listProducts,
  listProductsFromUser,
  getProductById,
  getProductByUrl,
  updateProductDescription
};

export default api;