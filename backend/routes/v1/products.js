const express = require('express');
const router = express.Router();
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

async function getProfileIdByUsername(username) {
  if (!username) return null;

  const docs = await databases.listDocuments(
    process.env.APPWRITE_MAIN_DATABASE_ID,
    process.env.APPWRITE_ACCOUNTS_TABLE_ID,
    [
      sdk.Query.equal('username', username),
      sdk.Query.limit(1),
    ]
  );

  return docs.documents?.[0].profile.$id ?? null;
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
    reviewValue: doc.productReviews?.length > 0 ? doc.productReviews?.reduce((n, { stars }) => n + stars, 0) / doc.productReviews?.length : 0.0,
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
        features: v.features ?? [],
      })) ?? [],
    productReviews: reviews,
  };
}

router.get('/list', async (req, res) => {
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
});

router.get('/list/:vendorName', async (req, res) => {
  const { vendorName } = req.params;
  const { limit = 25, offset = 0 } = req.query;

  const safeLimit = Math.min(Number(limit) || 25, 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  try {
    const vendorId = await getProfileIdByUsername(vendorName);

    if (!vendorId) {
      return res.status(404).json({
        error: true,
        message: "Vendor not found."
      });
    }

    const documents = await databases.listDocuments(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PRODUCTS_TABLE_ID,
      [
        sdk.Query.limit(Number(safeLimit)),
        sdk.Query.offset(Number(safeOffset)),
        sdk.Query.equal("vendor", vendorId)
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
});

router.get('/:id', async (req, res) => {
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
});

router.get('/:vendorName/:shortUrl', async (req, res) => {
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
});

router.put('/:id', async (req, res) => {
  try {
    const body = req.body;

    const product = await databases.getDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PRODUCTS_TABLE_ID,
      req.params.id
    );

    const accountResult = await databases.listDocuments(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_ACCOUNTS_TABLE_ID,
      [
        sdk.Query.equal("profile", product.vendor.$id),
        sdk.Query.limit(1)
      ],
    );

    if (accountResult.total === 0) {
      return res.status(404).json({
        error: true,
        message: "Account not found."
      });
    }

    const account = accountResult.documents[0];

    if (!(await validateSession(req.header("X-Session-Token"), account.$id))) {
      return res.status(401).json({ error: true });
    }

    const newProduct = {
      shortUrl: body.shortUrl ?? product.shortUrl,
      title: body.title ?? product.title,
      iconUrl: body.iconUrl ?? product.iconUrl,
      description: body.description ?? product.description,
      tags: body.tags ?? product.tags,
      thumbnails: body.thumbnails ?? product.thumbnails,
      versions: body.versions ?? product.versions,
    }

    // Check if unique URL for vendor

    const shortUrlMatches = await databases.listDocuments(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PRODUCTS_TABLE_ID,
      [
        sdk.Query.and([
          sdk.Query.equal("shortUrl", newProduct.shortUrl),
          sdk.Query.notEqual("$id", product.$id),
        ]),
      ]
    );

    if (shortUrlMatches.total > 0) {
      return res.status(400).json({ error: true, message: "Short URL already in use." });
    }

    // Check for new product versions

    for (const element of newProduct.versions.filter(v => v.$id.startsWith('new_'))) {
      const newVersion = await databases.createDocument(
        process.env.APPWRITE_MAIN_DATABASE_ID,
        process.env.APPWRITE_PRODUCT_VERSIONS_TABLE_ID,
        sdk.ID.unique(),
        {
          name: element.name,
          currency: element.currency,
          price: element.price,
          features: element.features,
        }
      );

      element.$id = newVersion.$id;
    }

    const updatedDocument = await databases.updateDocument(
      process.env.APPWRITE_MAIN_DATABASE_ID,
      process.env.APPWRITE_PRODUCTS_TABLE_ID,
      req.params.id,
      newProduct,
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
});

module.exports = router;