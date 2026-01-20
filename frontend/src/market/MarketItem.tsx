import { IoStar } from "react-icons/io5"
import '../App.css'
import { useNavigate } from "react-router";
import type { MarketItem } from "./Interfaces/MarketItem";
import { currencySymbols } from "../utils/Currencies";

interface MarketItemProps {
  item?: MarketItem;
}

function Asset(props: MarketItemProps) {
  let navigate = useNavigate();
  
  const priceNumber: number = (props.item?.versions[0]?.price ?? 0);

  return (
    <div className="market-asset" onClick={() => {
      navigate("/" + props.item?.vendor?.username + "/" + props.item?.urlId);
    }}>
      <div className="market-asset-thumbnail">
        <img src={props.item?.image} />
      </div>
      <div className="market-asset-details">
        <div className="market-asset-title">
          <h2>{props.item?.title}</h2>
        </div>
        <div className="market-asset-footer">
          <div className="market-asset-stars">
            <IoStar /><p>{props.item?.rating} ({props.item?.ratings})</p>
          </div>
          <div className="market-asset-price">
            <p>
              {
                priceNumber === 0 ? "FREE" : `${currencySymbols[props.item?.versions[0]?.currency ?? 'USD']}${priceNumber.toFixed(2)}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Asset
