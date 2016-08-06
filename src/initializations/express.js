const path = require('path')
const LOG_PREFIX = `"${path.basename(__filename)}":`
const log = require('../logger')
const verbose = log.verbose.bind(log, LOG_PREFIX)
const info = log.info.bind(log, LOG_PREFIX)
const error = log.error.bind(log, LOG_PREFIX)

import authToken from './../middleware/auth_token'
import bodyParser from 'body-parser'
import config from './../config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import diehard from 'diehard'
import express from 'express'
import files from './../routes/files'
import ping from './../middleware/ping'
import Promise from 'bluebird'
import redirectToHttps from './../middleware/redirect_to_https'
import xHeaders from './../middleware/x_headers'

const app = express()

export default {
  initialize () {
    return new Promise(resolve => {
      app.use('/ping', ping)
      app.use(cors({
        origin: config.uiUrl,
        credentials: true,
        exposedHeaders: ['X-Total-Count'],
        maxAge: 10 * 60
      }))
      app.use(redirectToHttps)
      app.use(bodyParser.json())
      app.use(bodyParser.urlencoded({extended: true}))
      app.use(cookieParser())
      app.use(authToken)
      app.use(xHeaders)

      app.use(files())

      app.use((err, req, res) => {
        if (!(err instanceof Error)) {
          // req is actually res.
          error('unknown request.  See logs for more details.')
          return req.sendStatus(404)
        }
        error('sending Error.  Err: ', err)
        return res.sendStatus(err.status || 500)
      })

      const server = app.listen(config.port, () => {
        info('Express server listening on port', server.address().port)

        diehard.register(done => {
          verbose('Shutting down http server')
          server.close(() => {
            verbose('Http server was shutdown successfully.')
            done()
          })
        })

        resolve({server: server, express: app})
      })
    })
  }
}
