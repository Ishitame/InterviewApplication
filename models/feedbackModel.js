const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "BookedSlot", required: true, unique: true },

    
    communicationSkills: { type: Number, min: 1, max: 5, required: true },
    technicalKnowledge: { type: Number, min: 1, max: 5, required: true },
    problemSolving: { type: Number, min: 1, max: 5, required: true },
    logicalThinking: { type: Number, min: 1, max: 5, required: true },
    confidence: { type: Number, min: 1, max: 5, required: true },

   
    overallPerformance: { type: Number, min: 1, max: 5 },

    comments: { type: String, trim: true },

}, { timestamps: true });


feedbackSchema.pre("save", function (next) {
    const total = this.communicationSkills + this.technicalKnowledge + this.problemSolving + this.logicalThinking + this.confidence;
    this.overallPerformance = (total / 5).toFixed(1); 
    next();
});

module.exports = mongoose.model("Feedback", feedbackSchema);
