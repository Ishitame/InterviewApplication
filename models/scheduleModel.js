const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  instructor: { 
     type: mongoose.Schema.Types.ObjectId,
     ref: "User"},
  slots: [
    {
      startTime: { type: String},
      endTime: { type: String},
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);
