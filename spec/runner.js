var expect, assert, should;

define([ 'chai', 'sinonChai' ], function(chai, sinonChai) {
  window.chai = chai;
  window.sinonChai = sinonChai;
  window.notrack = true;

  expect = chai.expect;
  assert = chai.assert;
  should = chai.should();
  
  chai.use(sinonChai);
  mocha.setup('bdd');

  require([ 'backbone', 'bootstrap_plugins', 'flight', 'text', 'moment_pl', 'spec/js/app_spec' ], function() {
    mocha.run();
  });
});
