import { IoStar, IoStarOutline } from "react-icons/io5";

function StarRating({ rating, ratings }: { rating?: number; ratings?: number }) {
  const filledStars = Math.round(rating ?? 0);
  const totalStars = 5;
  const stars = [];

  for (let i = 1; i <= totalStars; i++) {
    if (i <= filledStars) {
      stars.push(<IoStar />);
    } else {
      stars.push(<span key={i} className="star"><IoStarOutline /></span>);
    }
  }
  return (
    <div className="star-rating">
      {stars}
      {ratings !== undefined && <span className="ratings-count">{ratings} ratings</span>}
    </div>
  );
}

export default StarRating;