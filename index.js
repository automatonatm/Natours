//Core Modules

/*End*/

const express = require('express');
const morgan = require('morgan');
const  cookieParser = require('cookie-parser');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


//Routes
const  AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRoute = require('./routes/tour');
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const reviewRoute = require('./routes/review');

const app = express();

//Set security Htpp header
app.use(helmet());

/*Middlewares*/
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


//Limit request from same IP
/*
const limiter = rateLimit({

    message: 'To Many Request from this IP please try again in an hours time',
    headers: false,
});

//  apply to all requests
app.use('/api',limiter);*/




//Body Parser, reading data from the body into req.body
app.use(express.json({limit: '10kb'}));


//Cookie Passer
app.use(cookieParser());


// Or, to replace prohibited characters with _, use:
app.use(mongoSanitize({
    replaceWith: '_'
}));

app.use(xss());


//Prevent parameter pollution
app.use(hpp({
    whitelist: ['duration']
}));

app.use(express.static(`${__dirname}/public`));
/*End*/




//Mount Routers
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/reviews', reviewRoute);

//Handle 404 routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
});

app.use(globalErrorHandler);

module.exports = app;


