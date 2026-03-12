const Hostel = require('../models/Hostel');

// @desc    Get all active hostels
// @route   GET /api/hostels
// @access  Public
const getHostels = async (req, res) => {
    try {
        // Only return Active hostels to the public site
        const hostels = await Hostel.find({ status: 'Active' });
        res.json(hostels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getHostels };
