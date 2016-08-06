const path = require('path')
const LOG_PREFIX = `"${path.basename(__filename)}":`
const log = require('../logger')
const verbose = log.verbose.bind(log, LOG_PREFIX)

import bookshelf from 'bookshelf'
import diehard from 'diehard'
import knex from 'knex'
import knexConfiguration from './knex'

const repository = bookshelf(knex(knexConfiguration))

repository.plugin('visibility')

diehard.register(done => {
  verbose('Shutting down postgres connection.')
  repository.knex.destroy(() => {
    verbose('Postgres connection shutdown successfully.')
    done()
  })
})

export default repository
