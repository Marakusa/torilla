import type { VendorProps } from "./VendorProps";

interface ProductReviewProps {
  $id: string;
  stars: number;
  content: string;
  reviewer: {
    $id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
  productReviewReply?: {
    $id: string;
    content: string;
    replier: VendorProps;
  } | null;
}

export type { ProductReviewProps };