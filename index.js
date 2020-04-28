const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const expressSanitizer = require('express-sanitizer')
const compression = require('compression')
const cors = require('cors')

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
app.use(helmet())
app.use(helmet.frameguard({ action: 'sameorigin' }))
app.use(rateLimiter)

if (environment !== 'production') {
  const morgan = require('morgan')
  app.use(morgan('combined'))
  app.use(cors)
}

app.use(`/${API_VERSION}`, routes(router))

app.listen(`${stage.port}`, () => {
  logger.log('info', `API running on :${stage.port}`)
})

module.exports = app
