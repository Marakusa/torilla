import '../App.css'
import Header from '../Header'
import { NavLink } from "react-router"

function NotFound() {
  return (
    <>
      <Header />
      <div className="content not-found">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <NavLink to="/" className="button-primary">Return Home</NavLink>
      </div>
    </>
  )
}

export default NotFound
