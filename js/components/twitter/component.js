define([ 'flight_index' ], function(flight) {
  'use strict';

  function Twitter() {
    this.scriptLoaded = false;

    this.loadScript = function() {
      require([ '//platform.twitter.com/widgets.js' ]);
    };

    this.initializeWidgets = function() {
      if (this.scriptLoaded === false && 0 < this.$node.find('.twitter-share-button:visible').length) {
        this.scriptLoaded = true;
        this.loadScript();
      }
    };

    this.after('initialize', function() {
      this.on(window, 'resize', this.initializeWidgets);

      this.initializeWidgets();
    });
  }

  return flight.component(Twitter);
});
