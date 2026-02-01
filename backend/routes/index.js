const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Use /v1 to access the v1 API');
});

module.exports = router;