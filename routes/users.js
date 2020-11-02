const express = require('express');
const router = express.Router();

const {
    getUser, createUser, getAllUser, deleteUser, updateUser
} = require('../controllers/usersController');



router.route('/')
    .get(getAllUser)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);


module.exports = router;