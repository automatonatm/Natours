
const express = require('express');

const router = express.Router();




const {
     getAllReviews, createReview
} = require('../controllers/reviewsController');

const {protect, authorize} = require('../middleware/auth');

 router.route('/')



module.exports = router

