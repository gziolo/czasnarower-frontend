var expect, assert, should;

define([ 'chai', 'sinonChai' ], function (chai, sinonChai) {
  window.chai = chai;
  window.sinonChai = sinonChai;
  window.notrack = true;

  expect = chai.expect;
  assert = chai.assert;
  should = chai.should();

  chai.use(sinonChai);
  mocha.setup('bdd');
  mocha.setup('mocha-flight');

  require([ 'backbone', 'bootstrap_plugins', 'flight_index', 'text', 'moment_pl', 'spec/js/mixins/index_spec', 'spec/js/components/index_spec' ], function () {
    mocha.run();
  });
});
