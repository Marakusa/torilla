import type { ProductReviewProps } from "./ProductReviewProps";
import type { VendorProps } from "./VendorProps";

interface MarketItemProps {
  shortUrl: string,
  title: string,
  iconUrl: string,
  description: string,
  reviewCount: number,
  reviewValue: number,
  tags: string[],
  thumbnails: string[],
  $id: string,
  $createdAt: string,
  $updatedAt: string,
  vendor: VendorProps,
  versions: AssetVersion[],
  productReviews: ProductReviewProps[],
  $databaseId: string,
  $collectionId: string
}

interface AssetVersion {
  $id: string,
  name?: string;
  price?: number;
  currency?: string;
}

export type { MarketItemProps, AssetVersion };