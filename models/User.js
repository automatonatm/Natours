const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const validator = require('validator');
const appError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

//^[a-zA-Z][A-Za-z0-9_]*$
//^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,  'Name field is required'],
        maxlength: [50, 'Username cannot be more than 20 characters'],
        minlength: [5, 'Username must have at least 5 characters'],
        match: [
            /^\b(?!.*\.{2})[a-zA-Z.]+(?:\s[a-zA-Z.]+)\b$/,
            'The Full Name Format is Incorrect'
        ]

    },
    username: {
        type: String,
        unique: true,
        required: [true,  'User name field is required'],
        maxlength: [20, 'Username cannot be more than 20 characters'],
        minlength: [5, 'Username must have at least 5 characters'],
        validate: [validator.isAlphanumeric, 'Username must have not contain any special Characters or spaces'],
        match: [
            /^[a-zA-Z][A-Za-z0-9_]*$/,
            'Username cannot begin with a number'
        ]
    },
    email: {
        type: String,
        unique: true,
        required: [true,  'Email field is required'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        select: false,
        type: String,
        minlength: [8, 'Password must have at least 8 character'],
        required: [true,  'Password field is required'],
        match: [
            /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/,
            'Password must Contain at least a number, and a special Character'
        ]
    },

    resetPasswordToken: String,
    resetPasswordExpiredAt: Date,
    passwordChangedAt: Date,
    photo: {
        type: String,
        default: 'default.png'
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },

});

userSchema.pre('save', async  function (next) {
    if(!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next()

});

userSchema.pre('/^find/', function (next) {
    this.find({active: true});
    next()
});

//Match user password
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
};

//Sign JWT and return token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
};

//Check if user changed is password
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if(this.passwordChangedAt) {

        let changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        console.log(changeTimeStamp, JWTTimestamp)

        return JWTTimestamp < changeTimeStamp
    }
    return false;
}


//Generate and has password token
userSchema.methods.getResetToken = async function () {
    //Generate Token
    const restToken =  crypto.randomBytes(20).toString('hex');

    //hash token and set to resetPassword token
    this.resetPasswordToken = crypto.createHash('sha256').update(restToken).digest('hex');

    //Set Expire
    this.resetPasswordExpiredAt = Date.now() + 10 * 60 *  1000;
    return restToken;
};



module.exports = mongoose.model('User', userSchema);

