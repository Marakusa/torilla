const sdk = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const { databases, storage } = require('../../lib/appwrite');
var base64 = require('base-64');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { validateSession } = require('../../utils/sessionValidator');

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
        avatarUrl: account.profile?.avatarUrl,
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

    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: true, message: "No avatar provided." });
    }

    if (req.files.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: true, message: "Avatar too large." });
    }
    if (!req.files.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: true, message: "Invalid file type." });
    }

    const tempFile = InputFile.fromPath(req.files.file.tempFilePath, req.files.file.name);

    // Upload file
    const bucketId = process.env.APPWRITE_ACCOUNT_AVATARS_BUCKET_ID;
    const resultFile = await storage.createFile(bucketId, sdk.ID.unique(), tempFile);

    // cleanup temp file
    try { fs.unlinkSync(req.files.file.tempFilePath); } catch (e) { }

    // Fetch current account to find old avatar file id (if any)
    const account = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      accountId
    );

    // Attempt to determine old file id (prefer explicit avatarFileId)
    let oldFileId = account.profile.avatarFileId;
    if (!oldFileId && account.profile.avatarUrl) {
      // try to extract file id from an Appwrite storage URL if present
      const m = account.profile.avatarUrl.match(/\/files\/([^/]+)\/view/);
      if (m) oldFileId = m[1];
    }

    // Delete old file if found (ignore errors)
    if (oldFileId) {
      try {
        await storage.deleteFile(bucketId, oldFileId);
      } catch (e) { /* ignore deletion errors */ }
    }

    // Construct public view URL for the uploaded file
    const avatarUrl =
      `${process.env.APPWRITE_PUBLIC_ENDPOINT}/storage/buckets/${bucketId}` +
      `/files/${resultFile.$id}/preview?width=256&height=256&quality=80&project=${process.env.APPWRITE_PROJECT_ID}`;

    // Update account document with new avatar info
    await databases.updateDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PROFILES_TABLE_ID,
      account.profile.$id,
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

exports.changePassword = async function (req, res) {

}
