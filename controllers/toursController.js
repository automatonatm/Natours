const Tour = require('../models/Tour');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');



// @desc Add a new tour
// @route POST /api/v1/tours
// @access Private

exports.createTour =  catchAsync(async (req, res, next) => {

    const tour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour
        }
    })

});

// @desc Get top 5 tours
// @route GET /api/v1/tours
// @access Public

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};


// @desc Get all tours
// @route GET /api/v1/tours
// @access Public
exports.getAllTours  =  catchAsync(async (req, res, next) => {

        const features = new ApiFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const  tours = await features.query;

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })


});

// @desc Get a  tour
// @route GET /api/v1/tours/:id
// @access Public
exports.getTour  = catchAsync(async (req, res, next) => {


        const tour = await Tour.findById(req.params.id);

        if(!tour) {
            return next(new AppError(`No tour with ID ${req.params.id} found`, 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })

});

// @desc Update a new tour
// @route PUT /api/v1/tours/:id
// @access Private
exports.updateTour = catchAsync(async (req, res, next) => {

        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    if(!tour) {
        return next(new AppError(`No tour with ID ${req.params.id} found`, 404))
    }


    res.status(200).json({
            status: true,
            data: {
                tour
            }
        })

});


// @desc delete a new tour
// @route DELETE /api/v1/tours/:id
// @access Private

exports.deleteTour = catchAsync(async (req, res, next) => {

     const tour  = await Tour.findByIdAndDelete(req.params.id);

    if(!tour) {
        return next(new AppError(`No tour with ID ${req.params.id} found`, 404))
    }

    res.status(204).json({
            status: 'success',
            data: null
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




