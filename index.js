const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const expressSanitizer = require('express-sanitizer')
const compression = require('compression')

const app = express()
const router = express.Router()

const environment = process.env.NODE_ENV
const stage = require('./config')[environment]
const logger = require('./helpers/logger')
const routes = require('./routes/index.js')

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(expressSanitizer())
app.use(compression())
app.use(helmet())
app.use(helmet.frameguard({ action: 'sameorigin' }))

if (environment !== 'production') {
  const morgan = require('morgan')
  app.use(morgan('dev'))
}

app.use('/v1', routes(router))

app.listen(`${stage.port}`, () => {
  logger.log('info', `API running on :${stage.port}`)
})

module.exports = app
