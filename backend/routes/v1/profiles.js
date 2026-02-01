const express = require('express');
const router = express.Router();
const sdk = require('node-appwrite');
const { databases } = require('../../lib/appwrite');

function mapProfile(accountDoc, profileDoc) {
  return {
    $id: profileDoc.$id,
    username: accountDoc.username,
    displayName: profileDoc.displayName ?? accountDoc.username,
    avatarUrl: profileDoc.avatarUrl ?? null,
    bio: profileDoc.bio ?? '',
    $createdAt: profileDoc.$createdAt,
    $updatedAt: profileDoc.$updatedAt,
  };
}

router.get('/:username', async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({
      error: true,
      message: "Missing username."
    });
  }

  try {
    const accounts = await databases.listDocuments(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      [
        sdk.Query.equal('username', username.toLowerCase()),
        sdk.Query.limit(1)
      ]
    );

    if (accounts.total === 0) {
      return res.status(404).json({
        error: true,
        message: "Profile not found."
      });
    }

    const account = accounts.documents[0];

    const profile = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PROFILES_TABLE_ID,
      account.profile.$id
    );

    return res.json(mapProfile(account, profile));
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({
      error: true,
      message: "Failed to fetch profile."
    });
  }
});

module.exports = router;