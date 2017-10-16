import aws from 'aws-sdk'
import bookshelf from '../bookshelf'
import config from '../../config'
import Promise from 'bluebird'
import uuid from 'uuid'

const JWTGenerator = require('jwt-generator')
const jwtGenerator = new JWTGenerator({
  loginUrl: config.loginUrl,
  privateKey: config.privateKey,
  useRetry: false,
  issuer: 'urn:home-automation/storage'
})
const {publish} = require('home-automation-pubnub').Publisher

const verbose = require('debug')('ha:db:models:file:verbose')

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
      const key = `${model.get('group_id')}_${uuid.v4().replace(/-/g)}_${model.get('name')}`

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
      verbose('sending message to client. group_id:', options.by.group_id)

      return Promise
        .resolve(jwtGenerator.makeToken({
          subject: `File created for group ${options.by.group_id}`,
          audience: 'urn:home-automation/alarm',
          payload: options.by
        }))
        .then((token) => {
          return publish({
            groupId: options.by.group_id,
            isTrusted: true,
            system: 'STORAGE',
            type: 'FILE_CREATED',
            payload: model.toJSON(),
            token,
            uuid: 'storage-api'
          })
        })
    })
  },

  getReadStream () {
    const bucket = this.get('bucket')
    const key = this.get('key')

    return s3.getObject({Bucket: bucket, Key: key}).createReadStream()
  }
})
