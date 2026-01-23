import { IoStar, IoStarHalfOutline, IoStarOutline } from "react-icons/io5";
import "./StarRating.css";

function StarRating({ rating, ratings, short }: { rating?: number; ratings?: number; short?: boolean }) {
  const filledStars = Math.floor(rating ?? 0);
  let hasHalfStar = rating && Math.round(rating % 1 * 2) == 1;
  const totalStars = 5;
  const stars = [];

  for (let i = 1; i <= totalStars; i++) {
    if (i <= filledStars) {
      stars.push(<IoStar />);
    } else {
      if (hasHalfStar) {
        stars.push(<IoStarHalfOutline />);
        hasHalfStar = false;
        continue;
      }
      stars.push(<IoStarOutline />);
    }
  }
  return (
    <div className="star-rating">
      {stars}
      {ratings !== undefined && !short && <span className="ratings-count">{ratings} ratings</span>}
      {ratings !== undefined && short && <span className="ratings-count">({ratings})</span>}
    </div>
  );
}

export default StarRating;