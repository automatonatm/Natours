
const express = require('express');

const router = express.Router();




const {
    getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan
} = require('../controllers/toursController');

const {protect, authorize} = require('../middleware/auth');

//router.param('id', checkID)

router.route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router.route('/tour-stats')
    .get(getTourStats);


router.route('/monthly-plan/:year')
    .get(getMonthlyPlan);


router.route('/')
    .get(getAllTours)
    .post(protect, authorize('admin', 'lead-guide'), createTour);


router.route('/:id')
    .get(getTour)
    .patch(protect, authorize('admin', 'lead-guide'), updateTour)
    .delete(protect, authorize('admin', 'lead-guide'), deleteTour);


module.exports = router;