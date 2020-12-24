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

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    })

    next()
})

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
    const stats =   await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ])
    console.log(stats)
}



reviewSchema.pre('save', function (next) {
    //point to current review
    this.construct.calculateAverageRatings(this.tour)
    next()
})


const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;