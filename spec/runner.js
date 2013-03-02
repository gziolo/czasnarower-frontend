/*global define mocha */
var should;

require.config({
  baseUrl: '../',
  enforceDefine : true,
  paths: {
    chai: 'node_modules/chai/chai',
    sinonChai:'node_modules/sinon-chai/lib/sinon-chai',
    jquery : 'components/jquery/jquery',
    jquery_migrate: 'components/jquery/jquery-migrate'
  },
  shim: {
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
