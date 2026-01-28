import { useEffect, useState } from 'react';
import { FaDiscord, FaGoogle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import './LoginPage.css';
import { NavLink, useNavigate } from "react-router";
import api from "./lib/torillaBackend";
import Cookies from 'universal-cookie';
import { useAuth } from "./context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();

  const cookies = new Cookies(null, { path: '/' });
  const { user, loadingAuth } = useAuth();

  const [showRegister, setShowRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState("");

  async function register(username: string, email: string, password: string) {
    if (inProgress) {
      return;
    }

    setError("");
    setInProgress(true);

    try {
      await api.register(username, email, password);
      await login(email, password);
    } catch (ex: any) {
      console.error("Failed to register:", ex);
      setError(ex.message);
      setInProgress(false);
    }
  }
  async function login(email: string, password: string) {
    if (inProgress) {
      return;
    }

    setError("");
    setInProgress(true);

    try {
      const loginData = await api.login(
        email,
        password
      );
      cookies.set('X-Session-Token', loginData.xSessionToken);
      setInProgress(false);
      window.location.reload();
    } catch (ex: any) {
      console.error("Failed to log in:", ex);
      setError(ex.message);
      setInProgress(false);
    }
  }

  useEffect(() => {
    if (!loadingAuth && user?.user) {
      navigate("/market");
    }
  }, [loadingAuth, user, navigate]);

  if (loadingAuth || user?.user) {
    return (<></>);
  }

  if (!showRegister) {
    return (
      <>
        <div className="login-page">
          <div className="login-panel-left">
            <NavLink to="/" className="login-return"><IoClose /></NavLink>
            <div className="content login-content">

              <div className="login-header">
                <h1 className="italic">Torilla</h1>
                <a onClick={() => {
                  setError("");
                  setShowRegister(true);
                }}>Sign up</a>
              </div>

              {error != "" && (<p className="error-message">{error}</p>)}

              <div className="login-inputs">
                <p className="input-label">Username or E-mail</p>
                <input type="text" id="login-username" className="text-field-secondary" placeholder="Username or E-mail..." onChange={e => setEmail(e.target.value)} />
                <p className="input-label">Password</p>
                <input type="password" id="login-password" className="text-field-secondary" placeholder="Password..." onChange={e => setPassword(e.target.value)} />
              </div>
              <button className="button-primary" onClick={() => login(email, password)} disabled={inProgress}>Log in</button>

              <p className="or-label">or</p>

              <div className="external-auth">
                <button className="button-secondary iconed-button"><FaGoogle /> Sign in with Google</button>
                <button className="button-secondary iconed-button"><FaDiscord /> Sign in with Discord</button>
              </div>

            </div>
          </div>
          <div className="login-panel-right">
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="login-page">
          <div className="login-panel-left">
            <div className="content login-content">

              <div className="login-header">
                <h1 className="italic">Torilla</h1>
                <a onClick={() => {
                  setError("");
                  setShowRegister(false);
                }}>Log in</a>
              </div>

              {error != "" && (<p className="error-message">{error}</p>)}

              <div className="login-inputs">
                <p className="input-label">Username</p>
                <input type="text" id="register-username" className="text-field-secondary" placeholder="Username..." onChange={e => setUsername(e.target.value)} />
                <p className="input-label">E-mail</p>
                <input type="email" id="register-email" className="text-field-secondary" placeholder="E-mail..." onChange={e => setEmail(e.target.value)} />
                <p className="input-label">Password</p>
                <input type="password" id="register-password" className="text-field-secondary" placeholder="Password..." onChange={e => setPassword(e.target.value)} />
              </div>
              <button className="button-primary" onClick={async () => {
                register(username, email, password);
              }}>Register</button>

            </div>
          </div>
          <div className="login-panel-right">
          </div>
        </div>
      </>
    );
  }
}
