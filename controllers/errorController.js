const appError = require('../utils/appError')

const sendDevError =  (err, res) => {

    res.status(err.statusCode)
        .json({
            status: err.status,
            message: err.message,
            err: err,
            stack: err.stack
        });

   /* if(err.isOperational) {

        res.status(err.statusCode)
            .json({
                status: err.status,
                message: err.message,
                err: err,
                stack: err.stack
            });
    }else {
        res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
        })
    }*/
};

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
   const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `${value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')} Already exists`;
    return new appError(message, 400 )
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const  message = `Invalid input data. ${errors.join('. ')}`;
    return new appError(message, 400);
}

const handleAuthError = (err) =>  new appError(err.message, 401);

const handleBadRequest = (err) =>  new appError(err.message, 400);

const handleForbidden = (err) =>  new appError(err.message, 403);

module.exports = (err, req, res, next) => {


    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {

       /* let error = { ...err };
       //console.log(err.name)


        if(err.name === 'CastError') error = handleCastErrorDB(error);

        if(err.code === 11000) error = handleDuplicateFieldDB(err);

        if(err.name === "ValidationError") error = handleValidationErrorDB(error);

      sendDevError(error, res)
*/

        sendDevError(err, res)


    }else if(process.env.NODE_ENV === 'production') {


        let error = { ...err };



        if(err.name === 'CastError') error = handleCastErrorDB(error);

        if(err.code === 11000) error = handleDuplicateFieldDB(err);

        if(err.name === "ValidationError") error = handleValidationErrorDB(error);

        if(err.statusCode === 401) error = handleAuthError(err);

       if(err.statusCode === 400) error = handleBadRequest(err);

       if(err.statusCode === 403) error = handleForbidden(err);

       sendProdError(error, res)
    }


};

