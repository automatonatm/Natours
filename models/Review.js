const mongoose = require('mongoose');
const validator = require('validator');
const appError = require('../utils/appError');
const Tour = require('./Tour')

const reviewSchema  = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review Field is required'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'A review belongs to a tour'],
        ref: 'Tour'
    },

    user: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'A review belongs to a user'],
        ref: 'User'
    }
},
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }, { emitIndexErrors: true }
    )


//add a constraint that allows a user to add only one review per tour
reviewSchema.index({tour: 1, user: 1}, {unique: true});

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    })

    next()
})



/*

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
     console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
    //console.log(this.r.tour)
});


*/



//static method to get average cost of course tuition
reviewSchema.statics.getAverageRating  = async function (tourId) {

    const obj = await  this.aggregate([
        {
            $match:  {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }

    ]);

    try {
        await this.model('Tour').findByIdAndUpdate(tourId, {
            ratingsQuantity: obj[0].nRating,
            ratingsAverage: obj[0].avgRating
            //Math.ceil(obj[0].averageCost / 10) * 10
        })
    } catch (err) {
        console.error((err))
    }
};



//call get Average cost after save
reviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.tour)
});



//call get Average cost before save
reviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.tour)
});



const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;