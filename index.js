'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const expressSanitizer = require('express-sanitizer')
const compression = require('compression')
const morgan = require('morgan')

const app = express()
const router = express.Router()

const environment = process.env.NODE_ENV || 'development'
const stage = require('./config/config')[environment]
const API_VERSION = require('./config/config').API_VERSION
const logger = require('./config/logger')
const routes = require('./routes/index')
const rateLimiter = require('./middleware/rateLimiter')

app.set('trust proxy', 1) // trust first proxy

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(expressSanitizer())
app.use(compression())
app.use(helmet({
  frameguard: {
    action: 'sameorigin'
  },
  referrerPolicy: {
    policy: 'same-origin'
  }
}))

if (environment !== 'production') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('tiny'))
  app.use(rateLimiter)
}

app.use(`/${API_VERSION}`, routes(router))

app.listen(`${stage.port}`, () => {
  logger.log('info', `API running on :${stage.port}`)
})

module.exports = app
