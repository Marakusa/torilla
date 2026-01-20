import { Link } from "react-router";

function ProfileLink({ username, displayName, avatarUrl }: { username?: string, displayName?: string, avatarUrl?: string }) {
  return (
    <Link to={"/" + username} className="profile-link">
      <img src={avatarUrl} alt={displayName || username || "User Avatar"} className="avatar" />
      <span className="link">{displayName}</span>
    </Link>
  );
}

export default ProfileLink;