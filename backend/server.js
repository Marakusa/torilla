require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;

const ProductsAPI = require('./api/v1/products');

// - Main -
app.get('/', (req, res) => {
  res.send('Use /v1 to access the v1 API');
});
app.get('/v1', (req, res) => {
  res.send('Torilla API v1');
});

// - Products API -

// GET /products/list
app.get('/v1/products/list', ProductsAPI.productsList);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
