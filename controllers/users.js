const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const logger = require('../helpers/logger')
const User = require('../schemas/users')
const config = require('../config')
const connUri = config.dbString

module.exports = {
  add: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
      let result = {}
      let status = 201
      if (!err) {
        const email = req.sanitize(req.body.email)
        const password = req.sanitize(req.body.password)

        const user = new User({ email, password })
        user.save((err, user) => {
          if (!err) {
            result.status = status
            result.result = user
          } else {
            status = 500
            result.status = status
            result.error = err
            logger.log('error', `Status ${status} for users.add`)
          }
          res.status(status).send(result)
        })
      } else {
        status = 500
        result.status = status
        result.error = err
        res.status(status).send(result)
        logger.log('error', `Status ${status} for users.add`)
      }
    })
  },

  login: (req, res) => {
    const email = req.sanitize(req.body.email)
    const password = req.sanitize(req.body.password)

    mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
      let result = {}
      let status = 200
      if (!err) {
        User.findOne({ email: email }, (err, user) => {
          if (!err && user) {
            if (user.active) {
              bcrypt.compare(password, user.password)
                .then(match => {
                  if (match) {
                    status = 200
                    const payload = { email: user.email, active: user.active, admin: user.admin }
                    const options = { expiresIn: '1d', issuer: config.tokenIssuer }
                    const secret = process.env.JWT_SECRET
                    const token = jwt.sign(payload, secret, options)

                    result.token = token
                    result.status = status
                    user = user.toObject()
                    delete user.password
                    result.result = user
                  } else {
                    status = 401
                    result.status = status
                    result.error = `Authentication error`
                    logger.log('error', `Status ${status} for users.login`)
                  }
                  res.status(status).send(result)
                }).catch(err => {
                  status = 500
                  result.status = status
                  result.error = 'An error occurred while authenticating the user'
                  res.status(status).send(result)
                  logger.log('error', `Status ${status} for users.login`)
                })
            } else {
              status = 401
              result.status = status
              result.error = 'The account needs to be activated. Please contact support.'
              res.status(status).send(result)
              logger.log('error', `Status ${status} for users.login`)
            }
          } else {
            status = 404
            result.status = status
            result.error = 'Invalid credentials'
            res.status(status).send(result)
            logger.log('error', `Status ${status} for users.login`)
          }
        })
      } else {
        status = 500
        result.status = status
        result.error = err
        res.status(status).send(result)
        logger.log('error', `Status ${status} for users.login`)
      }
    })
  },

  getAll: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
      let result = {}
      let status = 200
      if (!err) {
        const payload = req.decoded
        if (payload) {
          User.find({}, '-password', (err, users) => {
            if (!err) {
              result.status = status
              result.error = err
              result.result = users
            } else {
              status = 500
              result.status = status
              result.error = err
              logger.log('error', `Status ${status} for users.getAll`)
            }
            res.status(status).send(result)
          })
        } else {
          status = 401
          result.status = status
          result.error = `Authentication error`
          res.status(status).send(result)
          logger.log('error', `Status ${status} for users.getAll`)
        }
      } else {
        status = 500
        result.status = status
        result.error = err
        res.status(status).send(result)
        logger.log('error', `Status ${status} for users.getAll`)
      }
    })
  }
}
