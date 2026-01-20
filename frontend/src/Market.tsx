import './App.css'
import Header from './Header'
import Asset from "./market/MarketItem"
import demoAssets from "./demo/assets.json"

function Market() {
  return (
    <>
      <Header />
      <div className="content">
        <h1>Market</h1>
        <div className="market-assets">
          {demoAssets.map((asset, index) => (
            <Asset key={index} item={asset} />
          ))}
        </div>
      </div>
    </>
  )
}

export default Market
