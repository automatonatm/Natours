const mongoose = require('mongoose');
const validator = require('validator');
const appError = require('../utils/appError');

const reviewSchema  = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review Field is required'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'A review belongs to a tour'],
        ref: 'Tour'
    },

    user: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'A review belongs to a user'],
        ref: 'User'
    }
},
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }, { emitIndexErrors: true }
    )

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;