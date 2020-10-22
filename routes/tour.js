const express = require('express');
const router = express.Router();



const {
    getAllTours, addTour, getTour, updateTour, deleteTour
} = require('../controllers/tours')




router.route('/')
    .get(getAllTours)
    .post(addTour);


router.route('/:id')
    .get(getTour)
    .put(updateTour)
    .delete(deleteTour);


module.exports = router;