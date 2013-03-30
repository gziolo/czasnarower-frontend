/*global define mocha */
var should;

define([ 'chai', 'sinonChai' ], function(chai, sinonChai) {
  window.chai = chai;
  window.expect = chai.expect;
  window.assert = chai.assert;
  window.should = chai.should();
  window.sinonChai = sinonChai;
  window.notrack = true;

  chai.use(sinonChai);
  mocha.setup('bdd');

  require([ 'backbone', 'bootstrap_plugins', 'flight', 'text', 'moment_pl', 'spec/js/app_spec' ], function() {
    mocha.run();
  });
});
