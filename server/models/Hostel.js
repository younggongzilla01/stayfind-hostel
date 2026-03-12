const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
    bedNumber: { type: Number },
    status: { type: String, enum: ['available', 'occupied'], default: 'available' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null }
});

const roomSchema = new mongoose.Schema({
    number: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'Private', 'Double Shared', 'Dormitory'
    rent: { type: Number, required: true },
    beds: [bedSchema]
});

const hostelSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String },
    gender: { type: String, enum: ['male', 'female', 'coed'], required: true },
    description: { type: String },
    facilities: [{ type: String }],
    rules: { type: String },
    status: { type: String, enum: ['Pending', 'Active', 'Inactive'], default: 'Pending' },
    rooms: [roomSchema]
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
