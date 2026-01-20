import type { Vendor } from "./Vendor";

interface MarketItem {
  id?: number;
  vendor?: Vendor;
  urlId?: string;
  title?: string;
  image?: string;
  tags?: string[];
  rating?: number;
  ratings?: number;
  versions: AssetVersion[];
  content?: any;
}

interface AssetVersion {
  name?: string;
  price?: number;
  currency?: string;
}

export type { MarketItem };