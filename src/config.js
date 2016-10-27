const error = require('debug')('ha:config:error')

import fs from 'fs'
import knexPgCustomSchema from 'knex-pg-customschema'
import path from 'path'

const config = {production: process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() === 'PRODUCTION'}

config.authPublicKey = process.env.AUTH_PUBLIC_KEY || (config.production ? null : fs.readFileSync(path.join(__dirname, '../test/keys/public_key.pem')))
if (!config.authPublicKey) {
  error(
    'Login public key could not be found in the environment variable.  Please set \'AUTH_PUBLIC_KEY\'.'
  )
  process.exit(1)
}

config.aws = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

if (!config.aws.accessKeyId) {
  error(
    'AWS access key id could not be found in the environment variable.  Please set \'AWS_ACCESS_KEY_ID\'.'
  )
  process.exit(1)
}

if (!config.aws.secretAccessKey) {
  error(
    'AWS secret access key could not be found in the environment variable.  Please set \'AWS_SECRET_ACCESS_KEY\'.'
  )
  process.exit(1)
}

config.port = process.env.PORT || 3006

config.postgres = process.env.DATABASE_URL || 'postgres://postgres:@localhost/home_automation'
config.postgresPool = {
  min: parseInt(process.env.POSTGRESPOOLMIN || 2, 10),
  max: parseInt(process.env.POSTGRESPOOLMAX || 10, 10),
  log: process.env.POSTGRESPOOLLOG === 'true',
  afterCreate: knexPgCustomSchema('storage')
}

config.redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL || (config.production ? null : 'redis://localhost:6379')
if (!config.redisUrl) {
  error(
    'Redis URL could not be found in the environment variable.  Please set \'REDIS_URL\'.'
  )
  process.exit(1)
}

config.skipSSL = process.env.SKIP_SSL && process.env.SKIP_SSL.toUpperCase() === 'TRUE'

config.uiUrl = process.env.UI_URL || 'http://localhost:3000'
if (!config.uiUrl) {
  error(
    'Login URL could not be found in the environment variable.  Please set \'UI_URL\'.'
  )
  process.exit(1)
}

export default config
