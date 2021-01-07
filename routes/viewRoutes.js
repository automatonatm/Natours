const express = require('express');
const router = express.Router();

const  {getOverview, getTour, login, signup} = require('../controllers/viewsController');
const {isLogin} = require('../middleware/auth');

router.use(isLogin);

router.get('/', getOverview);

router.get('/tours/:slug', getTour);

router.get('/login',  login);

router.get('/signup',  signup);




module.exports = router;

