import {Factory} from 'factory-girl'
import BookshelfAdapter from 'factory-girl-bookshelf'
import Chance from 'chance'
import user from './factories/user'
import 'should'

const chance = new Chance()

BookshelfAdapter.prototype.build = (Model, props) => {
  return new Model(props)
}

BookshelfAdapter.prototype.save = (doc, Model, cb) => {
  const options = {method: 'insert'}
  return doc.save({}, options).nodeify(cb)
}

BookshelfAdapter.prototype.destroy = (doc, Model, cb) => {
  if (!doc.id) {
    return process.nextTick(cb)
  }
  return doc.destroy().nodeify(cb)
}

export default () => {
  const factory = new Factory()

  factory.setAdapter(new BookshelfAdapter())
  factory.chance = chance

  user(factory)

  return factory.promisify(Promise)
}
