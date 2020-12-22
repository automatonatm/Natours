const Tour = require('../models/Tour');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


const {deleteOne, updateOne, createOne, getOne, getAll} = require('./handlerFactory')



// @desc Create a Review
// @route POST /api/v1/tours/:tourId/reviews
// @access Private
exports.createReview = createOne(Review)


// @desc get a  single Review
// @route GET /api/v1/reviews/:id
// @access Public
exports.getAReview = getOne(Review)


// @desc update a  single Review
// @route PUT /api/v1/reviews/:id
// @access Private
// We use our Factory
exports.updateReview = updateOne(Review)




// @desc delete a  single Review
// @route DELETE /api/v1/reviews/:id
// @access Private
// We use our Factory
exports.deleteReview = deleteOne(Review)



// @desc Get all reviews
// @route GET /api/v1/reviews
// @access Public

exports.getAllReviews = getAll(Review)





//middleware for creating a review

exports.setTourUserId = (req, res, next) => {
    if(!req.body.tour)  req.body.tour = req.params.tourId
    if(!req.body.user)  req.body.user = req.user.id
    next()
}




/*
 @TODO
 1. write a middleware for checking in resource exist
 2. Write a middleware to remove some post request if sent by user

*/






