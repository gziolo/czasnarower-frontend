define([ '../app/config' ], function() {
  require.config({
    deps : [ 'spec/runner' ],
    paths : {
      chai : 'node_modules/chai/chai',
      sinonChai : 'node_modules/sinon-chai/lib/sinon-chai'
    }
  });
});
