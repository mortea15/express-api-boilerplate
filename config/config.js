'use strict'
module.exports = {
  development: {
    port: process.env.PORT || 3000,
    saltingRounds: 10
  },
  production: {
    port: process.env.PORT || 8080,
    saltingRounds: 10
  },
  tokenIssuer: process.env.JWT_ISSUER,
  dbString: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`,
  API_VERSION: process.env.API_VERSION || 'v1'
}
