const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

/*Route Handlers*/
const addTour =  (req, res) => {
    console.log(req.body)
};

const getAllTours  = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })

};

const getTour  =  (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find(tour => tour.id === id);

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })

};


const updateTour = (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find(tour => tour.id === id);
    if (!tour) {
        res.status(404).json({
            status: false,
            message: 'not fount'
        })
    }

    res.status(200).json({
        status: true,
        data: {
            tour: "Update Here"
        }
    })
};




const deleteTour = (req, res) => {

    const id = req.params.id * 1;
    const tour = tours.find(tour => tour.id === id);

    if (!tour) {
        res.status(404).json({
            status: false,
            message: 'not found'
        })
    }

    res.status(204).json({
        status: true,
        data: null
    })
};
