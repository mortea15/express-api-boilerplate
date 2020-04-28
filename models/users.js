const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const environment = process.env.NODE_ENV
const stage = require('../config/config')[environment]
const logger = require('../config/logger')

const Schema = mongoose.Schema

const userSchema = new Schema({
  username: {
    type: 'String',
    required: true,
    unique: true
  },
  password: {
    type: 'String',
    required: true,
    trim: true
  },
  active: {
    type: 'Boolean',
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  admin: {
    type: 'Boolean',
    default: false
  }
})

userSchema.pre('save', function (next) {
  const user = this
  if (!user.isModified || !user.isNew) {
    next()
  } else {
    bcrypt.hash(user.password, stage.saltingRounds, function (err, hash) {
      if (err) {
        logger.log('error', `Error hashing password for user ${user.email}`)
        next(err)
      } else {
        user.password = hash
        next()
      }
    })
  }
})

module.exports = mongoose.model('User', userSchema) // instance of schema
