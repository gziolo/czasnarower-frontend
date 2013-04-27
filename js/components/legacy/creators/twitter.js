/*jshint unused:false */
define(function() {
  return function(sandbox, $) {
    'use strict';

    function loadWidget() {
      if (0 < $('.twitter-share-button:visible').length) {
        window.___gcfg = {
          lang : 'pl'
        };
        sandbox.loadScript('//platform.twitter.com/widgets.js', 'twitterJs');
      }
    }

    return {
      init : function(data) {
        loadWidget();
        $(window).on('resize', loadWidget);
      },
      destroy : function() {}
    };
  };
});
