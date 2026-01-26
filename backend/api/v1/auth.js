const sdk = require('node-appwrite');
const argon2 = require('argon2');
const { databases } = require('../../lib/appwrite');
var base64 = require('base-64');
const { validateSession } = require('../../utils/sessionValidator');
const { v4 } = require('uuid');

async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

exports.login = async function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Please provide email and password."
    });
  }

  try {
    // Find the account by email or username
    const documents = await databases.listDocuments(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      [
        sdk.Query.or([
          sdk.Query.equal('email', email.toLowerCase()),
          sdk.Query.equal('username', email.toLowerCase())
        ])
      ]
    );

    if (documents.total === 0) {
      return res.status(401).json({ error: true, message: "Invalid credentials." });
    }

    const account = documents.documents[0];

    // Verify password
    const validPassword = await argon2.verify(account.passwordHash, password);
    if (!validPassword) {
      return res.status(401).json({ error: true, message: "Invalid credentials." });
    }

    // Create session key
    const sessionKey = v4();
    const hashedSessionKey = await hashPassword(sessionKey);

    const sessionDocument = await databases.createDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_SESSIONS_TABLE_ID,
      sdk.ID.unique(),
      {
        account: account.$id,
        key: hashedSessionKey
      }
    );

    const xSessionToken = base64.encode(JSON.stringify({ sessionId: sessionDocument.$id, key: sessionKey }));

    // Return session info to client
    return res.json({
      success: true,
      xSessionToken: xSessionToken,
      user: {
        username: account.username,
        displayName: account.profile?.displayName ?? account.username
      }
    });
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({
      error: true,
      message: "Failed to login."
    });
  }
}

exports.register = async function (req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({
      error: true,
      message: "Please fill out the form."
    });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.toLowerCase();

  const usernameRegex = /^[a-z0-9._]+$/;
  if (
    normalizedUsername.length < 3 ||
    normalizedUsername.length > 32 ||
    !usernameRegex.test(normalizedUsername)
  ) {
    return res.status(400).json({
      error: true,
      message: "Username must be 3–32 characters and may only contain letters, numbers, . and _"
    });
  }

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,128}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: true,
      message: "Password must be 6–128 characters long and include at least one number and one special character (!@#$%^&*)."
    });
  }

  if (!normalizedEmail.includes('@') || normalizedEmail.length > 254) {
    return res.status(400).json({
      error: true,
      message: "Invalid e-mail address."
    });
  }

  try {
    const documents = await databases.listDocuments(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      [
        sdk.Query.or([
          sdk.Query.equal('username', normalizedUsername),
          sdk.Query.equal('email', normalizedEmail)
        ])
      ]
    );

    if (documents.total > 0) {
      res.status(400);
      return res.json({
        error: true,
        message: "Account with the username or email address already exists."
      });
    }

    const hash = await hashPassword(password);
    const newProfile = await databases.createDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PROFILES_TABLE_ID,
      sdk.ID.unique(),
      {
        displayName: username.trim()
      }
    );
    await databases.createDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      sdk.ID.unique(),
      {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash: hash,
        isVendor: false,
        profile: newProfile.$id
      }
    );

    return res.json({
      success: true
    });
  } catch (ex) {
    console.error(ex);

    if (newProfile?.$id) {
      await databases.deleteDocument(
        process.env.APPWRITE_MAIN_DATABASE_ID,
        process.env.APPWRITE_PROFILES_TABLE_ID,
        newProfile?.$id
      );
    }

    return res.status(500).json({
      error: true,
      message: "Failed to create account."
    });
  }
}
