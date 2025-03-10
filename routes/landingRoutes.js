const express=require('express');
const { registerPageController, postregisterPageController, loginPageController, postloginPageController, logoutPageController } = require('../controllers/landingControllers');
const router=express.Router();

router.get('/register',registerPageController);
router.post('/register',postregisterPageController);
router.get('/login',loginPageController)
router.post('/login',postloginPageController);
router.get('/logout',logoutPageController)

module.exports=router