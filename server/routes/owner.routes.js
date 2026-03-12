const express = require('express');
const router = express.Router();
const { getMyHostels, createHostel, getMyResidents, getMyPayments } = require('../controllers/owner.controller');
const { uploadImages } = require('../controllers/upload.controller');
const { protect, owner } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.route('/hostels').get(protect, owner, getMyHostels).post(protect, owner, createHostel);
router.route('/residents').get(protect, owner, getMyResidents);
router.route('/payments').get(protect, owner, getMyPayments);

// Image Upload Route (Max 10 photos)
router.post('/upload', protect, owner, upload.array('photos', 10), uploadImages);

module.exports = router;
