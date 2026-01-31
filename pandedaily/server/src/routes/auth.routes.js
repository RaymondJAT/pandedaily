const express = require('express')
const { Login, CheckSession, Logout } = require('../controller/auth.controller')

const authRouter = express.Router()

authRouter.post('/login', Login)
authRouter.get('/check', CheckSession)
authRouter.post('/logout', Logout)

module.exports = { authRouter }
