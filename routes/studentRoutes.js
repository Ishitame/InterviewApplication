const express=require('express');
const verifyToken = require('../middlewares/Authentication');
const { bookSlot, ScheduledSlot, getAvailableSlots, cancelBookingStudent, previous, PendingSlot } = require('../controllers/studentControllers');
const router=express.Router();




router.post('/bookSlot',verifyToken,bookSlot)
router.post('/mySlots',verifyToken,ScheduledSlot)
router.post('/pending',verifyToken,PendingSlot)
router.post('/free',getAvailableSlots)
router.post('/cancelStudent',verifyToken,cancelBookingStudent)
router.get('/previous',verifyToken,previous)
module.exports=router