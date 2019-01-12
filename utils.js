const jwt = require('jsonwebtoken')
const config = require('./config')
const logger = require('./helpers/logger')

module.exports = {
  validateToken: (req, res, next) => {
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
          const status = 401
          res.status(status).send({
            success: false,
            message: 'Your account is deactivated. Please contact support to activate it.'
          })
          logger.log('error', `Status ${status} for validateToken: Deactivated account.`)
        }
      } catch (err) {
        logger.log('error', `Error while verifying JWT`)
        throw new Error(err)
      }
    } else {
      const status = 401
      res.status(status).send({
        success: false,
        message: `Authentication error. Token required.`
      })
      logger.log('error', `Status ${status} for validateToken: Missing authorization header`)
    }
  }
}
