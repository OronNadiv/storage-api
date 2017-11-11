import express from '../../src/initializations/express'
import supertest from 'supertest'
import Promise from 'bluebird'

export default Promise
  .try(express.initialize)
  .get('express')
  .then(supertest)
