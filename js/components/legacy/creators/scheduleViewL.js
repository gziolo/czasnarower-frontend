/*jshint unused:false, strict:false */
/*global L */
define(function() {
    return function(facade, $) {
        var activeYear,
            activeFilters = [],
            lMap,
            mapLoaded = false,
            markers = {},
            raceIds = [],
            visibleMarkers = [];

        var raceIcon = L.Icon.extend({
            options: {
                shadowUrl: facade.config.staticUrl + 'img-1.3/markers/icon20_shadow.png',
                iconSize: [20, 20],
                shadowSize: [37, 20],
                iconAnchor: [0, 0],
                shadowAnchor: [0, 0],
                popupAnchor: [10, 5]
            }
        });
        var raceIconBig = L.Icon.extend({
            options: {
                shadowUrl: facade.config.staticUrl + 'img-1.3/markers/icon32_shadow.png',
                iconSize: [32, 32],
                shadowSize: [59, 32],
                iconAnchor: [0, 0],
                shadowAnchor: [0, 0],
                popupAnchor: [16, 8]
            }
        });

        var racePopup = L.Popup.extend({ options: { className: 'previewBox' } });

        function getIcon(cat, past, big) {
            var available_icons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] // 1-14
            var category = Number(cat);
            var category_index = $.inArray(category, available_icons) >= 0 ? category : '';
            var filename = 'icon' + (big ? '32' : '20') + '_race' + category_index + (past ? '_past' : '') + '.png';
            var url = facade.config.staticUrl + 'img-1.3/markers/' + filename;
            return big ? new raceIconBig({ iconUrl: url }) : new raceIcon({ iconUrl: url });
        }

        function initRacesMap(data) {

            lMap = L.map(
                data.id, {
                    preferCanvas: true,
                    minimapControl: false,
                    rotate: true,
                    searchControl: false,
                    layersControl: false,
                    mapTypes: {
                        streets: {
                            name: 'OpenStreetMap',
                            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            options: {
                                maxZoom: 24,
                                maxNativeZoom: 19,
                                attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                            },
                        }
                    },
                    mapTypeIds: ['streets']
                }
            );
            lMap.setView([52.066667, 19.483333], 7);
            if (data.races) {
                createRaces(data);
            }
            lMap.setMinZoom(6);
            mapLoaded = true;

            updateMarkers(raceIds, data.selected);

            $('body').on('click', '.cnr-expand-map', function() {
                var mapBox = $(this).parents('.cnr-map-global');
                mapBox.addClass('cnr-expanded');
                lMap.invalidateSize();
            });

            $('body').on('click', '.cnr-collapse-map', function() {
                var mapBox = $(this).parents('.cnr-map-global');
                mapBox.removeClass('cnr-expanded');
                lMap.invalidateSize();
            });
        }

        function createRaces(data) {
            var mode = data.mode || 0;
            var selected = data.selected || 0;
            $.each(data.races.races, function(id, race) {
                var latLng = L.latLng(race.latitude, race.longitude);
                var content = '<h5><a title="Przejdź do strony wyścigu" href="' + race.url_view + '"/>' + race.race_name + ' &raquo;</a></h5>';
                content += '<p><span class="nowrap"><i class="icon-calendar icon icon-blue"></i> ' + race.start_day + '</span> ';
                content += '<span class="nowrap"><i class="icon icon-map-marker icon-blue"></i> ' + race.start_place + '</span> ';
                content += '<span class="nowrap"><i class="icon-tag icon icon-blue"></i> ' + race.race_sort + '</span></p>';

                var icon = getIcon(race.category, race.past, selected == id);
                var marker = L.marker(
                    latLng, { icon: icon, title: race.title });
                marker.bindPopup(content, { className: 'racePopup' });
                marker.past = race.past;
                marker.category = race.category;
                marker.content = content;
                markers[id] = marker;

                if (!activeFilters.length || $.inArray(id, activeFilters) >= 0) {
                    raceIds.push(id);
                }
            });
        }

        function updateMarkers(raceIds, selectedId) {
            var mapBounds = L.latLngBounds();
            visibleMarkers = [];
            $.each(markers, function(id, marker) {
                if ($.inArray(id, raceIds) >= 0) {
                    visibleMarkers.push(marker);
                    mapBounds.extend(marker.getLatLng())
                    if (!lMap.hasLayer(marker)) {
                        marker.addTo(lMap);
                    }
                } else {
                    if (lMap.hasLayer(marker)) {
                        lMap.removeLayer(marker)
                    }
                }
            });
            if (selectedId) {
                var id = "" + selectedId;
                var activeMarker = markers[id]
                lMap.setView(activeMarker.getLatLng(), 9);
                setTimeout(function() {
                    activeMarker.openPopup();
                }, 500); // give time to render
            } else {
                lMap.fitBounds(mapBounds, { maxZoom: 12 });
            }
            refreshRacesCount();
        }

        function refreshMap(data) {
            if (!mapLoaded) {
                activeFilters = data.ids;
                return;
            }
            var raceIds = data.ids;
            var mapBox = $('#map_global');


            if (!data.year || data.year === currentYear) {
                updateMarkers(raceIds);
                return
            }

            $.each(visibleMarkers, function(id, marker) {
                if (lMap.hasLayer(marker)) {
                    lMap.removeLayer(marker)
                }
            });
            currentYear = Number(data.year);
            mapBox.addClass('cnr-loading');
            facade.rest.getAll('race-location', {
                year: data.year
            }, {
                success: function(response) {
                    if (response.data) {
                        markers = {};
                        createRaces({ year: data.year, races: response.data });
                        updateMarkers(raceIds);
                    }
                },
                complete: function() {
                    mapBox.removeClass('cnr-loading');
                }
            });
        }

        function refreshRacesCount() {
            var count = Object.keys(visibleMarkers).length;
            $('.map-global-header .caption').html("<span style='color: #ff7600'>" + count + '</span> wyścigów');
        }


        return {
            init: function(data) {
                facade.listen('schedule-view-register-map-l', this.registerMap, this);
                facade.listen('schedule-view-load-data', this.loadData, this);
                facade.listen('schedule-view-update-data', this.updateData, this);
                facade.listen('schedule-zoom-map', this.zoomMap, this)
            },
            loadData: function(messageInfo) {
                var options = messageInfo.data,
                    mapBox;

                if (!options.year || !$('#' + options.id).length) {
                    return;
                }
                var mapBox = $('#map_global');
                mapBox.addClass('cnr-loading');
                currentYear = Number(options.year);
                facade.rest.getAll('race-location', {
                    year: options.year
                }, {
                    success: function(response) {
                        if (response.data) {
                            options.races = response.data;
                            facade.notify({
                                type: 'schedule-view-register-map-l',
                                data: options
                            });
                        }
                    },
                    complete: function() {
                        mapBox.removeClass('cnr-loading');
                    }
                });
            },
            zoomMap: function(messageInfo) {
                lMap.setView([messageInfo.data.lat, messageInfo.data.lng], 13);
            },
            updateData: function(messageInfo) {
                refreshMap(messageInfo.data);
            },
            registerMap: function(messageInfo) {
                if (!messageInfo.data.id || (!messageInfo.data.races)) {
                    return;
                }
                initRacesMap(messageInfo.data);
            },
            destroy: function() {}
        };
    };
});