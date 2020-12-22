const advanceResults = (model, populate) => async(req,  res, next) => {
    let query;

    //copy of request query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];


    //loop over removeFields and delete for request query
    removeFields.forEach(param => delete reqQuery[param]);

    //console.log(reqQuery)

    let queryStr = JSON.stringify(reqQuery);


    //creating  operators
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);


    query = model.find(JSON.parse(queryStr))//.populate('courses');
    //query = model.find(JSON.parse(queryStr)).explain();//.populate('courses');

    //Selection fields

    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields)
    }




    // Sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy)
    }else  {
        query = query.sort('-createdAt');
    }

    //if filter


   /* let filter
    if(req.params.tourId)  filter =  {tour: req.params.tourId}

    const doc = await Model.find(filter)*/



    // Pagination
    const  page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit,10) || 100;
    const startIndex = (page-1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();


    query = query.skip(startIndex).limit(limit);


    if(populate) {
        query = query.populate(populate)
    }

    //Execute Query
    const  results = await query;

    //Pagination Result
    const  pagination = {};

    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }


    if(startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }


    res.advanceResults = {
        status: 'success',
        count: results.length,
        pagination,
        data: results
    };

    next()
};

module.exports = advanceResults;