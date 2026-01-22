import { useEffect, useState } from 'react';
import { account, ID } from './lib/appwrite';
import type { Models } from "appwrite";
import { FaDiscord, FaGoogle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import './LoginPage.css';
import { NavLink, useNavigate } from "react-router";

export default function LoginPage() {
  const navigate = useNavigate();

  const [showRegister, setShowRegister] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState<Models.User<{
    [key: string]: any
  }> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState(false);

  async function login(email: string, password: string) {
    if (inProgress) {
      return;
    }

    setError(false);
    setInProgress(true);

    try {
      await account.createEmailPasswordSession({
        email,
        password
      });
      console.log(await account.get());
      setLoggedInUser(await account.get());
      setInProgress(false);
    } catch (ex) {
      console.error("Failed to log in:", ex);
      setError(true);
      setInProgress(false);
    }
  }

  useEffect(() => {
    account.get().then((user) => {
      if (user) {
        setLoggedInUser(user);
      }
    });
  }, [account]);

  if (loggedInUser) {
    navigate("/");
    return (<></>);
  }

  if (!showRegister) {
    return (
      <>
        <div className="login-page">
          <div className="login-panel-left">
            <NavLink to="/" className="login-return"><IoClose /></NavLink>
            <div className="content">

              <div className="login-header">
                <h1 className="italic">Torilla</h1>
                <a onClick={() => {
                  setError(false);
                  setShowRegister(true);
                }}>Sign up</a>
              </div>

              {error && (<p className="error-message">Failed to log in, please try again</p>)}

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
            <div className="content">

              <div className="login-header">
                <h1 className="italic">Torilla</h1>
                <a onClick={() => {
                  setError(false);
                  setShowRegister(false);
                }}>Log in</a>
              </div>

              {error && (<p className="error-message">Failed to sign up, please try again</p>)}

              <div className="login-inputs">
                <p className="input-label">Username</p>
                <input type="text" id="register-username" className="text-field-secondary" placeholder="Username..." onChange={e => setUsername(e.target.value)} />
                <p className="input-label">E-mail</p>
                <input type="email" id="register-email" className="text-field-secondary" placeholder="E-mail..." onChange={e => setEmail(e.target.value)} />
                <p className="input-label">Password</p>
                <input type="password" id="register-password" className="text-field-secondary" placeholder="Password..." onChange={e => setPassword(e.target.value)} />
              </div>
              <button className="button-primary" onClick={async () => {
                await account.create({
                  userId: ID.unique(),
                  email,
                  password,
                  name: username
                });
                login(email, password);
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
