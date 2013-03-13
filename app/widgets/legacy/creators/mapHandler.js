/*global Core, google, InfoBox */
Core.Creator.register('mapHandler', function(facade, $) {

  /**
   * array Maps data
   */
  var _data = [],
  /**
   * set it True when all google-maps are loaded
   */
  _googleMapsLoaded = false,
  /**
   * global object with infoBox
   */
  locationInfo,
  /**
   * global marker
   */
  marker,
  
  geocoder;

  var _initializeMap = function(data) {
    var pos;
    var mapElem = document.getElementById(data.id);
    var defaults = {
      center : new google.maps.LatLng(52.066667, 19.483333),
      zoom : 6,
      streetViewControl : false,
      mapTypeId : google.maps.MapTypeId.ROADMAP,
      scrollwheel : false
    };
    var opts = {};
    if (data.location) {
      opts.center = new google.maps.LatLng(data.location.latitude, data.location.longitude);
    }
    if (data.zoom) {
      opts.zoom = data.zoom;
    }
    $.extend(defaults, opts);
    var map = new google.maps.Map(mapElem, defaults);

    if (data.editable) {
      google.maps.event.addListener(map, 'click', function(event) {
        var latLng = event.latLng;
        marker.setPosition(latLng);
        marker.setMap(map);
      });
      google.maps.event.addListener(marker, 'position_changed', function(event) {
        pos = marker.getPosition();
        $('#latitude').val(pos.lat());
        $('#longitude').val(pos.lng());
      });
    }
    if (data.location) {
      _addLocation({
        map : map,
        latitude : data.location.latitude,
        longitude : data.location.longitude
      });
    }
    if (data.city) {
      _codeAddress({
        map : map,
        address : data.city
      });
      $('#searchAddress').val(data.city);
    }
    $('#btnGeocode').click(function() {
      facade.notify({
        type : 'map-handler-code-address',
        data : {
          map : map,
          address : $('#searchAddress').val()
        }
      });
    });

    $('#searchAddress').keypress(function(e) {
      if (e.which === 13) {
        facade.notify({
          type : 'map-handler-code-address',
          data : {
            map : map,
            address : $('#searchAddress').val()
          }
        });
      }
    });
  };

  /**
   * geocode an address and set map center at the returned latitude and
   * longitude values
   */
  var _codeAddress = function(data) {

    var map = data.map;
    var address = data.address;

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

    _addLocation({
      map : map,
      location : location
    });
    var content = '<div class="previewBox"><span class="arrowTop">&nbsp;</span>';
    content += '<p>' + location.name + '</p>';
    content += '</div>';
    locationInfo.close();
    locationInfo.setOptions({
      content : content,
      position : location.position
    });
    locationInfo.open(map, marker);
  };
  /**
   *
   */
  var _addLocation = function(data) {
    var pos;
    var map = data.map;
    if (data.location) {
      pos = data.location.position;
      marker.setOptions({
        position : pos,
        map : map,
        draggable : true
      });
      map.setCenter(pos);

    } else {
      pos = new google.maps.LatLng(data.latitude, data.longitude);
      marker.setOptions({
        position : pos,
        map : map,
        draggable : true
      });
      map.setCenter(pos);
    }
    map.setZoom(13);
  };

  var bindButtons = function() {
    $('.btn.save-location').click(function(e) {
      var serviceName = $(this).data('serviceName');
      var id = +$(this).data('id');
      if ('' === $('#longitude').val() || '' === $('#latitude').val()) {
        facade.dialogError({
          content : 'Lokalizacja nie została zaznaczona na mapie.'
        });
        return;
      }
      var data = {
        item_id : +$(this).data('itemId'),
        longitude : $('#longitude').val(),
        latitude : $('#latitude').val()
      };
      var options = {
        success : function(response) {
          if (response.data.url) {
            window.location.href = response.data.url;
          }
        }
      };
      if (id) {
        facade.rest.update(serviceName, id, data, options);
      } else {
        facade.rest.create(serviceName, data, options);
      }
      e.preventDefault();
      return false;
    });
  };

  return {
    init : function(data) {
      facade.listen('map-initialised', this.mapInitialised, this);
      facade.listen('map-handler-register-map', this.registerMap, this);
      facade.listen('map-handler-code-address', this.codeAddress, this);
      facade.listen('map-handler-add-location', this.addLocation, this);

      bindButtons();
    },
    mapInitialised : function() {
      geocoder = new google.maps.Geocoder();
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

      var markerOpt = {
        draggable : true,
        icon : new google.maps.MarkerImage(facade.config.staticUrl + 'img-1.3/markers/iconset-1.png', new google.maps.Size(17, 22), new google.maps.Point(684, 0), new google.maps.Point(3, 20)),
        title : 'Przeciągnij, aby zmienić lokalizację'
      };

      marker = new google.maps.Marker(markerOpt);
      google.maps.event.addListener(marker, 'drag', function(event) {
        locationInfo.close();
      });
      // --------------------------------------
      var length = _data.length;
      for ( var i = 0; i < length; i++) {
        _initializeMap(_data[i]);
      }
      _googleMapsLoaded = true;
    },
    codeAddress : function(messageInfo) {
      _codeAddress(messageInfo.data);
    },
    addLocation : function(messageInfo) {
      _addLocation(messageInfo.data);
    },
    registerMap : function(messageInfo) {
      _data.push(messageInfo.data);
      if (_googleMapsLoaded) {
        _initializeMap(messageInfo.data);
      }
    },
    destroy : function() {}
  };

});
