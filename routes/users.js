const express = require('express');

const router = express.Router();



const {protect, authorize} = require('../middleware/auth');

const advanceFilters = require('../utils/advanceFilters');
const User = require('../models/User');

const {
    getUser, createUser, getAllUser, deleteUser, updateUser
} = require('../controllers/usersController');



router.route('/')
    .get(advanceFilters(User, ''), getAllUser)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'),deleteUser);



module.exports = router;