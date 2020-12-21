const Tour = require('../models/Tour');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');





// @desc Get all reviews
// @route GET /api/v1/reviews
// @access Public

exports.getAllReviews = catchAsync(async (req, res, next) => {

    let filter

    if(req.params.tourId)  filter =  {tour: req.params.tourId}

    const reviews = await Review.find(filter)



    if(req.params.tourId) {
         res.status(200)
             .json({
                 status: 'success',
                 count: reviews.length,
                 reviews
             })
    }


    res.status(200)
        .json(res.advanceResults);
})





// @desc Create a Review
// @route POST /api/v1/tours/:tourId/reviews
// @access Private

exports.createReview = catchAsync(async (req, res, next) => {

    if(!req.body.tour)  req.body.tour = req.params.tourId
    if(!req.body.user)  req.body.user = req.user.id




    const review = await Review.create(req.body)

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    })
})



