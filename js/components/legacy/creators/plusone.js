define(function() {
  return function(sandbox, $) {
    'use strict';

    function loadWidget() {
      if (0 < $('.g-plusone:visible').length) {
        sandbox.loadScript('//apis.google.com/js/plusone.js', 'plusoneJS');
      }
    }

    return {
      init : function() {
        loadWidget();
        $(window).on('resize', loadWidget);
      },
      destroy : function() {}
    };
  };
});
