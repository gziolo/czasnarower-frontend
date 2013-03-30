require([ 'config' ], function() {
  'use strict';

  var baseUrl = (window.staticUrl || '') + 'frontend' + (window.jsVersion || '') + '/';
  require.config({
    baseUrl : baseUrl,
    deps : [ 'js/app' ]
  });
});
