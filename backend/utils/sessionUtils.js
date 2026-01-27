module.exports = {
  getBrowserFromUserAgent,
  howLongAgo,
  ipToLocation,
};

async function getBrowserFromUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();

  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("chrome") && !ua.includes("chromium")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("msie") || ua.includes("trident")) return "Internet Explorer";

  return "Unknown";
}

async function howLongAgo(dateTime = "") {
  const date = new Date(dateTime);
  const now = new Date();

  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

async function ipToLocation(ipAddress) {
  if (!ipAddress || ipAddress === "127.0.0.1" || ipAddress === "::1") {
    return {
      country: "Local",
      city: "Localhost",
      region: "",
      latitude: null,
      longitude: null
    };
  }

  try {
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    if (!response.ok) throw new Error("Failed IP lookup");

    const data = await response.json();

    return `${data.country_name || "Unknown"}, ${data.city || "Unknown"}${", " + data.region || ""}`;
  } catch (err) {
    return `Unknown`;
  }
}
