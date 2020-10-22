const express = require('express');
const router = express.Router();


const getAllUser = (req, res) => {

    res.status(500).json({
        status: false,
        message: 'Route not yet Defined'
    })
};

const getUser = (req, res) => {

    res.status(500).json({
        status: false,
        message: 'Route not yet Defined'
    })
};

const createUser = (req, res) => {
    res.status(500).json({
        status: false,
        message: 'Route not yet Defined'
    })
};

const deleteUser = (req, res) => {
    res.status(500).json({
        status: false,
        message: 'Route not yet Defined'
    })
};

const updateUser = (req, res) => {

    res.status(500).json({
        status: false,
        message: 'Route not yet Defined'
    })
};



router.route('/')
    .get(getAllUser)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);


module.exports = router;