const express = require('express')
const router = express.Router();
const authcontroller = require('../controller/authController')
const authMiddleware = require('../middleware/authMiddleware')
const {multerMiddleware} = require('../config/imageCloud')


router.post('/sendOtp' ,authcontroller.sendOtp ) 
router.post('/verifyOtp' ,authcontroller.verifyotp )
router.get('/logout' , authcontroller.logout)

//protected routes
router.put('/updateProfile' ,multerMiddleware.single('profilePic') , authMiddleware,authcontroller.profileUpdate)
router.get('/checkAuth'  ,authMiddleware,authcontroller.checkAuthorization)
router.get('/users'  ,authMiddleware,authcontroller.getAllUsers)

module.exports = router;