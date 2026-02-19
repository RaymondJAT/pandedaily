const express = require('express')
const { reverseGeocode, searchGeocode } = require('../controller/geocode.controller')

const geocodeRouter = express.Router()

geocodeRouter.get('/reverse', reverseGeocode)
geocodeRouter.get('/search', searchGeocode)

module.exports = { geocodeRouter }
