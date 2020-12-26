const Tour = require('../models/Tour');
const ApiFeatures = require('../utils/apiFeatures');
const advanceFilters = require('../utils/advanceFilters');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const {deleteOne, updateOne, createOne, getOne, getAll} = require('./handlerFactory')




// @desc Add a new tour
// @route POST /api/v1/tours
// @access Private
exports.createTour = createOne(Tour)


// @desc Get a  tour
// @route GET /api/v1/tours/:id
// @access Public
exports.getTour  = getOne(Tour, {path: 'reviews'})



// @desc Update a new tour
// @route PUT /api/v1/tours/:id
// @access Private
exports.updateTour = updateOne(Tour)




// @desc delete a  tour
// @route DELETE /api/v1/tours/:id
// @access Private
// We use our Factory
exports.deleteTour = deleteOne(Tour)




// @desc Get all tours
// @route GET /api/v1/tours
// @access Public
exports.getAllTours  = getAll(Tour)






// @desc Get top 5 tours
// @route GET /api/v1/tours
// @access Public
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};



// @desc Get tours with a certain redius
// @route GET /api/v1/tours-within/:distance/center/:latlng/unit:unit
// @access Public

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const   {distance, latlng, unit }  = req.params


    const [lat, lng] = latlng.split(',')

    const radius =  unit === 'mi' ? (distance / 3963.2) : (distance / 6378.1)

    if(!lat || !lng) {
        return next(new AppError('Please Latitude and longitude in the format lat,lng', 400))

    }

    console.log(distance, lat, lng, unit)

    const tours = await Tour.find({
        startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]} }
    })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
});




// @desc  get Tours stats
// @route GET /api/v1/tours/tour-stat
// @access Public
exports.getTourStats = catchAsync(async (req, res, next) => {

        const  stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: {$gte: 4.5} }
            },
            {
                $group: {
                    //_id: '$difficulty',
                    _id: {$toUpper: '$difficulty'},
                    numTours: {$sum: 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'},
                }
            },
            {
                $sort:  {avgPrice: 1}
            },
/*
            {
                $match: {_id: {$ne: 'EASY'} }
            },
*/
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })

});



// @desc  get Tours stats by year
// @route GET /api/v1/tours/monthly-plan/:year
// @access Public
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

        const year =  req.params.year * 1;
        const  plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }

            },
            {
                $group:  {
                    _id: {$month: '$startDates'},
                    numTourStats: {$sum: 1},
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields: {month: '$_id'}
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {numTourStats: -1}
            },

        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })

});




