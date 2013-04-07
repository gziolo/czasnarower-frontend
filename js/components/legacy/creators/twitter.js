/*jshint unused:false */
define(function() {
  return function(facade, $) {
    'use strict';

    return {
      init : function(data) {
        if (0 < $('.twitter-share-button').length) {
          window.___gcfg = {
            lang : 'pl'
          };
          facade.loadScript('//platform.twitter.com/widgets.js', 'twitterJs');
        }
      },
      destroy : function() {}
    };
  };
});
