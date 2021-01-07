const Tour = require('../models/Tour');
const ApiFeatures = require('../utils/apiFeatures');
const advanceFilters = require('../utils/advanceFilters');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const  multer = require('multer');
const sharp = require('sharp');

const {deleteOne, updateOne, createOne, getOne, getAll} = require('./handlerFactory')

//store image in memory
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    }else {
        cb(new AppError('Not an image!', 400), false)
    }

};
//specify the storage file
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

//upload multiple images(mixed)
exports.uploadTourImage = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
]);

//Just for multiple with same name
//upload.array('images', 4)


//Image Processing
exports.resizeTourImages = catchAsync( async (req, res, next) => {

    if(!req.files.imageCover || !req.files.images) return  next();

    //console.log(req.files);
    // 1) Cover image
    const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize({
            width: 2000,
            height: 1333,
            fit: sharp.fit.cover,
        })
        .toFormat('jpeg')
        .jpeg({quality : 90})
        .toFile(`public/img/tours/${imageCoverFileName}`);

    //Add it to request body since we are using a factory
     req.body.imageCover = imageCoverFileName;


    //2) images
    req.body.images = []; // create empty list images
    await Promise.all(req.files.images.map( async (file, index) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(file.buffer)
            .resize({
                width: 1500,
                height: 888,
                fit: sharp.fit.cover,
            })
            .toFormat('jpeg')
            .jpeg({quality : 45})
            .toFile(`public/img/tours/${filename}`);

        // At each loop push the file name
        req.body.images.push(filename)
    }));

    console.log(req.body)

    next()
});


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


exports.filterFields  = (req, res, next) =>  {
    //copy of request query
    const reqBody = {...req.body};

    //Fields to exclude
    const removeFields = ['role', 'ratingsAverage', 'priceDiscount', 'durationWeeks'];


    //loop over removeFields and delete for request query
     req.body = removeFields.forEach(param => delete reqBody[param]);
     next()

};



