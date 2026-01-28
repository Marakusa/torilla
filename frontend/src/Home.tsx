import { NavLink } from "react-router"
import './App.css'
import './Home.css'
import Header from './Header'
import Footer from "./Footer"
import { useAuth } from "./context/AuthContext"

function Home() {
  const { user, loadingAuth } = useAuth();
  
  if (loadingAuth) {
    return (<></>);
  }

  return (
    <>
      <Header />
      <div className="hero-section">
        <h1>Turn your idea into an euro</h1>
        <p>Discover, buy, and sell digital assets with ease on Torilla.</p>
        <div className="hero-actions">
          <NavLink to="/market" className="button-primary">Explore the Market</NavLink>
          <NavLink to={user ? "/dashboard" : "/login"} className="button-secondary">Start Selling</NavLink>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Home
