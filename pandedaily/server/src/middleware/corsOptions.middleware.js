require('dotenv').config()

const isProduction = process.env.VITE_ENV === 'production'

const allowedOrigins = isProduction
  ? [process.env.VITE_PRODUCTION_API]
  : [
      `http://${process.env._HTTP_HOST}:${process.env.VITE_CLIENT_PORT}`,
      `http://localhost:${process.env.VITE_CLIENT_PORT}`,
      `http://127.0.0.1:${process.env.VITE_CLIENT_PORT}`,
    ]

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-requested-with'],
}

module.exports = {
  corsOptions,
}
