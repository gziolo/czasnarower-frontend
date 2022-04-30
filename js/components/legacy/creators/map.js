/*jshint unused:false, strict:false */
/*global google */
function mapInitialisedCallback() {
    require(['legacy/core'], function(core) {
        core.notify({
            type: 'map-init-libraries'
        });
    });
}

define(function() {
    return function(facade, $) {
        'use strict';

        var googleMapsInitalised = false;

        function initGoogleMaps(data) {
            if (!data.apiKey) {
                return;
            }
            if (!googleMapsInitalised && !$('#googleMaps').length) {
                googleMapsInitalised = true;
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.id = 'googleMaps';
                script.src = "https://maps.google.com/maps/api/js?key=" + data.apiKey + "&libraries=geometry&language=pl&callback=mapInitialisedCallback";
                $('body').append(script);
            }
        }

        return {
            init: function(data) {
                facade.listen('map-init-libraries', this.mapInitLibraries, this);

                initGoogleMaps(data);
            },
            mapInitLibraries: function() {
                facade.requireScripts(['js/gmaps/infobox_packed.js', 'js/gmaps/markerclusterer_packed.js'], function() {
                    facade.notify({
                        type: 'map-initialised'
                    });
                });
            },
            destroy: function() {}
        };

    };
});