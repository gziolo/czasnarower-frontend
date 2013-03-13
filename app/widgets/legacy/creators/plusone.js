/*global Core */
Core.Creator.register('plusone', function(facade, $) {
  "use strict";

  return {
    init : function(data) {
      if (0 < $('.g-plusone').length) {
        facade.loadScript('https://apis.google.com/js/plusone.js', 'plusoneJS');
      }
    },
    destroy : function() {}
  };
});
