const express=require('express');
const verifyToken = require('../middlewares/Authentication');
const { createController, getInstructorSlots, available, deleteSlot, cancelBookingInstructor, submitFeedback, pastInterviews, getPendingBookings, updateBookingStatus } = require('../controllers/instructorControllers');
const router=express.Router();

router.post('/create-slot',verifyToken,createController)
router.get('/bookedslot',verifyToken,getInstructorSlots)
router.get('/available',verifyToken,available)
router.post('/delete',verifyToken,deleteSlot)
router.post('/requests',verifyToken,getPendingBookings)
router.post('/update/:bookingId',verifyToken,updateBookingStatus)
router.post('/cancelInstructor',verifyToken,cancelBookingInstructor)
router.post('/feedback',verifyToken,submitFeedback)
router.get('/past',verifyToken,pastInterviews)



module.exports=router;
