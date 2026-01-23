import type { MarketItemProps } from "../props/MarketItemProps";
import ProfileLink from "./ProfileLink";
import StarRating from "./StarRating";
import "./ProductDetailedReviews.css";
import "./StarRating.css";
import { useAuth } from "../context/AuthContext";
import { IoStar } from "react-icons/io5";

export default function ProductDetailedReviews(props: { product: MarketItemProps }) {
  const { user } = useAuth();

  return (
    <div className="product-reviews">
      <div className="product-reviews-title">
        <h2>Reviews</h2>
        <div className="product-reviews-title-rating">
          <IoStar />
          <span className="ratings-count pt-0.5">{props.product?.reviewValue.toFixed(1)} ({props.product?.reviewCount} reviews)</span>
        </div>
      </div>
      {
        props.product?.productReviews?.map(review =>
          <div className="product-review">
            <StarRating rating={review.stars} />
            <p>{review.content}</p>
            <ProfileLink username={review.reviewer.username} displayName={review.reviewer.displayName} avatarUrl={review.reviewer.avatarUrl} small={true} />
            {
              review.productReviewReply?.replier ?
                <div className="product-review-reply">
                  <p>{review.productReviewReply?.content}</p>
                  <div className="product-review-replier">
                    <ProfileLink username={review.productReviewReply?.replier.username} displayName={review.productReviewReply?.replier.displayName} avatarUrl={review.productReviewReply?.replier.avatarUrl} small={true} />
                    <div className="review-creator-tag">Creator</div>
                  </div>
                </div> :
                (props.product.vendor.$id === user?.user.$id && <button className="button-secondary">Reply</button>)
            }
          </div>
        )
      }
    </div>
  )
}
