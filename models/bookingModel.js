const mongoose = require('mongoose');

const BookedSlotSchema = new mongoose.Schema({
    instructorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },
    date: { 
        type: Date, 
        required: true },
    startTime: { 
        type: String, 
        required: true }, 
    endTime: { 
        type: String, 
        required: true },  
    isBooked: { 
        type: Boolean, 
        default: false },
    status: { 
            type: String, 
            enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
            default: 'pending' 
        }, 
}, { timestamps: true });

module.exports = mongoose.model('BookedSlot', BookedSlotSchema);
