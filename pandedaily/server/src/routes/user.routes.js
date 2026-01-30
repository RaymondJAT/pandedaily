const express = require('express')
const { valieField, validateSchema } = require('../middleware/validateSchema.middleware')
const { MasterUserSchema, MasterUserField } = require('../schemas/master-user.schema')
const { getUser, getUserById, addUser, updateUser } = require('../controller/user.controller')

const userRouter = express.Router()

// GET
userRouter.get('/', getUser)
userRouter.get('/:id', getUserById)

// POST
userRouter.post('/', addUser)

// PUT
userRouter.put('/:id', updateUser)

module.exports = { userRouter }
