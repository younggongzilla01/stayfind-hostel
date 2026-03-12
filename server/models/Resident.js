const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    room: { type: mongoose.Schema.Types.ObjectId }, // Reference to roomSchema subdocument id
    bed: { type: mongoose.Schema.Types.ObjectId },  // Reference to bedSchema subdocument id
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    joinDate: { type: Date, default: Date.now },
    rentStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Resident', residentSchema);
