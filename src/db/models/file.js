const verbose = require('debug')('ha:db:models:file:verbose')

import {createClient} from 'redis'
import aws from 'aws-sdk'
import bookshelf from '../bookshelf'
import config from '../../config'
import emitter from 'socket.io-emitter'
import Promise from 'bluebird'
import uuid from 'uuid'

aws.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey
})

const s3 = Promise.promisifyAll(new aws.S3())

export default bookshelf.Model.extend({
  tableName: 'files',
  hasTimestamps: true,
  hidden: ['bucket', 'key'],

  initialize () {
    this.on('creating', model => {
      const bucket = 'nadiv-home-automation'
      const key = `${model.get('group_id')}_${uuid.v4().replace(/\-/g)}_${model.get('name')}`

      // Documentation: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
      return s3.uploadAsync({
        Bucket: bucket,
        Key: key,
        Body: model.get('read_stream')
      })
        .then(() => {
          model.set('bucket', bucket)
          model.set('key', key)
          delete model.attributes.read_stream
        })
    })
    this.on('created', (model, attrs, options) => {
      let client = createClient(config.redisUrl)

      return Promise
        .try(() => {
          verbose('sending message to client. group_id:', options.by.group_id)

          const io = emitter(client)
          io.of(`/${options.by.group_id}-trusted`).to('storage').emit('FILE_CREATED', model.toJSON())
        })
        .finally(() => {
          if (client) {
            client.quit()
            client = null
          }
        })
    })
  },

  getReadStream () {
    const bucket = this.get('bucket')
    const key = this.get('key')

    return s3.getObject({Bucket: bucket, Key: key}).createReadStream()
  }
})
