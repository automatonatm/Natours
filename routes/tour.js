
const express = require('express');

const router = express.Router();


const reviewRouter =  require('./../routes/review');




const {
    getAllTours, createTour,
    getTour, updateTour,
    deleteTour, aliasTopTours,
    getTourStats, getMonthlyPlan, getToursWithin, uploadTourImage, resizeTourImages, filterFields
} = require('../controllers/toursController');


const {protect, authorize} = require('../middleware/auth');
const advanceFilters = require('../utils/advanceFilters');
const  Tour = require('./../models/Tour');
const  Review = require('./../models/Review');


/*// REVIEW NESTED ROUTE
router.route('/:tourId/reviews')
    .get(advanceFilters(Review, ''), getAllReviews)
    .post(protect, authorize('admin', 'user'), createReview )*/

//MOUNT REVIEW ROUTER WHEN THIS URL IS MATCHES, THEN MERGE PARAMS IS USED
router.use('/:tourId/reviews', reviewRouter);


//router.param('id', checkID)

router.route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);


router.route('/tour-stats')
    .get(getTourStats);


router.route('/monthly-plan/:year')
    .get(getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin);


router.route('/')
    .get(advanceFilters(Tour, ''), getAllTours)
    .post(protect, authorize('admin', 'lead-guide'), createTour);


router.route('/:id')
    .get(getTour)
    .patch(protect,
        authorize('admin', 'lead-guide'),
        uploadTourImage, resizeTourImages, updateTour)
    .delete(protect, authorize('admin', 'lead-guide'), deleteTour);


module.exports = router;