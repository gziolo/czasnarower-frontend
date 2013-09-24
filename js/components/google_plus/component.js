define([ 'flight_index' ], function(flight) {
  'use strict';

  function GooglePlus() {
    this.scriptLoaded = false;

    this.loadScript = function() {
      window.___gcfg = {
        lang : 'pl'
      };
      require([ '//apis.google.com/js/plusone.js' ]);
    };

    this.initializeWidgets = function() {
      if (this.scriptLoaded === false && 0 < this.$node.find('.g-plusone:visible').length) {
        this.scriptLoaded = true;
        this.loadScript();
      }
    };

    this.after('initialize', function() {
      this.on(window, 'resize', this.initializeWidgets);

      this.initializeWidgets();
    });

  }

  return flight.component(GooglePlus);
});
