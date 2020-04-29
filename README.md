# express-api-boilerplate
A hardened boilerplate for a RESTful API built on Express.js

## Installation and Basic Usage
1. Install npm packages
```bash
$ npm install
```
2. Requires Redis for Rate Limiting
```bash
# Run Redis in Docker
$ docker run --name redis -p 6379:6379 -d redis
```
3. Requires MongoDB for storage
- [Run MongoDB in Docker](https://hub.docker.com/_/mongo/#!)
- Or use a provider such as [Mlab](https://mlab.com/) (e.g. for sandbox testing)

4. Edit environment variables
- See [list.env.example](/list.env.example) for Docker
- See [vars.env.example](/vars.env.example) for local

```bash
$ cp vars.env.example vars.env
$ vim vars.env
# OR
$ cp list.env.example list.env
$ vim list.env
```

5. Run
```bash
$ source vars.env
$ node index.js
```

or in Docker
```bash
# Build the image
$ docker build -t <IMAGE_NAME:tag> .
# E.g.
$ docker build -t mortea15/express-api:latest .
# Redis
$ docker run --name redis -d redis
# MongoDB (requires additional conf; check mongo docs)
$ docker run --name api-db -d -e MONGO_INITDB_ROOT_USERNAME=<MONGO_USERNAME> -e MONGO_INITDB_ROOT_PASSWORD=<MONGO_PASSWORD> mongo
# Run the container
$ docker run -d --env-file list.env --name api mortea15/express-api:latest
```
where you can specify the `REDIS_HOST` environment variable as `redis` (or whatever name you gave your Redis container), and similarly for `MONGO_HOST`.

or using the [docker-compose.yml](/docker-compose.yml):
```bash
$ docker-compose up -d
```

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