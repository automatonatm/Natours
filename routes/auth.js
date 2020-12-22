const express = require('express');
const router = express.Router();
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'To Many Request from this IP please try again in an hours time',
    headers: true,
});




const {protect} = require('../middleware/auth');
const {signup, signin, logOut, setResetPasswordToken, resetPassword, updatePassword, getMe, updateDetails} = require('../controllers/authController');


router.post('/signup', signup);
router.post('/signin', limiter, signin);
router.patch('/forgotpassword', setResetPasswordToken);
router.patch('/resetpassword/:resettoken', resetPassword);
router.post('/logout', logOut);

router.use(protect); // keep for using protect
router.patch('/updatepassword', updatePassword);
router.patch('/updateAccount', updateDetails);
router.get('/me', getMe);



module.exports = router;