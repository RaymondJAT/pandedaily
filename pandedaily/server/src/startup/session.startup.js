const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
require('dotenv').config()

const store = new MongoDBStore({
  uri: process.env._MONGODB_URL,
  collection: process.env._SESSION_COLLECTION || 'sessions',
  expires: 1000 * 60 * 60 * 24 * 14, // 14 days
})

store.on('error', function (error) {
  console.error('Session store error:', error)
})

const options = {
  store: store,
  secret: process.env._SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 14,
  },
}

const initSession = (app) => {
  app.use(session(options))
}

module.exports = {
  initSession,
}
