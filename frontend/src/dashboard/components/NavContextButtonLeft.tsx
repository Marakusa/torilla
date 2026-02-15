import { useState } from 'react'
import { FaArrowRight } from "react-icons/fa";
import { NavLink } from "react-router";

export default function NavContextButtonLeft({ value, contextMenuItems, id }: { value: string, contextMenuItems: { value?: string, to?: string, hr?: boolean }[], id: string }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={`side-nav-context ${showDropdown && "side-nav-context-open"}`}>
      <p className="side-nav-a" id={id} onClick={() => setShowDropdown(!showDropdown)}>
        <span className="side-nav-a-text">{value}</span>
        <FaArrowRight className="side-nav-context-arrow" />
      </p>
      {
        showDropdown &&
        <div className="side-nav-context-dropdown">
          {contextMenuItems.map((contextMenuItem, index) => contextMenuItem.hr ? <hr key={index}></hr> : <NavLink key={index} to={contextMenuItem.to ?? "/"} className="side-nav-context-a" id="side-nav-button-market">{contextMenuItem.value}</NavLink>)}
        </div>
      }
    </div>
  )
}
