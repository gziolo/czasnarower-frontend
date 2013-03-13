/*global define mocha */
var should;

require.config({
  baseUrl: '../',
  enforceDefine : true,
  paths: {
    chai: 'node_modules/chai/chai',
    sinonChai:'node_modules/sinon-chai/lib/sinon-chai',
    aura : 'components/aura/lib',
    eventemitter : 'components/eventemitter2/lib/eventemitter2',
    jquery : 'components/jquery/jquery',
    jquery_migrate: 'components/jquery/jquery-migrate',
    text : 'components/requirejs-text/text',
    underscore: 'components/underscore/underscore'
  },
  shim: {
    'lib/main' : {
      deps : ['jquery_migrate']
    },
    jquery_migrate : {
      deps : ['jquery'],
      exports : 'jQuery.migrateWarnings'
    }
  } 
});

define(['chai', 'sinonChai'], function (chai, sinonChai) {
  window.chai = chai;
  window.expect = chai.expect;
  window.assert = chai.assert;
  window.should = chai.should();
  window.sinonChai = sinonChai;
  window.notrack = true;

  chai.use(sinonChai);
  mocha.setup('bdd');

  require([
    'spec/lib/main_spec'
  ], function () {
    mocha.run();
  });
});
