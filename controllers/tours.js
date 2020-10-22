const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.checkID  = (req, res, next, val) => {
    console.log(` Tour id is: ${val}`);
    if (req.params.id *1 > tours.length) {
        return res.status(404).json({
            status: false,
            message: 'Invalid Id'
        })
    }
    next()
}

// @desc Add a new tour
// @route GET /api/v1/tours
// @access Private

exports.addTour =  (req, res) => {
    console.log(req.body)
};

// @desc Get all tours
// @route POST /api/v1/tours
// @access Public
exports.getAllTours  = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })

};

// @desc Add a  tour
// @route POST /api/v1/tours/:id
// @access Public
exports.getTour  =  (req, res) => {

    const id = req.params.id * 1;
    const tour = tours.find(tour => tour.id === id);

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })

};

// @desc Update a new tour
// @route PUT /api/v1/tours/:id
// @access Private
exports.updateTour = (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find(tour => tour.id === id);

    res.status(200).json({
        status: true,
        data: {
            tour: "Update Here"
        }
    })
};


// @desc delete a new tour
// @route DELETE /api/v1/tours/:id
// @access Private
exports.deleteTour = (req, res) => {

    const id = req.params.id * 1;
    const tour = tours.find(tour => tour.id === id);



    res.status(204).json({
        status: true,
        data: null
    })
};


