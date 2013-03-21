require([ 'config' ], function() {
  var getUrlArgs = function() {
    if (window.jsVersion === undefined) {
      return '';
    }
    return 'v=' + window.jsVersion;
  };
  require.config({
    baseUrl : window.sStaticUrl + 'frontend/',
    deps : [ 'js/app' ],
    urlArgs : getUrlArgs()
  });
});
