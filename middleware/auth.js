const  jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/User');

//Protect routes
exports.protect = catchAsync(async (req, res, next) => {

    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) {

        //set token from header
        token = req.headers.authorization.split(' ')[1];

    } else if(req.cookies.token) {
        //set token from logout
        token = req.cookies.token;
    }


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

       // const user = await User.findById(decoded.id);

        if(!req.user)  return next(new  AppError('Access denied, please login', 401));


        next()
    } catch (err) {
        return next(new  AppError('Access denied, please login', 401))
    }

});


// only For rendered pages and it shall oontain no error
exports.isLogin = catchAsync(async (req, res, next) => {

    let token;
    if(req.cookies.token) {
        //set token from logout
        token = req.cookies.token;
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
       const user = await User.findById(decoded.id);
        if(!user)  return next();
        res.locals.user = user;
    }
    //There is a logged in user

    next()

});

//ACL Access control
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new  AppError('UnAuthorised Action', 403))
        }
        next()
    }

};




