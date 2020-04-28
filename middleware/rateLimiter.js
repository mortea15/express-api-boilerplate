const { RateLimiterRedis } = require('rate-limiter-flexible')
const Redis = require('ioredis')
const redisClient = new Redis({ enableOfflineQueue: false })

const API_VERSION = require('../config/config').API_VERSION

const points = {
  default: 10,
  auth: 5
}

// Ratelimiter for general requests
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: points.default, // Number of points
  duration: 30, // Per n seconds
  blockDuration: 60
})

// Authentication (login)
// 5 requests over a period of 3600s (1h)
// blocked for 1h if points are exhausted
const rateLimiterAuth = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'auth',
  points: points.auth, // Number of points
  duration: 3600, // Per n seconds
  blockDuration: 3600
})

const rateLimiterMiddleware = (req, res, next) => {
  if (req.path.indexOf(`/${API_VERSION}/auth`) === 0) {
    rateLimiterAuth.consume(req.ip, 1)
      .then((rateLimiterRes) => {
        res.set({
          'Retry-After': rateLimiterRes.msBeforeNext / 1000,
          'X-RateLimit-Limit': points.auth,
          'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
          'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext)
        })
        next()
      })
      .catch((rateLimiterRes) => {
        res.set({
          'Retry-After': rateLimiterRes.msBeforeNext / 1000,
          'X-RateLimit-Limit': points.auth,
          'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
          'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext)
        })
        res.status(429).send('Too many requests.')
      })
  } else {
    rateLimiter.consume(req.ip, 1)
      .then((rateLimiterRes) => {
        res.set({
          'Retry-After': rateLimiterRes.msBeforeNext / 1000,
          'X-RateLimit-Limit': points.default,
          'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
          'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext)
        })
        next()
      })
      .catch((rateLimiterRes) => {
        res.set({
          'Retry-After': rateLimiterRes.msBeforeNext / 1000,
          'X-RateLimit-Limit': points.default,
          'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
          'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext)
        })
        res.status(429).send('Too many requests.')
      })
  }
}

module.exports = rateLimiterMiddleware
