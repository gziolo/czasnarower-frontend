czasnarower-frontend 0.3.0 [![Build Status](https://travis-ci.org/gziolo/czasnarower-frontend.png?branch=master)](https://travis-ci.org/gziolo/czasnarower-frontend)
====================

Frontend for [Czas na rower!](http://www.czasnarower.pl/)

## Getting started

### Requirements

1. [Node 0.10.x](http://nodejs.org/).
2. [grunt-cli](https://github.com/gruntjs/grunt-cli): run `npm install -g grunt-cli` if needed.
3. [bower](http://twitter.github.com/bower/): run `npm install -g bower` if needed.

#### Windows installation

Remember to set Git and Node path in environment variable %PATH%.

### Building distribution version

1. Run `npm install` to install build dependencies.
2. Run `bower install` to install lib dependencies.
3. Run `grunt build` and js, css and images will be placed in `dist/frontend/`.

### Grunt tasks

* Run `grunt spec` to execute JSHint checks and Mocha tests.
* Run `grunt css-development` to generate development version of CSS files and images.
* Run `grunt css-production` to generate production version of CSS files and images.
* Run `grunt js-development` to generate development version of JS files.
* Run `grunt js-production` to generate production version of JS files.
* Run `grunt server` to run local server. Then visit `http://localhost:8899/`.
* Run `grunt build-development` to perform full development build (JS verification, buildind JS, CSS and images).
* Run `grunt build` to perform full production build (JS verification, buildind JS, CSS and images).
* Run `grunt` to perform JavaScript validation and start local server. Then visit `http://localhost:8899/`.

### How to run tests

#### Browser

Run `grunt`. Then visit `http://localhost:8899/spec/`.

#### CLI

Run `npm test`.

## Dependencies

Development dependencies:
* [Grunt](http://gruntjs.com/)
* [Bower](http://twitter.github.com/bower/)
* [Mocha](http://visionmedia.github.com/mocha/)
* [Chai](http://chaijs.com/)
* [Sinon](http://sinonjs.org/)

Code base dependencies: 
* [RequireJS](http://requirejs.org/)
* [json2](https://github.com/douglascrockford/JSON-js)
* [ES5-shim](https://github.com/kriskowal/es5-shim)
* [jQuery](http://jquery.com/)
* [Bootstrap](http://twitter.github.com/bootstrap/)
* [Flight](http://twitter.github.io/flight/)
* [Lo-Dash](http://lodash.com/)
* [Backbone](http://backbonejs.org/)

## Copyright and license

Copyright (c) 2013 Czas na Rower http://www.czasnarower.pl.

czasnarower-frontend is distributed under the MIT License.
