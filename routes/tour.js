

const express = require('express');
const router = express.Router();


const {
    getAllTours, addTour, getTour, updateTour, deleteTour, checkID, checkBody
} = require('../controllers/tours')


router.param('id', checkID)

router.route('/')
    .get(getAllTours)
    .post(checkBody, addTour);


router.route('/:id')
    .get(getTour)
    .put(updateTour)
    .delete(deleteTour);


module.exports = router;