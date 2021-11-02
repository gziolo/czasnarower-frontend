/*jshint unused:false, strict:false */
/*global google, InfoBox, MarkerClusterer */
define([ 'underscore' ], function(_) {
  return function(facade, $) {

    /**
     * array Maps data
     */
    var _data = [],

    /**
     * object InfoWindow for displaying found location
     */
    locationInfo, locationLabel, markerCluster, trackPreview, polys = {},

    /**
     * object LatLngBounds polyBounds for keeping information about current
     * polys bounds
     */
    polysBounds,

    /**
     * object Geocoder:
     */
    geocoder,

    mousemarker, info, _googleMapsLoaded = false, markers = [];

    var _initializeMap = function(data) {

      var mapElem, map, cyclemapRenderer;

      mapElem = document.getElementById(data.id);
      map = new google.maps.Map(mapElem, {
        streetViewControl : false,
        mapTypeId : google.maps.MapTypeId.ROADMAP,
        scrollwheel : false
      });

      // Replace cyclemapRenderer by Sigma Cycle (TOPO)
      var sigmamapRenderer = new google.maps.ImageMapType({
        getTileUrl : function(ll, z) {
          var X = ll.x % (1 << z);
          return "https://tiles1.sigma-dc-control.com/layer8/" + z + "/" + X + "/" + ll.y + ".png";
        },
        tileSize : new google.maps.Size(256, 256),
        isPng : true,
        maxZoom : 17,
        name : "Sigma Cycle",
        alt : "Sigma Cycle (TOPO)"
      });

      map.mapTypes.set('sigma', sigmamapRenderer);

      var osmmapRenderer = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          var tilesPerGlobe = 1 << zoom;
          var x = coord.x % tilesPerGlobe;
          if (x < 0) {
            x = tilesPerGlobe+x;
          }
          return "https://tile.openstreetmap.org/" + zoom + "/" + x + "/" + coord.y + ".png";
        },
        tileSize : new google.maps.Size(256, 256),
        isPng : true,
        maxZoom : 18,
        name : "OpenStreetMap",
        alt : "Open Streetmap"
      });

      map.mapTypes.set('osm', osmmapRenderer);
      var optionsUpdate = {
        mapTypeControlOptions : {
          mapTypeIds : [ google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN, 'sigma', 'osm'],
          style : google.maps.MapTypeControlStyle.DEFAULT
        }
      };
      map.setOptions(optionsUpdate);
      if (data.tracks) {
        _createTracks(map, data);
      }
      if (data.track) {
        _createTrack(map, data);
      }
      $('#btnGeocode').click(function() {
        _codeAddress(map);
      });

      $('#searchAddress').keypress(function(e) {
        if (e.which === 13) {
          _codeAddress(map);
        }
      });
    };

    // Define the overlay, derived from google.maps.OverlayView
    var Label = function(opt_options) {
      // Initialization
      this.setValues(opt_options);

      // Label specific
      var span = this.span_ = document.createElement('span');
      span.id = 'pointLabel';
      span.style.cssText = 'white-space: nowrap; font-size: 10px; ';

      var div = this.div_ = document.createElement('div');
      div.appendChild(span);
      div.id = 'pointLabelBox';
      div.style.cssText = 'z-index: 100; position: absolute; display: none; background-color: #E2EBF6;padding: 3px 5px; border-radius: 5px;border: 1px solid #A2BAD9;box-shadow: 2px 3px 6px rgba(102, 102, 102, 0.75)';
    };

    var _createTracks = function(map, data) {

      var latitude = 52.066667;
      var longitude = 19.483333;
      if (data.selected) {
        var track = data.tracks[data.selected];
        if (track) {
          latitude = track.start_latlng.latitude;
          longitude = track.start_latlng.longitude;
        }
      }
      var centerLatLng = new google.maps.LatLng(latitude, longitude);
      map.setCenter(centerLatLng);

      trackPreview = _poly(map);

      var zoom = 7;
      if (data.zoom) {
        zoom = data.zoom;
      }
      map.setZoom(zoom);

      var area;
      if (data.radius) {
        var circle = new google.maps.Circle({
          center : centerLatLng,
          radius : data.radius * 1000
        });
        area = circle.getBounds();
        var minZoomLevel = 6;

        google.maps.event.addListener(map, 'zoom_changed', function() {
          if (map.getZoom() < minZoomLevel) {
            map.setZoom(minZoomLevel);
          }
        });
        google.maps.event.addListener(map, 'dragend', function() {
          if (area.contains(map.getCenter())) {
            return;
          }
          var c = map.getCenter(), x = c.lng(), y = c.lat(), maxX = area.getNorthEast().lng(), maxY = area.getNorthEast().lat(), minX = area.getSouthWest().lng(), minY = area.getSouthWest().lat();
          if (x < minX) {
            x = minX;
          }
          if (x > maxX) {
            x = maxX;
          }
          if (y < minY) {
            y = minY;
          }
          if (y > maxY) {
            y = maxY;
          }
          map.setCenter(new google.maps.LatLng(y, x));
        });
      }
      markers = [];
      $.each(data.tracks, function(i, track) {
        var latLng = track.start_latlng;
        latLng = new google.maps.LatLng(latLng.latitude, latLng.longitude);
        if (!area || area.contains(latLng)) {
          var marker = _marker(map, track, {
            position : latLng,
            id : track.id,
            map : null
          });
          markers.push(marker);
        }
      });
      markerCluster = new MarkerClusterer(map, markers, {
        maxZoom : 11,
        gridSize : 50,
        zoomOnClick : true,
        imagePath: facade.config.staticUrl + 'img-1.3/markers/cluster-'
      });

      $('.track-category').change(function() {
        updateTracksView(map);
      });
      $('.map-global-header .caption').html("<span style='color: #ff7600'>" + markers.length + '</span> tras');
    };

    var updateTracksView = function(map) {

      var categories = [];
      //var markersBounds = new google.maps.LatLngBounds();

      $('.track-category').each(function() {
        var category = $(this).val();
        var isChecked = $(this).prop('checked');

        if (isChecked) {
          categories.push(category);
        }
      });
      markerCluster.clearMarkers();
      _.each(markers, function(marker) {
        if (_.intersection(marker.categories, categories).length > 0) {
          marker.setMap(map);
          //markersBounds.extend(marker.getPosition());
          markerCluster.addMarker(marker);
        } else {
          marker.setMap(null);
        }
      });
      //map.fitBounds(markersBounds);
      markerCluster.repaint();
      if(trackPreview){trackPreview.setMap(null);}
    };

    var _createTrack = function(map, data) {
      var track = data.track;
      var latLngs = data.track.latLngs;
      var bounds = new google.maps.LatLngBounds();
      var path = [];
      var startLatLng = new google.maps.LatLng(latLngs[0].latitude, latLngs[0].longitude);
      $.each(latLngs, function(i, latLng) {
        var pos = new google.maps.LatLng(latLng.latitude, latLng.longitude);
        path.push(pos);
        bounds.extend(pos);
      });
      var poly = _poly(map, {
        path : path
      });
      map.fitBounds(bounds);
      var marker = _marker(map, track, {
        position : startLatLng,
        title : track.title
      });
      var pathLength = google.maps.geometry.spherical.computeLength(path);
      _getElevationData(path, map, pathLength);

      var img = new google.maps.MarkerImage(facade.config.staticUrl + 'img-1.3/markers/icon10_point.png', new google.maps.Size(10, 10), new google.maps.Point(0, 0), new google.maps.Point(5, 5));
      var imgShadow = new google.maps.MarkerImage(facade.config.staticUrl + 'img-1.3/markers/iconset-1.png', new google.maps.Size(19, 10), new google.maps.Point(400, 32), new google.maps.Point(5, 5));

      mousemarker = new google.maps.Marker({
        map : map,
        icon : img,
        shadow : imgShadow,
        visible : false
      });

      Label.prototype = new google.maps.OverlayView();
      // Implement onAdd
      Label.prototype.onAdd = function() {
        var pane = this.getPanes().overlayLayer;
        pane.appendChild(this.div_);

        // Ensures the label is redrawn if the text or position is
        // changed.
        var me = this;
        this.listeners_ = [ google.maps.event.addListener(this, 'position_changed', function() {
          me.draw();
        }), google.maps.event.addListener(this, 'text_changed', function() {
          me.draw();
        }) ];
      };

      // Implement onRemove
      Label.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);

        // Label is removed from the map, stop updating its
        // position/text.
        for ( var i = 0, I = this.listeners_.length; i < I; ++i) {
          google.maps.event.removeListener(this.listeners_[i]);
        }
      };

      // Implement draw
      Label.prototype.draw = function() {
        var projection = this.getProjection();
        var position = projection.fromLatLngToDivPixel(this.get('position'));
        if (!position) {
          return;
        }
        var div = this.div_;
        div.style.left = position.x + 'px';
        div.style.top = position.y + 'px';
      };

      info = new Label({
        map : map,
        position : startLatLng
      });
      info.bindTo('position', mousemarker, 'position');
      info.bindTo('text', mousemarker, 'position');
    };

    var _getElevationData = function(aData, map, fLength) {
      var elevationService;
      var arrReduction = function(aPoints, size) {
        var arr = [];
        for (var i=0; i<aPoints.length; i++){
          arr.push(aPoints[i]);
        }
        if (arr.length < size) {
          return arr;
        }
        var repeats = arr.length - size;
        while (repeats > 0) {
          var index = Math.floor(Math.random() * arr.length);
          arr.splice(index, 1);
          repeats--;
        }
        return arr;
      };
      // Reduce array to 256 points and genereate profile
      var tmpArray = arrReduction(aData, 256);
      // prepare profile only if track has minimum 10 points
      if (10 <= tmpArray.length) {
        elevationService = new google.maps.ElevationService();
        elevationService.getElevationAlongPath({
          path : tmpArray,
          samples : 512
        }, function(result, status) {
          if (status === google.maps.ElevationStatus.OK) {
            var elevations = [];
            var max = -100000;
            var min = 100000;
            var climb = 0;
            var descent = 0;
            var currentDistance = 0;
            for ( var j = 0; j < result.length; ++j) {
              if (j > 0) {
                currentDistance = Math.round((j * fLength) / 5120) /100;
              }
              elevations.push([ currentDistance, result[j].elevation, result[j].location ]);
              max = (max > result[j].elevation ? max : result[j].elevation.toFixed(0));
              min = (min < result[j].elevation ? min : result[j].elevation.toFixed(0));
              if (!j) {
                continue;
              }
              if (result[j].elevation < result[j - 1].elevation) {
                descent += result[j - 1].elevation - result[j].elevation;
              }
              else {
                climb += result[j].elevation - result[j - 1].elevation;
              }
            }
            $('#profile_full').show();
            $('#profileStats')
                .html(
                    'Przewyższenia: <big><strong>' + climb.toFixed(0) + ' m</strong></big> (Min: <big><strong>' + min + '</strong></big>  m n.p.m., Max: <big><strong>' + max +
                        '</strong></big> m n.p.m.)');
            $('#climbInfo').html(' | Przewyższenia: ' + climb.toFixed(0) + ' m');
            facade.notify({
              type : 'plot-show-track-profile',
              data : {
                target : 'track_profile_full',
                elevations : elevations,
                yRange: {
                  max: ((max - min) < 50) ? +max + 49 : +max,
                  min: ((max - min) < 50) ? +min - 49 : +min
                }
              }
            });
          }
        });
      } else {
        $('#profile_full').hide();
      }
    };

    /**
     * method for creating new google-maps-marker object and - binds proper
     * events
     */
    var _marker = function(map, track, opts) {
      // TODO: select proper ICON
      var img = new google.maps.MarkerImage(facade.config.staticUrl + 'img-1.3/markers/iconset-1.png', new google.maps.Size(20, 20), new google.maps.Point(40, 32), new google.maps.Point(10, 10));
      var defaults = {
        map : map,
        icon : img
      };

      $.extend(defaults, opts);
      var marker = new google.maps.Marker(defaults);
      marker.categories = track.categories;
      if (opts.title) {
        return;
      }
      var content = '<div class="previewBox' + (track.url_photo ? ' pict' : '') + '"><span class="arrowTop">&nbsp;</span>';
      if (track.url_photo) {
        content += '<aside class="pull-left"><a class="thumbnail" title="Przejdź do strony trasy" href="' + track.url_view + '"/><img src="' + (track.url_photo) +
            '" width="50" height="50"/></a></aside>';
      }
      content += '<div' + (track.url_photo ? ' class="has-photo"' : '') + '><h5><a title="Przejdź do strony trasy" href="' + track.url_view + '"/>' + track.title + '</a></h5>';
      content += '<p>';
      content += '<span class="nowrap muted text-cut"><i class="icon-user icon icon-blue"></i> ' + track.author + ' (' + track.created_date.substring(0, 10) + ')</span>';
      if (track.start_place || track.distance) {
        content += '<br /><span class="nowrap text-cut"><i class="icon icon-blue icon-map-marker"></i> ' + track.start_place + (track.distance ? ' / ' + Number(track.distance).toFixed() + ' km' : '') + '</span>';
      }
      if (track.categories_view) {
        content += '<br /><span class="nowrap text-cut"><i class="icon icon-blue icon-tags"></i> ' + track.categories_view + '</span>';
      }
      content += '</p>';
      content += '</div><div>';
      google.maps.event.addListener(marker, 'click', function(event) {
        locationInfo.close();
        locationLabel.close();
        locationInfo.setOptions({
          content : content,
          position : marker.getPosition()
        });
        locationInfo.open(map, marker);
      });

      google.maps.event.addListener(marker, 'mouseover', function(event) {
        locationLabel.close();
        locationLabel.setOptions({
          content : '<div class="labelBox"><span class="arrowTop">&nbsp;</span><h5>' + (track.title.length > 40 ? track.title.substring(0, 40) + '...' : track.title) +
              ' <small> &raquo; kliknij w ikonę</small></h5></div>',
          position : marker.getPosition()
        });
        locationLabel.open(map, marker);
        _getTrackPreview(track.id, map);
      });
      google.maps.event.addListener(marker, 'mouseout', function(event) {
        locationLabel.close();
      });

      return marker;
    };

    /**
     * method for creating new google-maps-polyline object and
     *
     */
    var _poly = function(map, opts) {
      var defaults = {
        map : map,
        strokeColor : '#ff0000',
        strokeOpacity : 0.6,
        strokeWeight : 5
      };
      $.extend(defaults, opts);
      var poly = new google.maps.Polyline(defaults);

      return poly;
    };

    /**
     * geocode an address and set map center at the returned latitude and
     * longitude values
     */
    var _codeAddress = function(map) {
      var address = document.getElementById("searchAddress").value;
      $('#geoAddresses').empty().hide();
      locationInfo.close();
      geocoder.geocode({
        'address' : address
      }, function(results, status) {
        var location;
        var locations;

        if (status === google.maps.GeocoderStatus.OK) {
          if (results.length === 1) {
            location = _formatGeocoderResult(results[0]);
            _zoomLocation(map, location);

          } else if (results.length > 1) {
            locations = [];
            $.each(results, function(i, result) {
              locations.push(_formatGeocoderResult(result));
            });
            _viewLocationSelect(map, locations);
          }
        } else {
          _viewLocationSelect(map, []);
        }
      });
    };

    var _showTrackPreview = function(id, map) {

      var latLngs = polys[id];

      if (!latLngs.length) {
        trackPreview.setMap(null);
        return;
      }
      var path = [];
      $.each(latLngs, function(i, latLng) {
        var pos = new google.maps.LatLng(latLng[0], latLng[1]);
        path.push(pos);
      });
      trackPreview.setPath(path);
      trackPreview.setMap(map);
    };
    var _getTrackPreview = function(id, map) {

      if (polys[id] !== undefined) {
        _showTrackPreview(id, map);
        return;
      }
      var urlData = {
        dao : 13,
        action : 7,
        dataType : 'json',
        params : JSON.stringify({
          id : id
        })
      };

      facade.ajax({
        type : 'POST',
        data : urlData,
        dataType : 'json',
        url : 'ajax',
        success : function(sData) {
          if (sData.track_locations) {
            polys[id] = sData.track_locations;
            _showTrackPreview(id, map);
            return;
          }
        },
        cache : false,
        global : false
      });
    };
    var _formatGeocoderResult = function(result) {

      var ret = {
        raw_name : result.formatted_address,
        name : result.formatted_address,
        position : result.geometry.location,
        locality : '',
        administrativeRegion : '',
        country : '',
        raw_tags : []
      };

      var addr_components = result.address_components;
      for ( var index = 0; index < addr_components.length; index++) {
        var component = addr_components[index];
        if ($.inArray('administrative_area_level_1', component.types) > -1) {
          ret.administrativeRegion = component;
          ret.name += ' (' + component.short_name + ')';
        }
        if ($.inArray('country', component.types) > -1) {
          ret.country = component;
        }
        if ($.inArray('administrative_area_level_2', component.types) > -1) {
          ret.administrativeRegion2 = component;
        }
        if ($.inArray('administrative_area_level_3', component.types) > -1) {
          ret.administrativeRegion3 = component;
        }
        if ($.inArray('locality', component.types) > -1) {
          ret.locality = component;
        }
        if (component.long_name) {
          if ($.inArray('postal_code', component.types) === -1 && $.inArray('post_box', component.types) === -1 && $.inArray('street_number', component.types) === -1 &&
              $.inArray('floor', component.types) === -1 && $.inArray('route', component.types) === -1 && $.inArray('postal_code', component.types) === -1) {
            ret.raw_tags.push(component.long_name);
          }

        }
      }
      return ret;
    };

    /**
     *
     */
    var _viewLocationSelect = function(map, locations) {
      var txt = '';
      var ind;
      var outDiv = $('#geoAddresses');
      outDiv.empty();

      if (locations.length) {
        txt = '<p><small>Zostało znalezionych kilka pasujących adresów, kliknij na wybrany link aby zaznaczyć na mapie:</small></p>';
        $.each(locations, function(i, location) {
          txt += '<p class="location" id="location_' + i + '">' + location.name + '</p>';
        });
        outDiv.html(txt);

        $('.location').click(function() {
          ind = (this.id).split('_')[1];
          _zoomLocation(map, locations[ind]);
        });
      } else {
        txt = '<p>Lokalizacji nie znaleziono.</p>';
        outDiv.html(txt);
      }
      outDiv.show();
    };

    /**
     *
     */
    var _zoomLocation = function(map, location) {
      map.setCenter(location.position);
      map.setZoom(13);
    };

    /**
     *
     */
    var _updateAttendingButtons = function(val, id) {
      id = id || '';
      switch (val) {
        // user plan to visit track
        case 0:
          $('#plan_event_btn .addActivity, #join_event_btn .removeActivity').hide();
          $('#plan_event_btn .removeActivity').attr('data-id', id);
          $('#join_event_btn .addActivity').attr('data-id', id);
          $('#plan_event_btn .addActivity').attr('data-id', id);
          $('#join_event_btn, #plan_event_btn, #plan_event_btn .removeActivity').show();
          break;
        // user visited track
        case 1:
          $('#plan_event_btn, #join_event_btn .addActivity').hide();
          $('#join_event_btn .removeActivity').attr('data-id', id);
          $('#join_event_btn, #join_event_btn .removeActivity').show();
          break;
        // user not signed to event
        default:
          $('#plan_event_btn, #join_event_btn, #plan_event_btn .addActivity, #join_event_btn .addActivity').show();
          $('#plan_event_btn .removeActivity, #join_event_btn .removeActivity').hide();

          $('#plan_event_leave_btn .removeActivity').attr('data-id', '');
          $('#join_event_leave_btn .removeActivity').attr('data-id', '');

          $('#plan_event_btn .addActivity').attr('data-id', '');
          $('#join_event_btn .addActivity').attr('data-id', '');
          break;
      }

      var numAttendee = $('#track_members .cnr-attendee').size();
      $(".cnr-track_join_no").html((numAttendee ? 'Liczba uczestników: ' + numAttendee : 'Nikt jeszcze nie przejechał trasy.'));

      var numPlanAttendee = $('#plan_track_members .cnr-attendee').size();
      $(".cnr-track_plan_no").html((numPlanAttendee ? 'Liczba uczestników: ' + numPlanAttendee : 'Nikt jeszcze nie zaplanował przejazdu.'));

    };

    return {
      init : function(data) {
        facade.listen('map-initialised', this.mapInitialised, this);
        facade.listen('track-view-register-map', this.registerMap, this);
        facade.listen('track-view-load-map', this.loadMap, this);
        facade.listen('track-view-update-mousemarker', this.updateMousemarker, this);
        facade.listen('event-attending-member-added', this.addMemberToTrack, this);
        facade.listen('event-attending-member-removed', this.removeMemberFromTrack, this);
        facade.listen('user-signed-out', this.updateMemberSignedOut, this);
        facade.listen('user-signed-in', this.updateMemberSignedIn, this);


        $('body').on('click', '.cnr-expand-map', function () {
          var button = $(this),
            data = button.data('params'),
            mapBox = button.parents('.cnr-map-global');

          mapBox.addClass('cnr-expanded cnr-loading');

          if (!data) {
            mapBox.removeClass('cnr-loading');
            return;
          }

          button.button('loading');
          data.completeCallback = function() {
            button.button('reset');
            mapBox.removeClass('cnr-loading');
          };
          data.successCallback = function() {
            button.data('params', null);
          };
          facade.notify({
            type: 'track-view-load-map',
            data: data
          });
        });

        $('body').on('click', '.cnr-collapse-map', function () {
          var button = $(this),
            mapBox = button.parents('.cnr-map-global');
          mapBox.removeClass('cnr-expanded');
        });
        $("body").on("click", ".cnr-show-map", function() {
          var button = $(this),
              data = button.data("params"),
              map = $("#track_map .cnr-track-map");
          map.addClass("big cnr-loading"),
          map.removeClass("hidden"),
          button.addClass("hidden"),
          $("#profile_full").removeClass("hidden"),
          facade.notify({
              type: "track-view-register-map",
              data: data
          });
        })
      },
      mapInitialised : function() {
        geocoder = new google.maps.Geocoder();
        polysBounds = new google.maps.LatLngBounds();

        var opt = {
          disableAutoPan : false,
          maxWidth : 0,
          pixelOffset : new google.maps.Size(0, 5),
          zIndex : null,
          /*
           * boxStyle: { width: "200px" },
           */
          closeBoxMargin : "10px 4px 2px 2px",
          closeBoxURL : "https://www.google.com/intl/en_us/mapfiles/close.gif",
          infoBoxClearance : new google.maps.Size(1, 1),
          isHidden : false,
          pane : "floatPane",
          enableEventPropagation : false
        };

        locationInfo = new InfoBox(opt);

        var optLabel = {
          disableAutoPan : true,
          pixelOffset : new google.maps.Size(0, 5),
          closeBoxURL : "",
          isHidden : false,
          pane : "floatPane",
          enableEventPropagation : true
        };

        locationLabel = new InfoBox(optLabel);

        var length = _data.length;
        for ( var i = 0; i < length; i++) {
          _initializeMap(_data[i]);
        }
        _googleMapsLoaded = true;
      },
      registerMap : function(messageInfo) {
        if (!messageInfo.data.id || (!messageInfo.data.tracks && !messageInfo.data.track)) {
          return;
        }
        _data.push(messageInfo.data);
        if (_googleMapsLoaded) {
          _initializeMap(messageInfo.data);
        }
      },
      loadMap : function(messageInfo) {
        var options = messageInfo.data;

        if (!$('#' + options.id).length) {
          return;
        }
        facade.rest.getAll('track-location', {}, {
          success: function(response) {
            if (response.data) {
              if (options.successCallback) {
                options.successCallback();
              }
              options.tracks = response.data;
              facade.notify({
                type: 'track-view-register-map',
                data: options
              });
            }
          },
          complete: function() {
            if (options.completeCallback) {
              options.completeCallback();
            }
          }
        });
      },
      updateMousemarker : function(messageInfo) {
        if (!mousemarker) {
          return;
        }
        var show = messageInfo.data.show;
        var location = messageInfo.data.location;
        mousemarker.setVisible(show);
        mousemarker.setPosition(location);
        info.div_.style.display = show ? 'block' : 'none';
        if (show) {
          $('#pointLabel').html('Wysokość: <br /><b>' + messageInfo.data.altitude + '</b> m | <b>' + messageInfo.data.distance + '</b> km');
        }
      },
      addMemberToTrack : function(messageInfo) {
        var user;
        var dao = +messageInfo.data.item_dao;
        var value = +messageInfo.data.value;
        if (dao !== 10) {
          return;
        }

        user = facade.getUserData();
        user.ea_id = messageInfo.data.id;

        var matching = $('.event_members .cnr-attendee[data-user-id=' + user.id + ']');
        if (matching.size()) {
          matching.remove();
        }
        if ($("#track_members, #plan_track_members").length) {
          $(facade.template('eventAttendingMember', user)).prependTo((value === 1 ? "#track_members" : "#plan_track_members"));
        }
        _updateAttendingButtons(messageInfo.data.value, messageInfo.data.id);
      },
      removeMemberFromTrack : function(messageInfo) {
        var user = facade.getUserData();
        $(".cnr-attendee[data-id=" + messageInfo.data.id + '][data-user-id=' + user.id + ']').remove();
        _updateAttendingButtons(-1);
      },
      updateMemberSignedIn : function(messageInfo) {
        var user = messageInfo.data, val = -1, id = '';
        // check if user is on the member list
        var matching = $('#track_members .cnr-attendee[data-user-id=' + user.id + ']');
        if (matching.size()) {
          val = 1;
          id = matching.first().attr('data-id');
        }
        // check if user is on the planned list
        matching = $('#plan_track_members .cnr-attendee[data-user-id=' + user.id + ']');
        if (matching.size()) {
          val = 0;
          id = matching.first().attr('data-id');
        }
        _updateAttendingButtons(val, id);
      },
      updateMemberSignedOut : function(messageInfo) {
        _updateAttendingButtons();
      },
      destroy : function() {}
    };
  };
});
