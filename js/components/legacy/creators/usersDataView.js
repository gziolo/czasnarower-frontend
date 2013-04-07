/*jshint unused:false */
/*global google, MarkerClusterer, InfoBox */
define(function() {
  return function(facade, $) {

    /**
     * array Maps data
     */
    var _data = [],

    /**
     * object InfoWindow for displaying found location
     */
    locationInfo, locationLabel,

    /**
     * array which keeps info about all markers
     */
    markers = {},

    markerCluster,

    /**
     * object LatLngBounds polyBounds for keeping information about current
     * polys bounds
     */
    markersBounds,

    /**
     * object Geocoder:
     */
    geocoder,

    _googleMapsLoaded = false;

    var _initializeMap = function(data) {

      /** set center Poland point */
      var mapElem = document.getElementById(data.id);
      var map = new google.maps.Map(mapElem, {
        streetViewControl : false,
        mapTypeId : google.maps.MapTypeId.ROADMAP,
        scrollwheel : false
      });
      if (data.users_data) {
        _createUsersData(map, data);
      }

      $('#btnGeocode').click(function() {
        _codeAddress(map);
      });

      $('#searchAddress').keypress(function(e) {
        if (e.which === 13) {
          _codeAddress(map);
        }
      }).focus(function(e) {
        if ($(this).hasClass('tip')) {
          $(this).removeClass('tip').val('');
        }
      });
    };

    var _createUsersData = function(map, data) {
      var latitude = 52.066667;
      var longitude = 19.483333;
      var user_data = {};

      if (data.selected) {
        user_data = data.users_data[Number(data.selected)];
        latitude = user_data.latitude;
        longitude = user_data.longitude;
      }
      var centerLatLng = new google.maps.LatLng(latitude, longitude);
      map.setCenter(centerLatLng);

      var mode = data.mode || 0;
      markerCluster = new MarkerClusterer(map, [], {
        gridSize : 50,
        maxZoom : 11
      });
      $.each(data.users_data, function(i, user_data) {
        var latLng = new google.maps.LatLng(user_data.latitude, user_data.longitude);
        var src = facade.config.staticUrl + 'img-1.3/markers/iconset-1.png';
        var pos = {
          x : 0,
          y : 32
        };
        if (!mode) {
          pos = {
            x : 0,
            y : 0
          };
        } else if (Number(i) === Number(data.signed)) {
          pos = {
            x : 20,
            y : 32
          };
        }

        var img = new google.maps.MarkerImage(src, new google.maps.Size((mode ? 20 : 32), (mode ? 20 : 32)), new google.maps.Point(pos.x, pos.y), new google.maps.Point((mode ? 10 : 16), (mode ? 10
            : 16)));

        var marker = _marker(map, user_data, {
          position : latLng,
          id : Number(i),
          icon : img,
          map : null
        });
        markersBounds.extend(latLng);
        markers[Number(i)] = (marker);
        markerCluster.addMarker(marker);
      });
      markerCluster = new MarkerClusterer(map, markers, {
        maxZoom : 11,
        gridSize : 50,
        zoomOnClick : true
      });
      if (data.selected) {
        _zoomUserData(map, markers[data.selected]);
      } else {
        map.fitBounds(markersBounds);
      }

    };

    /**
     * method for creating new google-maps-marker object and - binds proper
     * events
     */
    var _marker = function(map, user_data, opts) {
      var defaults = {
        map : map
      };

      $.extend(defaults, opts);
      var marker = new google.maps.Marker(defaults);

      var content = '<div class="previewBox user' + (user_data.avatar_file_name ? ' avatar' : '') + '"><span class="arrowTop">&nbsp;</span>';
      if (user_data.avatar_file_name) {
        content += '<aside class="pull-left"><a href="' + user_data.url_view + '" class="userPict thumbnail"><img src="' + (user_data.avatar_file_name) + '" width="50" height="50"/></a></aside>';
      }
      content += '<div><h5><a title="Przejdź do strony użytkownika" href="' + user_data.url_view + '"/>' + user_data.nick + '</a></h5>';
      content += '';
      if (user_data.first_name) {
        content += '<p>' + user_data.first_name + '</p>';
      }
      if (user_data.city) {
        content += '<p>' + user_data.city + '</p>';
      }
      content += '<h6 class="pull-right"><a title="Przejdź do strony użytkownika" href="' + user_data.url_view + '"/>więcej &raquo;</a></h6>';
      content += '</div></div>';

      marker.content = content;
      google.maps.event.addListener(marker, 'mouseover', function(event) {
        locationLabel.close();
        locationLabel.setOptions({
          content : '<div class="labelBox"><span class="arrowTop">&nbsp;</span><h5>' + user_data.nick + ' <small> &raquo; kliknij w ikonę</small></h5></div>',
          position : marker.getPosition()
        });
        locationLabel.open(map, marker);
      });
      google.maps.event.addListener(marker, 'mouseout', function(event) {
        locationLabel.close();
      });
      google.maps.event.addListener(marker, 'click', function(event) {

        locationInfo.close();
        locationInfo.setOptions({
          content : content,
          position : marker.getPosition()
        });

        locationInfo.open(map, marker);
      });

      return marker;
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
        if (status === google.maps.GeocoderStatus.OK) {
          if (results.length === 1) {
            var location = _formatGeocoderResult(results[0]);
            _zoomLocation(map, location);

          } else if (results.length > 1) {
            var locations = [];
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
      var outDiv = $('#geoAddresses');
      outDiv.empty();

      if (locations.length) {
        txt = '<p><small>Zostało znalezionych kilka pasujących adresów, kliknij na wybrany link aby zaznaczyć na mapie:</small></p>';
        $.each(locations, function(i, location) {
          txt += '<p class="location" id="location_' + i + '">' + location.name + '</p>';
        });
        outDiv.html(txt);

        $('.location').click(function() {
          var ind = (this.id).split('_')[1];
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
    var _zoomUserData = function(map, marker) {
      // map.setCenter( marker.getPosition() );
      map.setZoom(12);
      locationInfo.close();
      locationInfo.setOptions({
        content : marker.content,
        position : marker.getPosition()
      });
      locationInfo.open(map, marker);
    };

    return {
      init : function(data) {
        facade.listen('map-initialised', this.mapInitialised, this);
        facade.listen('users-data-view-register-map', this.registerMap, this);
        facade.listen('user-signed-out', this.updateMemberSignedOut, this);
        facade.listen('user-signed-in', this.updateMemberSignedIn, this);
      },
      mapInitialised : function() {
        geocoder = new google.maps.Geocoder();
        markersBounds = new google.maps.LatLngBounds();
        var opt = {
          disableAutoPan : false,
          maxWidth : 0,
          pixelOffset : new google.maps.Size(0, 5),
          zIndex : null,
          closeBoxMargin : "10px 4px 2px 2px",
          closeBoxURL : "http://www.google.com/intl/en_us/mapfiles/close.gif",
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
        if (!messageInfo.data.id || (!messageInfo.data.users_data)) {
          return;
        }
        _data.push(messageInfo.data);
        if (_googleMapsLoaded) {
          _initializeMap(messageInfo.data);
        }
      },

      updateMemberSignedIn : function(messageInfo) {
        var user = messageInfo.data, id = 0;
        // check if user is on the member list
        var matching = $('#schedule_members .cnr-attendee[data-user-id=' + user.id + '], #results tr[data-user-id=' + user.id + ']');
        if (matching.size()) {
          $('#join_event_btn').hide();
          id = matching.first().attr('data-id');
          $('#leave_event_btn .removeActivity').attr('data-id', id);
          $('#leave_event_btn').show();
        } else {
          $('#join_event_btn').show();
          $('#leave_event_btn').hide();
        }
      },
      updateMemberSignedOut : function(messageInfo) {
        $('#join_event_btn').show();
        $('#leave_event_btn').hide();
        $('#leave_event_btn .removeActivity').attr('data-id', '');
        $('.addActivity, .addResult').show();
      },

      destroy : function() {}
    };
  };
});
