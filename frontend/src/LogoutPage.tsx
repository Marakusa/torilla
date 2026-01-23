import { NavLink, useNavigate } from "react-router";
import Header from "./Header";

export default function LogoutPage() {
  const navigate = useNavigate();

  try {
    /*account.deleteSession({
      sessionId: 'current'
    }).then(() => {
      navigate("/");
      return (<></>);
    });*/
  } catch (ex) {
    console.error("Failed to log out:", ex);
  }

  return (
    <>
      <Header />
      <div className="content not-found">
        <h1>500 - Unexpected error occurred</h1>
        <p>Please try again later.</p>
        <NavLink to="/" className="button-primary">Return Home</NavLink>
      </div>
    </>
  );
}
