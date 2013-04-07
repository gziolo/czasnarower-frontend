/*jshint unused:false */
/*global google */
function mapInitialisedCallback() {
  require([ 'legacy/core' ], function(core) {
    core.notify({
      type : 'map-init-libraries'
    });
  });
}

define(function() {
  return function(facade, $) {
    'use strict';

    var googleMapsInitalised = false;

    function initGoogleMaps() {
      if (!googleMapsInitalised && !$('#googleMaps').length) {
        googleMapsInitalised = true;
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.id = 'googleMaps';
        script.src = "http://maps.google.com/maps/api/js?libraries=geometry&language=pl&sensor=false&callback=mapInitialisedCallback";
        $('body').append(script);
      }
    }

    return {
      init : function(data) {
        facade.listen('map-init-libraries', this.mapInitLibraries, this);

        initGoogleMaps();
      },
      mapInitLibraries : function() {
        facade.requireScripts([ 'js/gmaps/infobox_packed.js', 'js/gmaps/markerclusterer_packed.js' ], function() {
          facade.notify({
            type : 'map-initialised'
          });
        });
      },
      destroy : function() {}
    };

  };
});
