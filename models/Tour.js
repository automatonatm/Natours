const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const appError = require('../utils/appError');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name.'],
        unique: true,
        trim: true,
        minlength: [10, "A tour must have at least 10 characters"],
        maxlength: [40, "A tour must at most 40 characters"],
       // validate: [validator.isAlpha, 'Tour name must only contain alphabets']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type:  Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty level'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult'
        },
        default: 'easy'

    },
    ratingsAverage: {
        type: Number,
        default: 0.0,
        min: [1, 'Rating must be at least 1.0'],
        max: [10, 'Rating must can not be more than 10']

    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount:{
        type: Number,
        validate: {
            validator: function (val) {
                //not work on update
                return val < this.price
            },
            message: "Discount price ({VALUE}) should be below the regular price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover Image']
    },
    images: {
        type: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    secretTour: {
        type: Boolean,
        default: false
    },
     startLocation: {
        //GeoJSON
         type: {
             type: String,
             default: 'Point',
             enum: ['Point']
         },
         coordinates: [Number],
         address: String,
         description: String
     },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    startDates: [Date]
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
}, { emitIndexErrors: true });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
});

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    next()
});



//QUERY MIDDLEWARE
//Show if secret location is not true
tourSchema.pre(/^find/, function (next) {
    this.find({secretTour: {$ne: true}});
    next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: {secretTour: {$ne: true}}
    });

    next()
});





/*
tourSchema.post('save', function( error, res, next) {

    if (error.name === 'MongoError' && error.code === 11000) {
        console.log(error.MongoError)
        next(new appError('There was a duplicate key error', 400));
    } else {
        next();
    }
});

tourSchema.post('update', handleE11000);
tourSchema.post('findOneAndUpdate', handleE11000);
tourSchema.post('insertMany', handleE11000);

*/


/*
tourSchema.post(/^find/, function (docs, next) {
   console.log(`Query took ${Date.now() - this.start} millisecs `);
    next();
});
*/




module.exports = mongoose.model('Tour', tourSchema);

