const appError = require('../utils/appError')

const sendDevError =  (err, res) => {
    res.status(err.statusCode)
        .json({
            status: err.status,
            message: err.message,
            err: err,
            stack: err.stack
        });
}

const sendProdError =  (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode)
            .json({
                status: err.status,
                message: err.message,
            });
    }else{
        res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
        })
    }
};

const  handleCastErrorDB = (err) => {
   const  message = `Invalid ${err.path}: ${err.value}`;
    return new appError(message, 400 )
};

const handleDuplicateFieldDB = (err) => {

    //Get the error object and iterate
   const value = err.MongoError.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value)
    const message = `x. Already exists`;
    return new appError(message, 400 )
};


module.exports = (err, req, res, next) => {


    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
      sendDevError(err, res)

    }else if(process.env.NODE_ENV === 'production') {

        console.log(err)
        let error = {...err};

        if(err.name === 'CastError') error = handleCastErrorDB(error);
        if(err.code === 11000) error = handleDuplicateFieldDB(error);

      sendProdError(error, res)
    }


};

