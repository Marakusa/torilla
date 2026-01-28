import config from '../../public/config.json';
import type { MarketItemProps } from "../props/MarketItemProps";
import type { ProfileProps } from "../props/ProfileProps";
import type { SessionLoginProps } from "../props/SessionLoginProps";
import Cookies from 'universal-cookie';
import type { SessionData } from "../settings/SessionData";

export function isTorillaApiException(ex: unknown): ex is TorillaApiException {
  return typeof ex === "object" && ex !== null && "message" in ex;
}

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

async function uploadFileRequest(endpoint: string, file: File | Blob): Promise<any> {
  const cookies = new Cookies(null, { path: '/' });
  const token = cookies.get("X-Session-Token");
  if (!token) throw { message: "Missing session token." };

  const form = new FormData();
  form.append("file", file);

  const response = await fetch(config.backend.host + endpoint, {
    method: "POST",
    headers: {
      "X-Session-Token": token
    },
    body: form
  });

  const body = await response.json();
  if (response.ok) return body;
  throw { message: body.message };
};

const getProfile = async (username: string): Promise<ProfileProps> => await request("GET", "/profiles/" + username);
const getAccount = async (): Promise<SessionLoginProps> => await request("GET", "/account");
const patchAccount = async () => await request("PATCH", "/account");
const uploadAccountAvatar = async (file: File | Blob) => await uploadFileRequest("/account/avatar", file);
const changePassword = async () => await request("PUT", "/account/password");
const getAllSessions = async (): Promise<SessionData[]> => await request("GET", "/account/session");
const login = async (email: string, password: string): Promise<SessionLoginProps> => await request("POST", "/auth/login", JSON.stringify({ email: email, password: password }));
const logout = async () => await request("GET", "/account/logout");
const register = async (username: string, email: string, password: string) => await request("POST", "/auth/register", JSON.stringify({ username: username, email: email, password: password }));
const listProducts = async (): Promise<MarketItemProps[]> => await request("GET", "/products/list");
const listProductsFromUser = async (username: string): Promise<MarketItemProps[]> => await request("GET", "/products/list/" + username);
const getProductById = async (id: string): Promise<MarketItemProps> => await request("GET", "/products/" + id);
const getProductByUrl = async (vendor: string, shortUrl: string): Promise<MarketItemProps> => await request("GET", "/products/" + vendor + "/" + shortUrl);
const updateProduct = async (id: string, data: MarketItemProps): Promise<MarketItemProps> => await request("PUT", "/products/" + id, JSON.stringify(data) ?? "{}");

const api = {
  getProfile,
  getAccount,
  patchAccount,
  uploadAccountAvatar,
  changePassword,
  getAllSessions,
  login,
  logout,
  register,
  listProducts,
  listProductsFromUser,
  getProductById,
  getProductByUrl,
  updateProduct
};

export default api;