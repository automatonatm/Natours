const Tour = require('../models/Tour');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');



// @desc Get all reviews
// @route GET /api/v1/tours/:id
// @access Public

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find()

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
})


// @desc Create a Review
// @route GET /api/v1/tours/:id
// @access Private

exports.createReview = catchAsync(async (req, res, next) => {
    const review = await Review.create(req.body)

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    })
})



