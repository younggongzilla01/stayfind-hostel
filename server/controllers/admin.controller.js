const Hostel = require('../models/Hostel');
const Resident = require('../models/Resident');

// @desc    Get global overview stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalHostels = await Hostel.countDocuments();
        const pendingReviews = await Hostel.countDocuments({ status: 'Pending' });
        const totalResidents = await Resident.countDocuments();
        
        res.json({
            totalHostels,
            pendingReviews,
            totalResidents,
            revenue: 250000 // Placeholder aggregate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or reject hostel listing
// @route   PUT /api/admin/hostels/:id/status
// @access  Private/Admin
const updateHostelStatus = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.id);
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });

        hostel.status = req.body.status; // 'Active' or 'Inactive'
        await hostel.save();
        res.json(hostel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminStats, updateHostelStatus };
