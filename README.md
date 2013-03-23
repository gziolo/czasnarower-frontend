czasnarower-frontend 0.2.0 [![Build Status](https://travis-ci.org/gziolo/czasnarower-frontend.png?branch=master)](https://travis-ci.org/gziolo/czasnarower-frontend)
====================

Frontend for Czas na rower!

## Getting started

### Requirements

1. [Node 0.8.22](http://blog.nodejs.org/2013/03/06/node-v0-8-22-stable/).
2. [grunt-cli](https://github.com/gruntjs/grunt-cli): run `npm install -g grunt-cli` if needed.
3. [bower](http://twitter.github.com/bower/): run `npm install -g bower` if needed.

### Building distribution version

1. Run `npm install` to install build dependencies.
2. Run `bower install` to install lib dependencies.
3. Run `grunt build` and js, css and images will be placed in `dist/frontend/`.

#### Windows installation

Remember to set Git and Node path in environment variable %PATH%.

### How to run tests

#### Browser

Run `grunt`. Then visit `http://localhost:8899/spec/`.

#### CLI

Run `npm test`.

## Copyright and license

Copyright (c) 2013 Czas na Rower http://www.czasnarower.pl.

czasnarower-frontend is distributed under the MIT License.
