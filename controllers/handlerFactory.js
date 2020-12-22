const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')


exports.createOne = Model =>  catchAsync(async (req, res, next) => {




    const doc = await Model.create(req.body);



    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })

});



exports.getOne = (Model, populateOptions = null) => catchAsync(async (req, res, next) => {

    const doc = await Model.findById(req.params.id).populate(populateOptions);


        /* .populate({
         path: 'guides',
         select: '-__v -createdAt'
     })*/

    if(!doc) {
        return next(new AppError(`No Document with ID ${req.params.id} found`, 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })

});


exports.updateOne = Model => catchAsync(async (req, res, next) => {


    const doc = await Model.findByIdAndUpdate(req.params.id, getReqBody(req), {
        new: true,
        runValidators: true
    });
    if(!doc) {
        return next(new AppError(`No Document with ID ${req.params.id} found`, 404))
    }

    res.status(200).json({
        status: true,
        data: {
            data: doc
        }
    })

});



exports.deleteOne =  Model => catchAsync(async (req, res, next) => {

    const doc  = await Model.findByIdAndDelete(req.params.id);

    if(!doc) {
        return next(new AppError(`No Document with ID ${req.params.id} found`, 404))
    }


    res.status(204).json({
        status: 'success',
        data: null
    })


});


exports.getAll = Model =>  catchAsync(async (req, res, next) => {
    /*        const features = new ApiFeatures(Tour.find(), req.query)
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
            })*/



    let filter
    if(req.params.tourId)  filter =  {tour: req.params.tourId}

    const doc = await Model.find(filter)



    if(req.params.tourId) {
       return  res.status(200)
            .json({
                status: 'success',
                count: doc.length,
                data: doc
            })
    }


    res.status(200)
        .json(res.advanceResults);

});



const getReqBody = (req) => {
    //copy of request query
    const reqBody = {...req.body};

    //Fields to exclude
    const removeFields = ['ratingsAverage', 'priceDiscount', 'tour', 'durationWeeks', 'user'];


    //loop over removeFields and delete for request query
    removeFields.forEach(param => delete reqBody[param]);

    return reqBody

}













