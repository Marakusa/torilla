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

async function uploadFilesRequest(endpoint: string, files: FileList): Promise<string[]> {
  const cookies = new Cookies(null, { path: '/' });
  const token = cookies.get("X-Session-Token");
  if (!token) throw { message: "Missing session token." };

  const form = new FormData();
  console.log(files);
  const fileArray = Array.from(files);
  if (fileArray.length === 0) throw { message: "No files provided." };

  for (const file of fileArray) {
    if (file.size > 5 * 1024 * 1024) throw { message: "One of the thumbnails is too large." };
    if (!file.type.startsWith("image/")) throw { message: "Invalid file type provided." };
    form.append("files", file, file.name);
  }

  const response = await fetch(config.backend.host + endpoint, {
    method: "POST",
    headers: {
      "X-Session-Token": token
    },
    body: form
  });

  const body = await response.json();
  if (response.ok) return body as string[];
  throw { message: body?.message ?? "Failed to upload thumbnails." };
};

const getProfile = async (username: string): Promise<ProfileProps> => await request("GET", "/profiles/" + username);
const getAccount = async (): Promise<SessionLoginProps> => await request("GET", "/accounts");
const patchAccount = async () => await request("PATCH", "/accounts");
const uploadAccountAvatar = async (file: File | Blob) => await uploadFileRequest("/accounts/avatar", file);
const changePassword = async () => await request("PUT", "/accounts/password");
const getAllSessions = async (): Promise<SessionData[]> => await request("GET", "/accounts/session");
const login = async (email: string, password: string): Promise<SessionLoginProps> => await request("POST", "/auth/login", JSON.stringify({ email: email, password: password }));
const logout = async () => await request("GET", "/accounts/logout");
const register = async (username: string, email: string, password: string) => await request("POST", "/auth/register", JSON.stringify({ username: username, email: email, password: password }));
const listProducts = async (): Promise<MarketItemProps[]> => await request("GET", "/products/list");
const listProductsFromUser = async (username: string): Promise<MarketItemProps[]> => await request("GET", "/products/list/" + username);
const getProductById = async (id: string): Promise<MarketItemProps> => await request("GET", "/products/" + id);
const getProductByUrl = async (vendor: string, shortUrl: string): Promise<MarketItemProps> => await request("GET", "/products/" + vendor + "/" + shortUrl);
const updateProduct = async (id: string, data: MarketItemProps): Promise<MarketItemProps> => await request("PATCH", "/products/" + id, JSON.stringify(data) ?? "{}");
const uploadThumbnail = async (id: string, files: FileList): Promise<string[]> => await uploadFilesRequest("/products/" + id + "/thumbnails", files);
const updateThumbnails = async (id: string, thumbnails: string[]) => await request("PUT", "/products/" + id + "/thumbnails", JSON.stringify(thumbnails) ?? "[]");

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
  updateProduct,
  uploadThumbnail,
  updateThumbnails
};

export default api;