/*global define mocha */
var should;

require.config({
  baseUrl : '../',
  enforceDefine : true,
  paths : {
    chai : 'node_modules/chai/chai',
    sinonChai : 'node_modules/sinon-chai/lib/sinon-chai',
    aura : 'components/aura/lib',
    backbone : 'components/backbone/backbone',
    bootstrap : 'components/bootstrap/docs/assets/js/bootstrap',
    eventemitter : 'components/eventemitter2/lib/eventemitter2',
    jquery : 'components/jquery/jquery',
    jquery_migrate : 'components/jquery/jquery-migrate',
    text : 'components/requirejs-text/text',
    underscore : 'components/underscore/underscore'
  },
  shim : {
    'app/app' : {
      deps : [ 'jquery_migrate', 'bootstrap', 'backbone' ]
    },
    backbone : {
      deps : [ 'underscore', 'jquery' ],
      exports : 'Backbone'
    },
    bootstrap : {
      deps : [ 'jquery' ],
      exports : '$.fn.affix'
    },
    jquery_migrate : {
      deps : [ 'jquery' ],
      exports : 'jQuery.migrateWarnings'
    },
    underscore : {
      exports : '_'
    }
  }
});

define([ 'chai', 'sinonChai' ], function(chai, sinonChai) {
  window.chai = chai;
  window.expect = chai.expect;
  window.assert = chai.assert;
  window.should = chai.should();
  window.sinonChai = sinonChai;
  window.notrack = true;

  chai.use(sinonChai);
  mocha.setup('bdd');

  require([ 'spec/app/app_spec' ], function() {
    mocha.run();
  });
});
