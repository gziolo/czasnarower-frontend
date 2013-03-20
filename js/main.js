require([ 'config' ], function() {
  var getUrlArgs = function() {
    var search = document.location.search || '';
    if (search.indexOf('?') === 0) {
      search = search.substring(1);
    }
    return search;
  };
  require.config({
    deps : [ 'js/app' ],
    paths : {
      'js/app' : 'app'
    },
    urlArgs : getUrlArgs()
  });
});
