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


exports.bookSlot = async (req, res) => {
    try {
        let { instructorId, date, startTime, endTime } = req.body;

        const studentId=req.user.id;


        startTime = conversion24(startTime);
        endTime = conversion24(endTime);


        if (!instructorId || !studentId || !date || !startTime || !endTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

       
        const existingBooking = await BookedSlot.findOne({
            instructorId,
            date: new Date(date),
            startTime,
            endTime
        });

        if (existingBooking) {
            return res.status(400).json({ message: "Slot is already booked" });
        }

        
        const newBooking = new BookedSlot({
            instructorId,
            studentId,
            date: new Date(date),
            startTime,
            endTime,
            isBooked: true
        });

        await newBooking.save();
        res.status(201).json({ message: "Slot booked successfully", booking: newBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};


exports.getAvailableSlots = async (req, res) => {
    try {
        const { instructorId, date } = req.query;  

        if (!instructorId) {
            return res.status(400).json({ message: "Instructor ID is required" });
        }

        let datesToCheck = [];

        if (date) {
           
            const selectedDate = new Date(date);
            if (isNaN(selectedDate)) {
                return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
            }
            datesToCheck.push(date);
        } else {
            
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                let tempDate = new Date();
                tempDate.setDate(today.getDate() + i);
                datesToCheck.push(tempDate.toISOString().split("T")[0]);
            }
        }

        const schedule = await Schedule.findOne({ instructor: instructorId });
        if (!schedule) {
            return res.status(404).json({ message: "No schedule found for this instructor" });
        }

        const bookedSlots = await BookedSlot.find({
            instructorId,
            date: { $in: datesToCheck }, 
        });

        const bookedList = bookedSlots.map(slot => ({
            date: slot.date.toISOString().split("T")[0],
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));

        const isSlotAvailable = (date, startTime, endTime) => {
            return !bookedList.some(booked => {
                return (
                    booked.date === date &&
                    !(
                        endTime <= booked.startTime || startTime >= booked.endTime
                    )
                );
            });
        };

        const availableSlots = [];
        for (const date of datesToCheck) {
            for (const slot of schedule.slots) {
                if (isSlotAvailable(date, slot.startTime, slot.endTime)) {
                    availableSlots.push({
                        date,
                        startTime: convert12(slot.startTime),
                        endTime: convert12(slot.endTime),
                    });
                }
            }
        }

        res.status(200).json({ availableSlots });
    } catch (error) {
        console.error("Error in getAvailableSlots:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


exports.ScheduledSlot=async(req,res)=>{
try
  {  const studentId=req.user.id;

    const scheduledSlot=await BookedSlot.find({studentId,isBooked: true });

    res.status(200).json({scheduledSlot})}
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
}

exports.previous= async (req, res) => {
    try {
        const studentId = req.user.id; 

        const previousInterview = await BookedSlot.find({
            studentId,
            isBooked: false // // date: { $lt: new Date() }
        }).populate("instructorId", "name email");

        if (previousInterview.length === 0) {
            return res.status(404).json({ message: "No past interviews found" });
        }

      
        const interviewIds = previousInterview.map(interview => interview._id);
        const feedbacks = await Feedback.find({ bookingId: { $in: interviewIds } });

       
        const response = previousInterview.map(interview => {
            const feedback = feedbacks.find(fb => fb.bookingId.toString() === interview._id.toString());

            return {
                interviewId: interview._id,
                instructor: interview.instructorId,
                date: interview.date,
                startTime: interview.startTime,
                endTime: interview.endTime,
                feedback: feedback || null 
            };
        });

        res.status(200).json({ previousInterview: response });
    } catch (error) {
        console.error("Error fetching past interviews:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


exports.cancelBookingStudent = async (req, res) => {
    try {
        const studentId = req.user.id; 
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ message: "Booking ID is required" });
        }

      
        const booking = await BookedSlot.findOne({ _id: bookingId, studentId });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        await BookedSlot.deleteOne({ _id: bookingId });

        res.status(200).json({ message: "Booking canceled successfully by student" });

    } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


