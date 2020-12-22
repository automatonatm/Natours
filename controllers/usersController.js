const User = require('../models/User');

const {deleteOne, updateOne, createOne, getOne, getAll} = require('./handlerFactory')

// @desc Get all users
// @route GET /api/v1/users/
// @access Private

exports.getAllUser = getAll(User)




// @desc Get a user
// @route GET /api/v1/users/:id
// @access Private
exports.getUser = getOne(User)



// @desc Add a user
// @route POST /api/v1/users/
// @access Private
exports.createUser = createOne(User)



// @desc Update a single
// @route PATCH /api/v1/users/
// @access Private
exports.updateUser = updateOne(User)



// @desc Delete a user
// @route DELETE /api/v1/users/:id
// @access Private
exports.deleteUser = deleteOne(User)



