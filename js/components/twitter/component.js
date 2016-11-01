define([ 'flight_index' ], function(flight) {
  'use strict';

  function Twitter() {
    this.scriptLoaded = false;

    this.loadScript = function() {
      window.twttr = (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
          t = window.twttr || {};
        if (d.getElementById(id)) {
          return t;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);

        t._e = [];
        t.ready = function(f) {
          t._e.push(f);
        };

        return t;
      }(document, "script", "twitter-wjs"));
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
