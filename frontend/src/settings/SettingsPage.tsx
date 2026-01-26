import { useEffect, useRef, useState } from "react";
import Footer from "../Footer";
import Header from "../Header";
import { useAuth } from "../context/AuthContext";
import "./SettingsPage.css";
import api from "../lib/torillaBackend";
import { FaTrash } from "react-icons/fa";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const avatarUploadInput = useRef<HTMLInputElement | null>(null);
  const birthDateInput = useRef<HTMLInputElement | null>(null);

  const [avatarOriginal, setAvatarOriginal] = useState<string | undefined>(user?.user.avatarUrl ?? undefined);
  const [avatar, setAvatar] = useState<string | undefined>(user?.user.avatarUrl ?? undefined);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [avatarError, setAvatarError] = useState<string>("");

  const [displayNameOriginal, setDisplayNameOriginal] = useState<string | undefined>(user?.user.displayName ?? undefined);
  const [displayName, setDisplayName] = useState<string | undefined>(user?.user.displayName ?? undefined);
  const [usernameOriginal, setUsernameOriginal] = useState<string | undefined>(user?.user.username ?? undefined);
  const [username, setUsername] = useState<string | undefined>(user?.user.username ?? undefined);
  const [emailOriginal, setEmailOriginal] = useState<string | undefined>(user?.user.email ?? undefined);
  const [email, setEmail] = useState<string | undefined>(user?.user.email ?? undefined);
  const [birthDateOriginal, setBirthDateOriginal] = useState<string | undefined>(user?.user.birthDate ?? undefined);
  const [birthDate, setBirthDate] = useState<string | undefined>(user?.user.birthDate ?? undefined);
  const [mainError, setMainError] = useState<string>("");

  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  function pickAvatarFile() {
    avatarUploadInput.current?.click();
  }

  function avatarSelected(changed: React.ChangeEvent<HTMLInputElement>) {
    const files = changed.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    setAvatar(URL.createObjectURL(file));
    setAvatarFile(file);
  }
  function deleteAvatar() {
    setAvatar("null");
  }
  async function uploadAvatar() {
    try {
      if (!avatarFile) {
        setAvatarError("No file provided.");
        return;
      }
      await api.uploadAccountAvatar(avatarFile);
      window.location.reload();
    } catch (ex) {
      console.error(ex);
      setAvatarError("Failed to upload avatar.");
    }
  }

  function changePassword(password: string, repeatPassword: string) {
    setPasswordError("");
    if (password !== repeatPassword) {
      setPasswordError("Passwords must match");
    }
  }

  useEffect(() => {
    if (loading) {
      return;
    }

    setAvatarOriginal(user?.user.avatarUrl);
    setAvatar(user?.user.avatarUrl);
    setDisplayNameOriginal(user?.user.displayName);
    setDisplayName(user?.user.displayName);
    setUsernameOriginal(user?.user.username);
    setUsername(user?.user.username);
    setEmailOriginal(user?.user.email);
    setEmail(user?.user.email);
    setBirthDateOriginal(user?.user.birthDate);
    setBirthDate(user?.user.birthDate);

    if (birthDate && birthDateInput.current) {
      birthDateInput.current.disabled = true;
    }
  }, [loading, user]);

  if (loading) {
    return <div>
      <Header />
      <Footer />
    </div>
  }

  return (
    <div>
      <Header />

      <div className="content settings-content">
        <h1>Settings</h1>
        <div className="settings-form-content">
          <h2>Account & Profile</h2>
          <section>
            <p className="input-label">Profile Picture</p>
            <div className="settings-avatar-section">
              <div className="settings-avatar-pic">
                <img src={avatar} alt={user?.user.displayName?.slice(0, 1) || user?.user.username?.slice(0, 1) || "?"} className="settings-avatar" onClick={pickAvatarFile} />
                <button className="settings-avatar-delete" onClick={deleteAvatar}><FaTrash /></button>
              </div>
              <div className="settings-avatar-section-info">
                <p>Upload a new profile picture. Recommended size: 400x400px</p>
                <i>Click the avatar to choose a new one.</i>
              </div>
              <input type="file" id="settings-avatar-upload" accept="image/*" hidden={true} ref={avatarUploadInput} onChange={(e) => avatarSelected(e)}></input>
            </div>

            {avatarError != "" && (<p className="error-message" style={{ marginTop: "1em" }}>{avatarError}</p>)}

            {avatarOriginal !== avatar && <button className="save-button" onClick={() => uploadAvatar()}>Save</button>}

            <p className="input-label">Display Name</p>
            <input id="settings-display-name" className="text-field-secondary" value={displayName ?? ""} onChange={(e) => setDisplayName(e.target.value)}></input>
            <p className="input-label">Username</p>
            <input id="settings-username" className="text-field-secondary" value={user?.user.username} disabled onChange={(e) => setUsername(e.target.value)}></input>
            <p className="input-label">E-mail Address</p>
            <input type="email" id="settings-email" className="text-field-secondary" value={email ?? ""} disabled onChange={(e) => setEmail(e.target.value)}></input>
            <p className="input-label">Birth Date</p>
            <i>Birth date can only be set once, and cannot be changed after setting it.</i>
            <input type="date" id="settings-birth-date" className="text-field-secondary" value={birthDate ?? ""} onChange={(e) => setBirthDate(e.target.value)} ref={birthDateInput}></input>

            {mainError != "" && (<p className="error-message" style={{ marginTop: "1em" }}>{mainError}</p>)}

            {(displayNameOriginal !== displayName || birthDateOriginal !== birthDate || usernameOriginal !== username || emailOriginal !== email) && <button className="save-button">Save</button>}
          </section>
        </div>
        <div className="settings-form-content">
          <h2>Password</h2>
          <section>
            <p className="input-label">New Password</p>
            <input type="password" id="settings-change-password" className="text-field-secondary" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}></input>
            <p className="input-label">Repeat New Password</p>
            <input type="password" id="settings-change-password-repeat" className="text-field-secondary" value={newPasswordRepeat} onChange={(e) => { setNewPasswordRepeat(e.target.value); setPasswordError(""); }}></input>

            {passwordError != "" && (<p className="error-message" style={{ marginTop: "1em" }}>{passwordError}</p>)}

            {(newPassword.length > 0 && newPasswordRepeat.length > 0) && <button className="save-button" onClick={() => changePassword(newPassword, newPasswordRepeat)}>Save</button>}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
