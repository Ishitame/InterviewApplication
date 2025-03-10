const express=require('express');
const verifyToken = require('../middlewares/Authentication');
const { createController, getInstructorSlots, available, deleteSlot, cancelBookingInstructor, submitFeedback, pastInterviews } = require('../controllers/instructorControllers');
const router=express.Router();

router.post('/create-slot',verifyToken,createController)
router.get('/bookedslot',verifyToken,getInstructorSlots)
router.get('/available',verifyToken,available)
router.post('/delete',verifyToken,deleteSlot)
router.post('/cancelInstructor',verifyToken,cancelBookingInstructor)
router.post('/feedback',verifyToken,submitFeedback)
router.get('/past',verifyToken,pastInterviews)



module.exports=router;
