require([ 'config' ], function() {
  var getUrlArgs = function() {
    if (window.jsVersion === undefined) {
      return '';
    }
    return 'v=' + window.jsVersion;
  };
  require.config({
    deps : [ 'js/app' ],
    paths : {
      'js/app' : 'app'
    },
    urlArgs : getUrlArgs()
  });
});
