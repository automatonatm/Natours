const express = require('express');
const router = express.Router();






router.route('/')
    .get(getAllTours)
    .post(addTour);


router.route('/:id')
    .get(getTour)
    .put(updateTour)
    .delete(deleteTour);


module.exports = router;