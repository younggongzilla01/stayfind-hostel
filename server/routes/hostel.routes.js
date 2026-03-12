const express = require('express');
const router = express.Router();
const { getHostels } = require('../controllers/hostel.controller');

router.get('/', getHostels);

module.exports = router;
