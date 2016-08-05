import Chance from 'chance'
import config from '../../src/config'
import fs from 'fs'
import Factory from '../factory'
import jwt from 'jsonwebtoken'
import path from 'path'
import Promise from 'bluebird'
import Request from './request'
import should from 'should'

const chance = Chance()
const factory = Factory()
const shared = {}

let request

describe('Files route', () => {
  before(() => {
    return Promise.resolve(Request)
      .then(req => {
        request = req
      })
      // .then(() => {
      // return factory.create('user');
      // })
      .then(user => {
        // shared.user = user;
        config.authPublicKey = fs.readFileSync(path.join(__dirname, '/../keys/public_key.pem'))
        shared.token = `Bearer ${jwt.sign(user.toJSON(), fs.readFileSync(path.join(__dirname, '/../keys/private_key.pem')), {
          algorithm: 'RS256',
          issuer: 'urn:home-automation/login',
          audience: 'urn:home-automation/*',
          subject: chance.email(),
          expiresIn: config.tokenExpirationInMinutes * 60
        })}`
      })
  })

  after(() => {
    return factory.cleanup()
  })

  it('/login + http should get 302 to https', () => {
    return request
      .get('/')
      .set('Accept', 'application/json')
      .send()
      .expect(302)
      .then(res => {
        res.headers.location.should.startWith('https://')
      })
  })

  it('/login +https -token should get 200', () => {
    return request
      .get('/')
      .set('Accept', 'application/json')
      .set('x-forwarded-proto', 'https')
      .send()
      .expect(200)
      .then(res => {
        should.not.exist(res.headers.location)
      })
  })

  it('/login -https +token should get 302 to https', () => {
    return request
      .get('/')
      .set('Accept', 'application/json')
      .set('authorization', shared.token)
      .send()
      .expect(302)
      .then(res => {
        res.headers.location.should.startWith('https://')
      })
  })

  it('/login +https +token should get 200', () => {
    return request
      .get('/')
      .set('Accept', 'application/json')
      .set('authorization', shared.token)
      .set('x-forwarded-proto', 'https')
      .send()
      .expect(200)
      .then(res => {
        should.not.exist(res.headers.location)
      })
  })
})
