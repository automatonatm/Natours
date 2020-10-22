//Core Modules

/*End*/

const express = require('express');
const morgan = require('morgan');



//Routes
const tourRoute = require('./routes/tour');
const userRoute = require('./routes/users');

const app = express();


/*Middlewares*/
app.use(morgan('dev'));
app.use(express.json());

/*End*/




//Mount Routers
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);


module.exports = app;


