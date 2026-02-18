const corsOptions = {
  origin: 'http://192.168.40.101:5173',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}

module.exports = {
  corsOptions,
}
