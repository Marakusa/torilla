require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const fileUpload = require('express-fileupload');
const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  credentials: true,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Session-Token"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: os.tmpdir(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}));

const AuthAPI = require('./api/v1/auth');
const AccountAPI = require('./api/v1/account');
const ProductsAPI = require('./api/v1/products');
const ProfilesAPI = require('./api/v1/profiles');

// - Main -
app.get('/', (req, res) => {
  res.send('Use /v1 to access the v1 API');
});
app.get('/v1', (req, res) => {
  res.send('Torilla API v1');
});

// - Auth API -

// POST /auth/login
app.post('/v1/auth/login', AuthAPI.login);
// POST /auth/register
app.post('/v1/auth/register', AuthAPI.register);

// - Account API -

// GET /account
app.get('/v1/account', AccountAPI.getAccount);
// PATCH /account
app.patch('/v1/account', AccountAPI.updateAccountDetails);
// POST /account/avatar
app.post('/v1/account/avatar', AccountAPI.uploadAvatarPicture);
// PUT /account/password
app.put('/v1/account/password', AccountAPI.changePassword);
// GET /account/logout
app.get('/v1/account/logout', AccountAPI.logout);
// GET /account/session
app.get('/v1/account/session', AccountAPI.getSessions);

// - Products API -

// GET /products/list
app.get('/v1/products/list', ProductsAPI.getProductsList);
// GET /products/list/:vendorName
app.get('/v1/products/list/:vendorName', ProductsAPI.getProductsListByName);
// GET /products/:id
app.get('/v1/products/:id', ProductsAPI.getProductById);
// GET /products/:vendorName/:shortUrl
app.get('/v1/products/:vendorName/:shortUrl', ProductsAPI.getProductByUrl);
// PUT /products/:id/description
app.put('/v1/products/:id', ProductsAPI.updateProduct);

// - Profiles API -

// GET /profiles/:username
app.get('/v1/profiles/:username', ProfilesAPI.getProfileByUsername);

// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
