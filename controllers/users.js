'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const addrs = require('email-addresses')

const logger = require('../config/logger')
const User = require('../models/users')
const config = require('../config/config')
const connUri = config.dbString

const ERR_PREFIX = 'An error occurred while'

module.exports = {
  add: (req, res) => {
    const result = {}
    let status = 200
    const email = req.sanitize(req.body.email)
    const password = req.sanitize(req.body.password)

    const valid = addrs.parseOneAddress(email)

    if (valid) {
      mongoose.connect(connUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        .then(() => {
          const user = new User({ email, password })
          user.save()
            .then((user) => {
              status = 201
              result.status = status
              result.success = true
              result.result = user
              res.status(status).send(result)
              mongoose.connection.close()
            })
            .catch((err) => {
              status = 500
              result.status = status
              result.success = false
              if (process.env.NODE_ENV !== 'production') {
                result.error = err
              } else if (err.code === 11000) {
                status = 409
                result.status = status
                result.error = 'A user by that email already exists.'
              } else {
                result.error = `${ERR_PREFIX} creating the user in the DB.`
              }
              logger.log('error', `Status ${status} for users.add`)
              const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
              if (msg) { logger.log('error', msg) }
              res.status(status).send(result)
              mongoose.connection.close()
            })
        })
        .catch((err) => {
          status = 502
          result.status = status
          result.success = false
          if (process.env.NODE_ENV !== 'production') {
            result.error = err
          } else {
            result.error = `${ERR_PREFIX} connecting to the DB.`
          }
          logger.log('error', `Status ${status} for users.add`)
          const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
          if (msg) { logger.log('error', msg) }
          res.status(status).send(result)
          mongoose.connection.close()
        })
    } else {
      status = 400
      result.status = status
      result.success = false
      result.error = 'Not a valid email address.'
      res.status(status).send(result)
      mongoose.connection.close()
    }
  },

  login: (req, res) => {
    const result = {}
    let status = 200
    const email = req.sanitize(req.body.email)
    const password = req.sanitize(req.body.password)

    const valid = addrs.parseOneAddress(email)

    if (valid) {
      mongoose.connect(connUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        .then(() => {
          User.findOne({ email: email })
            .then((user) => {
              if (user) {
                if (user.active) {
                  bcrypt.compare(password, user.password)
                    .then(match => {
                      if (match) {
                        const payload = { email: user.email, active: user.active, admin: user.admin }
                        const options = { expiresIn: '1d', issuer: config.tokenIssuer }
                        const secret = process.env.JWT_SECRET
                        const token = jwt.sign(payload, secret, options)

                        result.token = token
                        result.status = status
                        result.success = true
                        user = user.toObject()
                        delete user.password
                        result.result = user
                      } else {
                        status = 401
                        result.status = status
                        result.success = false
                        result.error = 'Invalid credentials'
                      }
                      res.status(status).send(result)
                      mongoose.connection.close()
                    }).catch(err => {
                      status = 500
                      result.status = status
                      result.success = false
                      result.error = `${ERR_PREFIX} authenticating the user`
                      logger.log('error', `Status ${status} for users.login`)
                      const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
                      if (msg) { logger.log('error', msg) }
                      res.status(status).send(result)
                      mongoose.connection.close()
                    })
                } else {
                  status = 403
                  result.status = status
                  result.success = false
                  result.error = 'The account needs to be activated. Please contact support.'
                  logger.log('debug', `Status ${status} for users.login (account inactive)`)
                  res.status(status).send(result)
                  mongoose.connection.close()
                }
              } else {
                status = 401
                result.status = status
                result.success = false
                result.error = 'Invalid credentials'
                res.status(status).send(result)
                mongoose.connection.close()
              }
            })
            .catch((err) => {
              status = 500
              result.status = status
              result.error = `${ERR_PREFIX} authenticating the user`
              logger.log('error', `Status ${status} for users.login`)
              const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
              if (msg) { logger.log('error', msg) }
              res.status(status).send(result)
              mongoose.connection.close()
            })
        })
        .catch((err) => {
          status = 500
          result.status = status
          result.success = false
          if (process.env.NODE_ENV !== 'production') {
            result.error = err
          } else {
            result.error = `${ERR_PREFIX} connecting to the DB.`
          }
          logger.log('error', `Status ${status} for users.login (DB error)`)
          const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
          if (msg) { logger.log('error', msg) }
          res.status(status).send(result)
          mongoose.connection.close()
        })
    } else {
      status = 400
      result.status = status
      result.success = false
      result.error = 'Not a valid email address.'
      res.status(status).send(result)
      mongoose.connection.close()
    }
  },

  getAll: (req, res) => {
    const result = {}
    let status = 200

    mongoose.connect(connUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
      .then(() => {
        const payload = req.decoded
        if (payload) {
          User.find({}, '-password')
            .then((users) => {
              result.status = status
              result.success = true
              result.result = users
              res.status(status).send(result)
              mongoose.connection.close()
            })
            .catch((err) => {
              status = 500
              result.status = status
              result.success = false
              if (process.env.NODE_ENV !== 'production') {
                result.error = err
              } else {
                result.error = `${ERR_PREFIX} fetching the users.`
              }
              logger.log('error', `Status ${status} for users.getAll`)
              const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
              if (msg) { logger.log('error', msg) }
              res.status(status).send(result)
              mongoose.connection.close()
            })
        } else {
          status = 401
          result.status = status
          result.success = false
          result.error = 'Not authenticated'
          logger.log('error', `Status ${status} for users.getAll (no token found)`)
          res.status(status).send(result)
          mongoose.connection.close()
        }
      })
      .catch((err) => {
        status = 500
        result.status = status
        result.success = false
        if (process.env.NODE_ENV !== 'production') {
          result.error = err
        } else {
          result.error = `${ERR_PREFIX} connecting to the DB.`
        }
        logger.log('error', `Status ${status} for users.getAll (DB conn err)`)
        const msg = err.errmsg ? err.errmsg : err.message ? err.message : null
        if (msg) { logger.log('error', msg) }
        res.status(status).send(result)
      })
  }
}
