/*jshint unused:false */
define(function() {
  return function(sandbox, $) {
    'use strict';

    function loadWidget() {
      if (0 < $('.g-plusone:visible').length) {
        sandbox.loadScript('//apis.google.com/js/plusone.js', 'plusoneJS');
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
