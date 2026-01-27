const { databases } = require('../lib/appwrite');
const argon2 = require('argon2');
var base64 = require('base-64');

exports.validateSession = async function (xSessionToken, userId) {
  try {
    if (!xSessionToken) {
      return false;
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

    await databases.updateDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_SESSIONS_TABLE_ID,
      sessionId,
      {
        lastActivity: new Date()
      }
    );

    return true;
  } catch (ex) {
    return false;
  }
}