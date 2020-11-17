const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendMail = require('../utils/sendEmail');
const crypto = require('crypto');


// @desc Register as a new user
// @route POST /api/v1/auth/signup
// @access Public

exports.signup = catchAsync(async (req, res, next) => {

    const {username, password, email } = req.body;

    const user = await User.create({
        username, password, email
    });

    sendTokenResponse(user, 200, res);


});


// @desc signin as a user
// @route POST /api/v1/auth/signin
// @access Public

exports.signin = catchAsync(async (req, res, next) => {

    const {email, password} = req.body;

    console.log(req.body)

    //validate
    if(!password || !email) return  next(new AppError('Please fill all form fields', 400 ));

   // Check for match in DB


    //check for user
    const user = await User.findOne({email}).select('+password');

    if(!user) return next(new AppError('Invalid email or password', 401));

    //check if password matches
    const isMatch = await user.matchPassword(password);

    if(!isMatch) {
        return next(new AppError('Invalid email or password', 401));
    }


    sendTokenResponse(user, 200, res)

});



// @desc  Forgot Password
// @route POST /api/v1/auth/forgotpassword
// @access Public
exports.setResetPasswordToken = catchAsync(async (req, res, next) => {

    if(req.body.email === '')  return next(new AppError('Please provide an email', 422));

    const user = await User.findOne({email: req.body.email});

    if(!user)  return next(new AppError('User with this email not found', 404));

    //Get Reset Token
    const resetToken = await  user.getResetToken();

    await user.save({validateBeforeSave: false});

    //Create reset reset url

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `Click here to reset your password ${resetUrl}`;

    try {
        await sendMail({
            email:  user.email,
            subject: 'Password Reset Token',
            message
        })

        return res.status(200)
            .json({
                status: 'success',
                data: 'Email has been sent'
            })

    } catch (err) {
        console.log(err)
        user.resetPasswordToken = undefined
        user.resetPasswordExpiredAt = undefined
        await user.save({validateBeforeSave: false});

        return next(new AppError('An Unknown Error Occurred, Please Try Again', 400));
    }




});


// @desc Reset password
// @route POST /api/v1/auth/resetpassword/:resettoken
// @access Public
exports.resetPassword = catchAsync(async (req, res, next) => {

    //Get Hashed token
    const resetPasswordToken  = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    //Find user by resettoken
    const user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpiredAt: {$gt: Date.now()}
    });


    if (!user) return next(new AppError('Invalid Token', 400));

    user.password =  req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiredAt = undefined;
    user.save();

    sendTokenResponse(user, 200, res)

});


// @desc  Update user password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    //check if password matches
    if(! (await user.matchPassword(req.body.currentPassword))) {
        return next(new AppError('Current Password is incorrect', 401));
    }

    user.password = req.body.password;
    user.save();

    sendTokenResponse(user, 200, res)

});


// @desc  Get Current logged in User
// @route POST /api/v1/auth/me
// @access Private
exports.getMe = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.user.id);

    return res.status(200)
        .json({
            status: 'success',
            data: user
        })
});


// @desc  Update User details
// @route POST /api/v1/auth/updatedetails
// @access Private
exports.updateDetails = catchAsync(async (req, res, next) => {

    const fieldsToUpdate  =  {
            username: req.body.username,
            email: req.body.email,
        }
    ;

    const user = await User.findByIdAndUpdate(req.user.id , fieldsToUpdate, {new: true, runValidators: true});

    return res.status(200)
        .json({
            status: 'success',
            data: user
        })
});


// @desc  Logout / Clear Cookies
// @route POST /api/v1/auth/logout
// @access Private
exports.logOut = catchAsync(async (req, res, next) => {

    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true
    });

    return res.status(200)
        .json({
            status: 'success',
            data: null
        })
});





//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //create Token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 *   60 * 60 * 1000 ),
    };

    if(process.env.NODE_ENV === 'production') options.httpOnly = true; options.secure = true ;

    res.status(statusCode)
        .cookie('token', token, options)
        .json({success: 'success', token})
};



