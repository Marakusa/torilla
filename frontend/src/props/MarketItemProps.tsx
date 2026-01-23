import type { VendorProps } from "./VendorProps";

interface MarketItemProps {
  shortUrl: string,
  title: string,
  iconUrl: string,
  description: string,
  tags: string[],
  thumbnails: string[],
  $id: string,
  $createdAt: string,
  $updatedAt: string,
  vendor: VendorProps,
  versions: AssetVersion[],
  $databaseId: string,
  $collectionId: string
}

interface AssetVersion {
  name?: string;
  price?: number;
  currency?: string;
}

export type { MarketItemProps };