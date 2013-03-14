/*global define mocha */
var should;

define([ 'chai', 'sinonChai' ], function(chai, sinonChai) {
  window.chai = chai;
  window.expect = chai.expect;
  window.assert = chai.assert;
  window.should = chai.should();
  window.sinonChai = sinonChai;
  window.notrack = true;
  // TODO: move this global to require.config
  window.sStaticUrl = '';

  chai.use(sinonChai);
  mocha.setup('bdd');

  require([ 'spec/app/app_spec' ], function() {
    mocha.run();
  });
});
