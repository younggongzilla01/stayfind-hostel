const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
    amount: { type: Number, required: true },
    monthYear: { type: String, required: true }, // e.g., "March 2024"
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
    paymentDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
