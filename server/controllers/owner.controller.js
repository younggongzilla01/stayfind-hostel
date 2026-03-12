const Hostel = require('../models/Hostel');
const Resident = require('../models/Resident');
const Payment = require('../models/Payment');

// @desc    Get owner's hostels
// @route   GET /api/owner/hostels
// @access  Private/Owner
const getMyHostels = async (req, res) => {
    try {
        const hostels = await Hostel.find({ owner: req.user._id });
        res.json(hostels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new hostel
// @route   POST /api/owner/hostels
// @access  Private/Owner
const createHostel = async (req, res) => {
    const { name, city, area, gender, rent, type } = req.body;
    try {
        const newHostel = new Hostel({
            owner: req.user._id,
            name,
            city,
            area,
            gender,
            status: 'Pending',
            rooms: [] // Owner will add rooms later or via Wizard
        });
        const createdHostel = await newHostel.save();
        res.status(201).json(createdHostel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get owner's residents
// @route   GET /api/owner/residents
// @access  Private/Owner
const getMyResidents = async (req, res) => {
    try {
        // Find all hostels owned by this user
        const hostels = await Hostel.find({ owner: req.user._id }).select('_id');
        const hostelIds = hostels.map(h => h._id);
        
        // Find residents in those hostels
        const residents = await Resident.find({ hostel: { $in: hostelIds } });
        res.json(residents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get owner's payments
// @route   GET /api/owner/payments
// @access  Private/Owner
const getMyPayments = async (req, res) => {
    try {
        const hostels = await Hostel.find({ owner: req.user._id }).select('_id');
        const hostelIds = hostels.map(h => h._id);
        
        const payments = await Payment.find({ hostel: { $in: hostelIds } }).populate('resident', 'name room');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyHostels, createHostel, getMyResidents, getMyPayments };
