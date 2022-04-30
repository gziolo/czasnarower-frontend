/*jshint unused:false, strict:false */
/*global L */
define(function() {
    return function(facade, $) {
        var lMap;
        var lPoly;
        var gpx = false;

        function initTrackMap(data) {

            var track = data.track;
            var latLngs = track.latLngs;
            var path = [];
            var startLatLng = L.latLng(latLngs[0].latitude, latLngs[0].longitude);
            $.each(latLngs, function(i, latLng) {
                var pos = L.latLng(latLng.latitude, latLng.longitude);
                path.push(pos);
            });

            lMap = L.map(
                'track-map', {
                    preferCanvas: true,
                    minimapControl: false,
                    rotate: true,
                    searchControl: false,
                    layersControl: {
                        inline: false,
                        position: 'topleft'
                    },
                    mapTypes: {
                        streets: {
                            name: 'OpenStreetMap',
                            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            options: {
                                maxZoom: 24,
                                maxNativeZoom: 19,
                                attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                            },
                        },
                        satellite: {
                            name: 'Satelita',
                            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                            options: {
                                maxZoom: 24,
                                maxNativeZoom: 18,
                                attribution: 'Map data: &copy; <a href="http://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            },
                        },
                        topo: {
                            name: 'Topo',
                            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                            options: {
                                maxZoom: 24,
                                maxNativeZoom: 17,
                                attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                            },
                        },
                        sigma: {
                            name: 'Sigma Cycle',
                            url: 'https://tiles1.sigma-dc-control.com/layer8/{z}/{x}/{y}.png',
                            options: {
                                maxZoom: 24,
                                maxNativeZoom: 17,
                                attribution: ''
                            }
                        }
                    },
                    mapTypeIds: ['streets', 'topo', 'satellite', 'sigma']
                }
            );

            var myIcon = L.icon({
                iconUrl: facade.config.staticUrl + 'img-1.3/markers/icon20_track.png',
                iconSize: L.point(20, 20)
            });

            lPoly = L.polyline(path, { opacity: 0.8, weight: 4 }).addTo(lMap);
            lMap.fitBounds(lPoly.getBounds());
            var marker = L.marker(startLatLng, { icon: myIcon, title: track.title }).addTo(lMap);
            if (track.profile) {
                gpx = track.gpx;
            }
        }

        function loadElevation() {
            if (!gpx) {
                return;
            }
            var controlElevation = L.control.elevation({
                collapsed: false,
                detached: true,
                downloadLink: false,
                elevationDiv: '#track-elevation',
                legend: false,
                slope: "summary",
                summary: false,
                theme: "lightblue-theme"
            }).addTo(lMap);

            lMap.on('eledata_loaded', function(e) {
                var q = document.querySelector.bind(document);
                var track = e.track_info;
                // Default Summary info
                q('.totlen .summaryvalue').innerHTML = track.distance.toFixed(2) + " km";
                q('.maxele .summaryvalue').innerHTML = track.elevation_max.toFixed(2) + " m";
                q('.minele .summaryvalue').innerHTML = track.elevation_min.toFixed(2) + " m";
                // Custom Summary info
                q('.gain .summaryvalue').innerHTML = "+" + track.ascent.toFixed(0) + " m";
                q('.climb-info').innerHTML = ' (+' + track.ascent.toFixed(0) + " m / -" + track.descent.toFixed(0) + " m)";
                //q('.loss .summaryvalue').innerHTML = "-" + track.descent.toFixed(0) + " m";
                $('#data-summary').removeClass('hidden')
                lMap.removeLayer(lPoly);
            });

            controlElevation.load(gpx);
        }

        return {
            init: function(data) {
                facade.listen('track-view-register-l-map', this.registerTrackMap, this);
                facade.listen('map-init-libraries', this.loadElevation, this);
            },
            loadElevation: function() {
                loadElevation();
            },
            registerTrackMap: function(messageInfo) {
                if (!messageInfo.data.track) {
                    return;
                }
                initTrackMap(messageInfo.data);
            },

            destroy: function() {}
        };
    };
});