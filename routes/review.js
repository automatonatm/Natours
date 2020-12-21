
const express = require('express');

const router = express.Router();




const {
     getAllReviews, createReview
} = require('../controllers/reviewsController');

const {protect, authorize} = require('../middleware/auth');

router.route('/')
    .get(getAllReviews)
    .post(protect, authorize('admin', 'user'), createReview)



module.exports = router

