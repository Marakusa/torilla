const { databases } = require('../lib/appwrite');
const argon2 = require('argon2');
var base64 = require('base-64');

async function hashKey(key) {
  return await argon2.hash(key, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

exports.validateSession = async function (xSessionToken, userId) {
  try {
    if (!xSessionToken) {
      return res.status(401).json({ error: true });
    }

    let decodedToken;
    try {
      decodedToken = JSON.parse(base64.decode(xSessionToken));
    } catch {
      return false;
    }
    const sessionId = decodedToken.sessionId;
    const sessionKey = decodedToken.key;

    const sessionDocument = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_SESSIONS_TABLE_ID,
      sessionId
    );

    if (
      sessionDocument.$id !== sessionId ||
      !(await argon2.verify(sessionDocument.key, sessionKey)) ||
      sessionDocument.account.$id !== userId) {
      return false;
    }

    return true;
  } catch (ex) {
    return false;
  }
}