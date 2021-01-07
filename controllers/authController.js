const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendMail = require('../utils/sendEmail');
const crypto = require('crypto');
const  multer = require('multer');
const sharp = require('sharp');


/*const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users',  )
    },
    filename:  (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
    }
});*/

//store image in memory
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    }else {
        cb(new AppError('Not an image!', 400), false)
    }

};
//specify the storage file
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

//upload to temporary file
exports.uploadUserPhoto = upload.single('photo');

//Image Processing
exports.resizePhoto = (req, res, next) => {
    if(!req.file) return  next();

     req.file.filename =  `user-${req.user.id}-${Date.now()}.jpeg`;

    sharp(req.file.buffer)
        .resize({
            width: 500,
            height: 500,
            fit: sharp.fit.cover,

        })
        .toFormat('jpeg')
        .jpeg({quality : 90})
        .toFile(`public/img/users/${req.file.filename}`);

    next();
}



// @desc Register as a new user
// @route POST /api/v1/auth/signup
// @access Public

exports.signup = catchAsync(async (req, res, next) => {

    const {username, password, email, name } = req.body;

    const user = await User.create({
        name, username, password, email
    });

    sendTokenResponse(user, 200, res);


});


// @desc signin as a user
// @route POST /api/v1/auth/signin
// @access Public

exports.signin = catchAsync(async (req, res, next) => {

    const {email, password} = req.body;

    //console.log(req.cookies)

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

    if(req.body.password === '')  return next(new AppError('Please provide a new password', 422));

    //Get Hashed token
    const resetPasswordToken  = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');




    //Find user by resettoken
    const user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpiredAt: {$gt: Date.now()}
    });



    if (!user) return next(new AppError('Invalid or Expired Token', 400));

    user.password =  req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiredAt = undefined;
    await user.save({validateBeforeSave: true});
    //user.save();

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
    await user.save({validateBeforeSave: true});
    //user.save();

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
    console.log(req.file);
    console.log(req.body);

    const fieldsToUpdate  =  {
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
        };
    if(req.file) fieldsToUpdate.photo = req.file.filename;


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

    if(process.env.NODE_ENV === 'production') options.httpOnly = true; //options.secure = true ;

    res.status(statusCode)
        .cookie('token', token, options)
        .json({success: 'success', token})
};



