import { NavLink } from "react-router"

export default function NavButtonLeft({ to, value, id }: { to: string, value: string, id: string }) {
  return (
    <NavLink to={to} className="side-nav-a" id={id}>{value}</NavLink>
  )
}
