const jwt = require('jsonwebtoken')
const config = require('../config/config')
const logger = require('../config/logger')

const validateToken = (req, res, next) => {
  let status = 200
  const authorizationHeader = req.headers.authorization
  let result
  if (authorizationHeader) {
    const token = req.headers.authorization.split(' ')[1] // Bearer <token>
    const options = {
      expiresIn: '1d',
      issuer: config.tokenIssuer
    }
    try {
      result = jwt.verify(token, process.env.JWT_SECRET, options)
      if (result.active) {
        req.decoded = result
        next()
      } else {
        status = 401
        logger.log('error', `Status ${status} for validateToken: Inactivate account.`)
        res.status(status).send({
          success: false,
          message: 'Your account is inactive. Please contact support to activate it.'
        })
      }
    } catch (err) {
      status = 400
      logger.log('error', 'Error while verifying JWT')
      logger.log('error', err.message)
      res.status(status).send({
        success: false,
        message: 'Authentication error. Token is invalid.'
      })
    }
  } else {
    status = 401
    logger.log('error', `Status ${status} for validateToken: Missing authorization header`)
    res.status(status).send({
      success: false,
      message: 'Authentication error. Token required.'
    })
  }
}

module.exports = validateToken
