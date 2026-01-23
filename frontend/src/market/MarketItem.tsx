import '../App.css'
import { useNavigate } from "react-router";
import type { MarketItemProps } from "../props/MarketItemProps";
import { currencySymbols } from "../utils/Currencies";
import StarRating from "../components/StarRating";

function Asset(props: MarketItemProps) {
  let navigate = useNavigate();

  const priceNumber: number = (props.versions[0]?.price ?? 0);

  return (
    <div className="market-asset" onClick={() => {
      navigate("/" + props.vendor?.username + "/" + props.shortUrl);
    }}>
      <div className="market-asset-thumbnail">
        <img src={props.iconUrl} />
      </div>
      <div className="market-asset-details">
        <div className="market-asset-title">
          <h2>{props.title}</h2>
        </div>
        <div className="market-asset-footer">
          <div className="market-asset-stars">
            <StarRating rating={props.reviewValue} ratings={props.reviewCount} short />
          </div>
          <div className="market-asset-price">
            <p>
              {
                priceNumber === 0 ? "FREE" : `${currencySymbols[props.versions[0]?.currency ?? 'USD']}${priceNumber.toFixed(2)}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Asset
