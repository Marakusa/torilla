require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const fileUpload = require('express-fileupload');

const apiRoutes = require('./routes/index');
const apiRoutesVersion1 = require('./routes/v1/index');

const authRoutes = require('./routes/v1/auth');
const accountRoutes = require('./routes/v1/accounts');
const productRoutes = require('./routes/v1/products');
const profileRoutes = require('./routes/v1/profiles');

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

// Routes
app.use('/', apiRoutes);
app.use('/v1', apiRoutesVersion1);

app.use('/v1/auth', authRoutes);
app.use('/v1/accounts', accountRoutes);
app.use('/v1/products', productRoutes);
app.use('/v1/profiles', profileRoutes);

// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
