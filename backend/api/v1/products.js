const sdk = require('node-appwrite');
const { databases } = require('../../lib/appwrite');
const { validateSession } = require('../../utils/sessionValidator');

async function getAccountByProfile(profileId) {
  if (!profileId) return null;

  const docs = await databases.listDocuments(
    process.env.APPWRITE_MAIN_DATABASE_ID,
    process.env.APPWRITE_ACCOUNTS_TABLE_ID,
    [
      sdk.Query.equal('profile', profileId),
      sdk.Query.limit(1),
    ]
  );

  return docs.documents?.[0] ?? null;
}

async function mapProduct(doc) {
  let vendorData = null;

  try {
    const vendorAccount = await getAccountByProfile(doc.vendor?.$id);
    if (vendorAccount) {
      vendorData = {
        $id: vendorAccount.$id,
        username: vendorAccount.username,
        displayName:
          vendorAccount.profile?.displayName ?? vendorAccount.username,
        avatarUrl: vendorAccount.profile?.avatarUrl ?? null,
      };
    }
  } catch {
    vendorData = null;
  }

  const reviews = await Promise.all(
    (doc.productReviews ?? []).map(async (v) => {
      let reviewerData = null;

      try {
        const reviewerAccount = await getAccountByProfile(v.reviewer?.$id);
        if (reviewerAccount) {
          reviewerData = {
            $id: reviewerAccount.$id,
            username: reviewerAccount.username,
            displayName:
              reviewerAccount.profile?.displayName ??
              reviewerAccount.username,
            avatarUrl: reviewerAccount.profile?.avatarUrl ?? null,
          };
        }
      } catch {
        reviewerData = null;
      }

      return {
        $id: v.$id,
        stars: v.stars,
        content: v.content,
        reviewer: reviewerData,
        productReviewReply: v.productReviewReply
          ? {
            $id: v.productReviewReply.$id,
            content: v.productReviewReply.content,
            replier: vendorData,
          }
          : null,
      };
    })
  );

  return {
    shortUrl: doc.shortUrl ?? '',
    title: doc.title ?? '',
    iconUrl: doc.iconUrl ?? '',
    description: doc.description ?? '',
    reviewCount: doc.productReviews?.length ?? 0,
    reviewValue: doc.productReviews?.length > 0 ? doc.productReviews?.reduce((n, {stars}) => n + stars, 0) / doc.productReviews?.length : 0.0,
    tags: doc.tags ?? [],
    thumbnails: doc.thumbnails ?? [],
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    vendor: vendorData,
    versions:
      doc.versions?.map((v) => ({
        $id: v.$id,
        name: v.name,
        price: v.price,
        currency: v.currency,
      })) ?? [],
    productReviews: reviews,
  };
}

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

    const cleanProducts = await Promise.all(documents.documents.map(mapProduct));
    res.json(cleanProducts);
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

    const mapped = await mapProduct(document);
    res.json(mapped);
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

    const vendorId = vendors.documents[0].profile.$id;

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

    const mapped = await mapProduct(result.documents[0]);
    res.json(mapped);
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

    const mapped = await mapProduct(updatedDocument);
    res.json(mapped);
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
