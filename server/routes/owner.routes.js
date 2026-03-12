const express = require('express');
const router = express.Router();
const { getMyHostels, createHostel, getMyResidents, getMyPayments } = require('../controllers/owner.controller');
const { protect, owner } = require('../middleware/auth.middleware');

router.route('/hostels').get(protect, owner, getMyHostels).post(protect, owner, createHostel);
router.route('/residents').get(protect, owner, getMyResidents);
router.route('/payments').get(protect, owner, getMyPayments);

module.exports = router;
