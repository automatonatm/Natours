
const express = require('express');



const router = express.Router({
          mergeParams: true // accepts merge params coming rerouted routes
});



const advanceFilters = require('../utils/advanceFilters');

const  Review = require('./../models/Review')


const {
     getAllReviews, createReview, deleteReview, updateReview, setTourUserId, getAReview
} = require('../controllers/reviewsController');

const {protect, authorize} = require('../middleware/auth');


// REVIEW NESTED ROUTE


router.route('/')
    .get(advanceFilters(Review,  ''), getAllReviews)
   // .post(protect, authorize('admin', 'user'), setTourUserId, createReview )


//Added middleware to all below
router.use(protect)
router.use(authorize('admin', 'user'))


router.route('/')
    .post(setTourUserId, createReview )


router.route('/:id')
    .get(getAReview)
    .delete(deleteReview)
    .patch(updateReview)



module.exports = router

