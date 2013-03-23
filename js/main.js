require([ 'config' ], function() {
  var baseUrl = (window.staticUrl || '') + 'frontend' + (window.jsVersion || '') + '/';
  require.config({
    baseUrl : baseUrl,
    deps : [ 'js/app' ]
  });
});
