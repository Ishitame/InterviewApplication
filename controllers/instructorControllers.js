const User = require("../models/userModel");
const Schedule= require("../models/scheduleModel");
const verifyToken = require("../middlewares/Authentication");
const BookedSlot = require("../models/bookingModel");
const Feedback = require("../models/feedbackModel");




const conversion24 = (time) => {
    const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/).slice(1);
    let hours24 = parseInt(hours, 10);
    if (period.toUpperCase() === "PM" && hours24 !== 12) hours24 += 12;
    if (period.toUpperCase() === "AM" && hours24 === 12) hours24 = 0;
    return `${hours24.toString().padStart(2, "0")}:${minutes}`;
};

const convert12= (time) => {
    let [hours, minutes] = time.split(':').map(Number);
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; 
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
};



exports.createController=async(req,res)=>{
    try {
        let { startTime, endTime } = req.body;
        const instructorId = req.user.id; 

        if (!startTime || !endTime) {
            return res.status(400).json({ message: "Start time and end time are required" });
        }

        startTime = conversion24(startTime);
        endTime = conversion24(endTime);

        const instructor = await User.findById(instructorId);
        if (!instructor || instructor.role !== "instructor") {
            return res.status(403).json({ message: "Only instructors can create slots" });
        }

        let schedule = await Schedule.findOne({ instructor: instructorId });

        if (schedule) {
        
            const slotExists = schedule.slots.some(slot => 
                slot.startTime === startTime && slot.endTime === endTime
            );

            if (!slotExists) {
                schedule.slots.push({ startTime, endTime });
                await schedule.save();
                return res.status(201).json({ message: "Slot added successfully", schedule });
            } else {
                return res.status(200).json({ message: "Slot already exists", schedule });
            }
        } else {
            
            schedule = new Schedule({ instructor: instructorId, slots: [{ startTime, endTime }] });
            await schedule.save();
            return res.status(201).json({ message: "Slot created successfully", schedule });
        }
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: "Server error", error });
    }
};





exports.getInstructorSlots = async (req, res) => {
    try {
        const instructorId = req.user.id; 

        
       
        const bookedSlots = await BookedSlot.find({ instructorId,isBooked: true  });

        res.status(200).json({

            bookedSlots
        });

    } catch (error) {
        console.error("Error fetching instructor slots:", error);
        res.status(500).json({ message: "Server error", error });
    }
};



exports.available = async (req, res) => {
    try {
        const instructorId = req.user.id; 

        const schedule = await Schedule.findOne({ instructor: instructorId });

        if (!schedule) {
            return res.status(404).json({ message: "No schedule found" });
        }

       
    

        res.status(200).json({
            availableSlots: schedule.slots
        });

    } catch (error) {
        console.error("Error fetching instructor slots:", error);
        res.status(500).json({ message: "Server error", error });
    }
};



exports.deleteSlot = async (req, res) => {
    try {
        const instructorId = req.user.id; 
        let { slotId, startTime, endTime } = req.body;

        if (slotId) {
            const updatedSchedule = await Schedule.findOneAndUpdate(
                { instructor: instructorId },
                { $pull: { slots: { _id: slotId } } }, 
                { new: true }
            );

            if (!updatedSchedule) {
                return res.status(404).json({ message: "Schedule not found or slot already removed" });
            }

            return res.status(200).json({ message: "Slot removed successfully", updatedSchedule });
        }

        if (!startTime || !endTime) {
            return res.status(400).json({ message: "Either slotId or startTime & endTime are required" });
        }

        startTime = conversion24(startTime);
        endTime = conversion24(endTime);

        const updatedSchedule = await Schedule.findOneAndUpdate(
            { instructor: instructorId },
            { $pull: { slots: { startTime, endTime } } }, 
            { new: true }
        );

        if (!updatedSchedule) {
            return res.status(404).json({ message: "Schedule not found or slot already removed" });
        }

        res.status(200).json({ message: "Slot removed successfully", updatedSchedule });

    } catch (error) {
        console.error("Error deleting slot:", error);
        res.status(500).json({ message: "Server error", error });
    }
};



exports.cancelBookingInstructor = async (req, res) => {
    try {
        const instructorId = req.user.id; 
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ message: "Booking ID is required" });
        }

       
        const booking = await BookedSlot.findOne({ _id: bookingId, instructorId });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        
        await BookedSlot.deleteOne({ _id: bookingId });

        res.status(200).json({ message: "Booking canceled successfully by instructor" });

    } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


exports.submitFeedback = async (req, res) => {
    try {
        const { bookingId, studentId, communicationSkills, technicalKnowledge, problemSolving, logicalThinking, confidence, comments } = req.body;
        const instructorId = req.user.id;

        if (!bookingId || !studentId) {
            return res.status(400).json({ message: "Booking ID and Student ID are required." });
        }

        
        const existingFeedback = await Feedback.findOne({ bookingId });
        if (existingFeedback) {
            return res.status(400).json({ message: "Feedback already submitted for this session." });
        }


        const feedback = new Feedback({
            instructorId,
            studentId,
            bookingId,
            communicationSkills,
            technicalKnowledge,
            problemSolving,
            logicalThinking,
            confidence,
            comments
        });

        await feedback.save();

        
        await BookedSlot.findByIdAndUpdate(bookingId, { isBooked: false });

        res.status(201).json({ message: "Feedback submitted successfully, slot marked as inactive.", feedback });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


exports.pastInterviews=async(req,res)=>{
    try {
        const instructorId = req.user.id;

     
        const pastInterviews = await BookedSlot.find({
            instructorId,
            // date: { $lt: new Date() }
            isBooked:false
        })
        .populate("studentId", "name email") 
        .lean(); 

       
        const interviewIds = pastInterviews.map(interview => interview._id);

   
        const feedbacks = await Feedback.find({ bookingId: { $in: interviewIds } }).lean();

       
        const feedbackMap = new Map(feedbacks.map(fb => [fb.bookingId.toString(), fb]));

      
        const formattedInterviews = pastInterviews.map(interview => ({
            student: interview.studentId,
            date: interview.date,
            startTime: interview.startTime,
            endTime: interview.endTime,
            status: "Completed",
            feedback: feedbackMap.get(interview._id.toString()) || null
        }));

        res.status(200).json({ pastInterviews: formattedInterviews });

    } catch (error) {
        console.error("Error fetching past interviews:", error);
        res.status(500).json({ message: "Server error", error });
    }
};




