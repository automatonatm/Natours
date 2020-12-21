
const express = require('express');



const router = express.Router({
          mergeParams: true // accepts merge params coming rerouted routes
});

const advanceFilters = require('../utils/advanceFilters');

const  Review = require('./../models/Review')


const {
     getAllReviews, createReview
} = require('../controllers/reviewsController');

const {protect, authorize} = require('../middleware/auth');


// REVIEW NESTED ROUTE
router.route('/')
    .get(advanceFilters(Review,  ''), getAllReviews)
    .post(protect, authorize('admin', 'user'), createReview )


module.exports = router

