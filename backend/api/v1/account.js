const sdk = require('node-appwrite');
const { databases } = require('../../lib/appwrite');
var base64 = require('base-64');
const { validateSession } = require('../../utils/sessionValidator');
const fs = require('fs');
const path = require('path');
const os = require('os');

exports.getAccount = async function (req, res) {
  try {
    const token = req.header("X-Session-Token");

    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Missing session token."
      });
    }

    // Decode base64 token
    let decoded;
    try {
      decoded = JSON.parse(base64.decode(token));
    } catch (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid session token."
      });
    }

    const { sessionId } = decoded;

    // Lookup session document
    const sessionDoc = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_SESSIONS_TABLE_ID,
      sessionId
    );

    // Validate session using helper
    const valid = await validateSession(token, sessionDoc.account.$id);
    if (!valid) {
      return res.status(401).json({ error: true, message: "Invalid session." });
    }

    // Fetch user account
    const account = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      sessionDoc.account.$id
    );

    // Return account info
    return res.json({
      success: true,
      user: {
        $id: account.$id,
        username: account.username,
        displayName: account.profile?.displayName ?? account.username,
        email: account.email,
        avatarUrl: account.avatarUrl,
        birthDate: account.birthDate,
      }
    });
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({
      error: true,
      message: "Failed to fetch account data."
    });
  }
}

exports.uploadAvatarPicture = async function (req, res) {
  try {
    const token = req.header("X-Session-Token");
    if (!token) return res.status(401).json({ error: true, message: "Missing session token." });

    // Decode base64 token
    let decoded;
    try {
      decoded = JSON.parse(base64.decode(token));
    } catch (err) {
      return res.status(401).json({ error: true, message: "Invalid session token." });
    }
    const { sessionId } = decoded;

    // Lookup session document
    const sessionDoc = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_SESSIONS_TABLE_ID,
      sessionId
    );

    // Validate session using helper
    const valid = await validateSession(token, sessionDoc.account.$id);
    if (!valid) return res.status(401).json({ error: true, message: "Invalid session." });

    const accountId = sessionDoc.account.$id;

    // Require file either as multipart (req.file.buffer) or base64 in body.avatarBase64
    if (!req.file && !req.body?.avatarBase64) {
      return res.status(400).json({ error: true, message: "No avatar provided." });
    }

    // Prepare Appwrite storage client
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const storage = new sdk.Storage(client);

    // Write upload to temp file so we can pass a ReadStream to Appwrite SDK
    const tmpPath = path.join(os.tmpdir(), sdk.ID.unique());
    if (req.file && req.file.buffer) {
      fs.writeFileSync(tmpPath, req.file.buffer);
    } else {
      // avatarBase64 expected to be raw base64 (no data URI prefix)
      const buffer = Buffer.from(req.body.avatarBase64, 'base64');
      fs.writeFileSync(tmpPath, buffer);
    }
    const fileStream = fs.createReadStream(tmpPath);

    // Upload file
    const bucketId = process.env.APPWRITE_ACCOUNT_AVATARS_BUCKET_ID;
    const resultFile = await storage.createFile(bucketId, sdk.ID.unique(), fileStream);

    // cleanup temp file
    try { fs.unlinkSync(tmpPath); } catch (e) {}

    // Fetch current account to find old avatar file id (if any)
    const account = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      accountId
    );

    // Attempt to determine old file id (prefer explicit avatarFileId)
    let oldFileId = account.avatarFileId;
    if (!oldFileId && account.avatarUrl) {
      // try to extract file id from an Appwrite storage URL if present
      const m = account.avatarUrl.match(/\/files\/([^/]+)\/view/);
      if (m) oldFileId = m[1];
    }

    // Delete old file if found (ignore errors)
    if (oldFileId) {
      try {
        await storage.deleteFile(bucketId, oldFileId);
      } catch (e) { /* ignore deletion errors */ }
    }

    // Construct public view URL for the uploaded file
    const avatarUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${resultFile.bucketId}/files/${resultFile.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;

    // Update account document with new avatar info
    await databases.updateDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      accountId,
      {
        avatarUrl,
        avatarFileId: resultFile.$id
      }
    );

    return res.json({ success: true, avatarUrl });
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ error: true, message: "Failed to upload avatar." });
  }
}

exports.updateAccountDetails = async function (req, res) {
  
}

exports.uploadAvatarPicture = async function (req, res) {
  
}

exports.changePassword = async function (req, res) {
  
}
