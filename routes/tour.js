
const express = require('express');

const router = express.Router();




const {
    getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan
} = require('../controllers/toursController');


//router.param('id', checkID)

router.route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router.route('/tour-stats')
    .get(getTourStats);


router.route('/monthly-plan/:year')
    .get(getMonthlyPlan);


router.route('/')
    .get(getAllTours)
    .post(createTour);


router.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);


module.exports = router;