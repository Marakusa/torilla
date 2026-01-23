import { Link } from "react-router";
import "./ProfileLink.css";

function ProfileLink({ username, displayName, avatarUrl, small }: { username?: string, displayName?: string, avatarUrl?: string, small?: boolean }) {
  return (
    <Link to={"/" + username} className="profile-link">
      <img src={avatarUrl} alt={displayName?.slice(0, 1) || username?.slice(0, 1) || "?"} className={small ? `avatar-small` : `avatar`} />
      <span className="link">{displayName}</span>
    </Link>
  );
}

export default ProfileLink;