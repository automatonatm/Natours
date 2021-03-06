//Core Modules

/*End*/
const  path = require('path');
const express = require('express');
const morgan = require('morgan');
const  cookieParser = require('cookie-parser'); //Allows cookies to be passed on each request
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const  compression = require('compression');


//Routes
const  AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRoute = require('./routes/tour');
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const reviewRoute = require('./routes/review');
const viewRoute = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

/*app.use(function (req, res, next) {
    res.setHeader(
        'Content-Security-Policy-Report-Only',
        "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js 'sha512-bZS47S7sPOxkjU/4Bt0zrhEtWx0y0CRkhEp8IckzK+ltifIIE9EMIMTuT/mEzoIMewUINruDBIR/jJnbguonqQ==' 'unsafe-inline';  style-src 'self'; frame-src 'self'"
    );
    next();
})*/

//App views
//http cors


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


/*app.use(cors({
    origin: 'https://.natours.com'
}));*/
app.use(cors());

app.options('*', cors());

//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

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


//Cookie Passer allows data to be passed as cookies
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

//app.use(express.static(`${__dirname}/public`));

/*End*/



app.use(compression());
//Test Middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.cookies)
    next()
})


//Mount  View Routers
app.use('/', viewRoute);
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


