# express-api-boilerplate
A hardened boilerplate for a RESTful API built on Express.js

## Installation and Usage
1. Install npm packages
```
$ npm install
```
2. Requires Redis for Rate Limiting
```
# Run Redis in Docker
$ docker run --name redis -p 6379:6379 -d redis
```
3. Requires MongoDB for storage
- [Run MongoDB in Docker](https://hub.docker.com/_/mongo/#!)
- Or use a provider such as [Mlab](https://mlab.com/) (for sandbox testing)

4. Edit environment variables
- See [list.env.example](/list.env.example) for Docker
- See [vars.env.example](/vars.env.example) for local

## Environment Variables
- JWT_SECRET        <= A **secret** to use for the Json Web Token
- JWT_ISSUER        <= Issuer of the JWT token. E.g. `https://api.donkey.ru`
- MONGO_USERNAME    <= User to access MongoDB
- MONGO_PASSWORD    <= Password to access MongoDB
- MONGO_HOST        <= Host to access MongoDB
- MONGO_PORT        <= Port to access MongoDB
- MONGO_DATABASE    <= Name of the database
- REDIS_HOST        <= Host to access Redis instance (default: `127.0.0.1`)
- REDIS_PORT        <= Port to access Redis instance (default: `6379`)
- REDIS_PASS        <= Password to access Redis instance (default: ``)
- NODE_ENV          <= development | production
- API_VERSION       <= The version of the api, e.g. `v1`. Will be the base path (`/v1`)
- PORT              <= The port to run on (default: `8080`)