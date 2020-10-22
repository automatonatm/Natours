const express = require('express');
const router = express.Router();

const {
    getUser, createUser, getAllUser, deleteUser, updateUser
} = require('../controllers/users')



router.route('/')
    .get(getAllUser)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);


module.exports = router;