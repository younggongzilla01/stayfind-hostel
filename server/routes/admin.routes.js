const express = require('express');
const router = express.Router();
const { getAdminStats, updateHostelStatus } = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/stats', protect, admin, getAdminStats);
router.put('/hostels/:id/status', protect, admin, updateHostelStatus);

module.exports = router;
