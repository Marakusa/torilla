const sdk = require('node-appwrite');
const { databases } = require('../../lib/appwrite');
const { validateSession } = require('../../utils/sessionValidator');

exports.getProductsList = async function (req, res) {
  const { limit = 25, offset = 0 } = req.query;

  const safeLimit = Math.min(Number(limit) || 25, 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  try {
    const documents = await databases.listDocuments(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PRODUCTS_TABLE_ID,
      [
        sdk.Query.limit(Number(safeLimit)),
        sdk.Query.offset(Number(safeOffset))
      ]
    );

    res.json(documents?.documents ?? []);
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({
      error: true,
      message: "Failed to fetch products."
    });
  }
}

exports.getProductById = async function (req, res) {
  try {
    const document = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PRODUCTS_TABLE_ID,
      req.params.id
    );

    res.json(document ?? {});
  } catch (ex) {
    console.error(ex);
    if (ex.code === 404) {
      return res.status(404).json({
        error: true,
        message: "Product not found."
      });
    }
    return res.status(500).json({
      error: true,
      message: "Failed to fetch the product."
    });
  }
}

exports.getProductByUrl = async function (req, res) {
  const { vendorName, shortUrl } = req.params;

  if (!vendorName || !shortUrl) {
    return res.status(400).json({
      error: true,
      message: "Missing vendor name or product URL."
    });
  }

  try {
    const vendors = await databases.listDocuments(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      [
        sdk.Query.equal('username', vendorName.toLowerCase()),
        sdk.Query.limit(1)
      ]
    );

    if (vendors.total === 0) {
      return res.status(404).json({ error: true, message: "Vendor not found." });
    }

    const vendorId = vendors.documents[0].$id;

    const result = await databases.listDocuments(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PRODUCTS_TABLE_ID,
      [
        sdk.Query.equal('vendor', vendorId),
        sdk.Query.equal('shortUrl', shortUrl.toLowerCase()),
        sdk.Query.limit(1)
      ]
    );

    if (result.total === 0) {
      return res.status(404).json({
        error: true,
        message: "Product not found."
      });
    }

    // Return the first matching product
    return res.json(result.documents[0]);
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({
      error: true,
      message: "Failed to fetch the product."
    });
  }
}

exports.updateProductDescription = async function (req, res) {
  try {
    const body = req.body;

    const document = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PRODUCTS_TABLE_ID,
      req.params.id
    );

    if (!(await validateSession(req.header("X-Session-Token"), document.vendor.$id))) {
      return res.status(401).json({ error: true });
    }

    const updatedDocument = await databases.updateDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PRODUCTS_TABLE_ID,
      req.params.id,
      {
        description: JSON.stringify(body)
      }
    );

    res.json(updatedDocument);
  } catch (ex) {
    console.error(ex);
    if (ex.code === 404) {
      return res.status(404).json({ error: true, message: "Product not found." });
    }
    return res.status(500).json({
      error: true,
      message: "Failed to update the description of the product."
    });
  }
}
