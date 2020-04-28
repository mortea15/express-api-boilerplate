const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const logger = require('../config/logger')
const User = require('../models/users')
const config = require('../config/config')
const connUri = config.dbString

const ERR_PREFIX = 'An error occurred while'

module.exports = {
  add: (req, res) => {
    const email = req.sanitize(req.body.email)
    const password = req.sanitize(req.body.password)

    mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
      const result = {}
      let status = 201
      if (!err) {
        const user = new User({ email, password })
        user.save((err, user) => {
          if (!err) {
            result.status = status
            result.result = user
          } else {
            status = 500
            result.status = status
            if (process.env.NODE_ENV !== 'production') {
              result.error = err
            } else {
              result.error = `${ERR_PREFIX} creating the user in the DB.`
            }
            logger.log('error', `Status ${status} for users.add`)
            const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
            if (msg) { logger.log('error', msg) }
          }
          res.status(status).send(result)
        })
      } else {
        status = 502
        result.status = status
        if (process.env.NODE_ENV !== 'production') {
          result.error = err
        } else {
          result.error = `${ERR_PREFIX} connecting to the DB.`
        }
        logger.log('error', `Status ${status} for users.add`)
        const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
        if (msg) { logger.log('error', msg) }
        res.status(status).send(result)
      }
    })
  },

  login: (req, res) => {
    const email = req.sanitize(req.body.email)
    const password = req.sanitize(req.body.password)

    mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
      const result = {}
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
                    result.error = 'Invalid credentials'
                  }
                  res.status(status).send(result)
                }).catch(err => {
                  status = 500
                  result.status = status
                  result.error = `${ERR_PREFIX} authenticating the user`
                  logger.log('error', `Status ${status} for users.login`)
                  const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
                  if (msg) { logger.log('error', msg) }
                  res.status(status).send(result)
                })
            } else {
              status = 403
              result.status = status
              result.error = 'The account needs to be activated. Please contact support.'
              logger.log('debug', `Status ${status} for users.login (account inactive)`)
              res.status(status).send(result)
            }
          } else {
            if (!err) {
              status = 401
              result.status = status
              result.error = 'Invalid credentials'
              res.status(status).send(result)
            } else {
              status = 500
              result.status = status
              result.error = `${ERR_PREFIX} authenticating the user`
              logger.log('error', `Status ${status} for users.login`)
              const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
              if (msg) { logger.log('error', msg) }
              res.status(status).send(result)
            }
          }
        })
      } else {
        status = 500
        result.status = status
        if (process.env.NODE_ENV !== 'production') {
          result.error = err
        } else {
          result.error = `${ERR_PREFIX} connecting to the DB.`
        }
        logger.log('error', `Status ${status} for users.login (DB error)`)
        const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
        if (msg) { logger.log('error', msg) }
        res.status(status).send(result)
      }
    })
  },

  getAll: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
      const result = {}
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
              if (process.env.NODE_ENV !== 'production') {
                result.error = err
              } else {
                result.error = `${ERR_PREFIX} fetching the users.`
              }
              logger.log('error', `Status ${status} for users.getAll`)
              const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
              if (msg) { logger.log('error', msg) }
            }
            res.status(status).send(result)
          })
        } else {
          status = 401
          result.status = status
          result.error = 'Not authenticated'
          logger.log('error', `Status ${status} for users.getAll (no token found)`)
          res.status(status).send(result)
        }
      } else {
        status = 500
        result.status = status
        if (process.env.NODE_ENV !== 'production') {
          result.error = err
        } else {
          result.error = `${ERR_PREFIX} connecting to the DB.`
        }
        logger.log('error', `Status ${status} for users.getAll (DB conn err)`)
        const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
        if (msg) { logger.log('error', msg) }
        res.status(status).send(result)
      }
    })
  }
}
