const  Tour = require('../models/Tour');
const catcchAsync = require('../utils/catchAsync');

exports.getOverview = catcchAsync( async (req, res) => {

    // 1. Get tour Data
    const  tours = await  Tour.find();
    // 2. Build Template
    // 3. Render Data
    res.status(200).render('overview', {title: "All Tours", tours});
});

exports.getTour =  catcchAsync (async (req, res) => {
     const tour = await Tour.findOne({slug: req.params.slug}).populate({
         path: 'reviews',
         fields: 'review rating user'
     });
    res.status(200).render('tour', {title: tour.name, tour});
});


exports.login = catcchAsync(async (req, res) => {
      res.status(200).render('login', {title: 'Login'})
});


exports.signup = catcchAsync(async (req, res) => {
    res.status(200).render('register', {title: 'Signup'})
});
