#### DEPRECATED.  Merged with [Camera-api][camera-url]  

# Home Automation - Storage API
Back-end server that manages [Amazon AWS][aws-url] S3 storage. It provides api to store and fetch the camera photos.

[![JavaScript Style Guide][standard-image]][standard-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![DevDependencies][dependencies-dev-image]][dependencies-dev-url]

I suggest you first [read][overview-url] about the different components of the home automation application.  
This will help you understand better the general architecture and different functions of the system.

## Installation instructions
Click [here][server-installation-instruction-url] and follow the installation instructions for the server micro-service, before moving to the next step.

## Environment variables (configuration)

__AUTH\_PUBLIC\_KEY__ (required): content of auth server's publickey.  
__AWS\_ACCESS\_KEY\_ID__ (required): [AWS][aws-url] S3 credentials to store images taken by the cameras.  
__AWS\_SECRET\_ACCESS\_KEY__ (required): [AWS][aws-url] S3 credentials to store images taken by the cameras.  
__DATABASE\_URL__ (required):  url to postgres database.  Default: `postgres://postgres:@localhost/home_automation`  
__LOGIN\_URL__ (required): url to the [authentication][auth-url] server. Default: if NODE_ENV = `production` => `none`, otherwise: `http://localhost:3001`  
__NODE\_ENV__ (required): set up the running environment.  Default: `production`.  `production` will enforce encryption using SSL and other security mechanisms.  
__PORT__ (required): server's port.  default: `3002`  
__POSTGRESPOOLMIN__ (required): postgres pool minimum size.  Default: `2`  
__POSTGRESPOOLMAX__ (required): postgres pool maximum size.  Default: `10`  
__POSTGRESPOOLLOG__ (required): postgres pool log. Values: `true`/`false`. Default: `true`  
__PRIVATE\_KEY__ (required): Generated private key.  Public key should be shared with the [authentication][auth-url] server. See [here][private-public-keys-url].  
__UI\_URL__ (required): url to the [UI][ui-url] server. Default: if NODE_ENV = `production` => `none`, otherwise: `http://localhost:3000`

### License
[AGPL-3.0](https://spdx.org/licenses/AGPL-3.0.html)

### Author
[Oron Nadiv](https://github.com/OronNadiv) ([oron@nadiv.us](mailto:oron@nadiv.us))

[dependencies-image]: https://david-dm.org/OronNadiv/storage-api/status.svg
[dependencies-url]: https://david-dm.org/OronNadiv/storage-api
[dependencies-dev-image]: https://david-dm.org/OronNadiv/storage-api/dev-status.svg
[dependencies-dev-url]: https://david-dm.org/OronNadiv/storage-api?type=dev
[travis-image]: http://img.shields.io/travis/OronNadiv/storage-api.svg?style=flat-square
[travis-url]: https://travis-ci.org/OronNadiv/storage-api
[coveralls-image]: http://img.shields.io/coveralls/OronNadiv/storage-api.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/OronNadiv/storage-api
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com

[aws-url]: https://aws.amazon.com/

[overview-url]: https://oronnadiv.github.io/home-automation
[client-installation-instruction-url]: https://oronnadiv.github.io/home-automation/#installation-instructions-for-the-raspberry-pi-clients
[server-installation-instruction-url]: https://oronnadiv.github.io/home-automation/#installation-instructions-for-the-server-micro-services
[private-public-keys-url]: https://oronnadiv.github.io/home-automation/#generating-private-and-public-keys

[alarm-url]: https://github.com/OronNadiv/alarm-system-api
[auth-url]: https://github.com/OronNadiv/authentication-api
[camera-url]: https://github.com/OronNadiv/camera-api
[garage-url]: https://github.com/OronNadiv/garage-door-api
[notifications-url]: https://github.com/OronNadiv/notifications-api
[storage-url]: https://github.com/OronNadiv/storage-api
[ui-url]: https://github.com/OronNadiv/home-automation-ui
