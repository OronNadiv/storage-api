const path = require('path')
const LOG_PREFIX = `"${path.basename(__filename)}":`
const log = require('../logger')
const verbose = log.verbose.bind(log, LOG_PREFIX)
const error = log.error.bind(log, LOG_PREFIX)

import _ from 'underscore'
import {Router} from 'express'
import File from '../db/models/file'
import fs from 'fs'
import Multipart from 'connect-multiparty'
import Promise from 'bluebird'

const multipart = Multipart()
const router = new Router()

export default () => {
  router.get('/files/:file_id', (req, res, next) => {
    if (!req.client.is_trusted) {
      return res.sendStatus(403)
    }

    const options = {by: req.client}

    File.forge()
      .query({
        where: {
          id: req.params.file_id,
          group_id: req.client.group_id,
          is_deleted: false
        }
      })
      .fetch(options)
      .then(file => {
        if (!file) {
          return res.sendStatus(404)
        }

        res.writeHead(200, {
          'Content-disposition': `attachment; filename=${file.get('name')}`
        })

        const readStream = file.getReadStream()

        readStream.pipe(res)
        readStream.on('error', next)
      })
      .catch(next)
  })

  router.get('/files', (req, res, next) => {
    if (!req.client.is_trusted) {
      return res.sendStatus(403)
    }

    res.set('Cache-Control', 'no-store, no-cache')
    res.set('Pragma', 'no-cache')

    verbose('GET /files called.')
    const MAX_LIMIT = 10000
    const options = {by: req.client}
    const order = req.query.order && req.query.order === 'asc' ? req.query.order : 'desc'
    const after = req.query.after ? new Date(req.query.after) : null
    const before = req.query.before ? new Date(req.query.before) : null
    let limit = parseInt(req.query.limit || MAX_LIMIT)

    if (limit < 1 || limit > MAX_LIMIT) {
      limit = MAX_LIMIT
    }
    File.forge()
      .query(qb => {
        qb.where('group_id', '=', options.by.group_id)
        qb.where('is_deleted', '=', false)
        if (before) {
          qb.where('created_at', '<=', before)
        }
        if (after) {
          qb.where('created_at', '>=', after)
        }
        qb.orderBy('created_at', order.toUpperCase())
        qb.limit(limit)
      })
      .fetchAll(options)
      .call('toJSON')
      .then(res.json.bind(res))
      .catch(next)
  })

  router.post('/files', multipart, (req, res, next) => {
    verbose('POST /files called. req.files: ', req.files)

    let readStream

    if (!req.files) {
      return next('File(s) could not be found.')
    }

    Promise.map(_.values(req.files), file => {
      readStream = fs.createReadStream(file.path)
      readStream.on('close', () => {
        fs.unlink(file.path, err =>
            err
              ? error(`Error while calling unlink.  req.files: ${req.files}, file: ${file}, file.path: ${file.path}, err: ${err}`)
              : verbose(`File deleted successfully.  file.path: ${file.path}`)
          )
      })

        // todo: do it in a transaction.
      return File.forge()
          .save({
            name: file.name,
            type: file.type,
            size: file.size,
            group_id: req.client.group_id,
            read_stream: readStream
          }, {by: req.client})
    })
      .then(res.sendStatus.bind(res, 201))
      .catch(next)
  })
  return router
}
