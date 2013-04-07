/*jshint maxstatements:50, unused:false */
/*global google */
define(function() {
  return function(facade, $) {

    /**
     * directions services for handling autoRoute parts of track, first one for
     * new point, another two when marker is dragened
     */
    var ds1, ds2, ds3,

    /**
     * 
     */
    polyCoords = [],

    /**
     * array with main markers which connect direction-tracks and simple
     * polylines
     */
    aMarkers = [],

    /**
     * array with main pieces of track separated by main markers
     */
    aPolys = [],

    /**
     * object LatLngBounds polyBounds for keeping information about current
     * polys bounds
     */
    polysBounds,
    /**
     * unique index assigned to every new marker
     */
    markerId = 0,

    /**
     * unique index assigned to every new polyline
     */
    polyId = 0,

    /**
     * 
     */
    tmpMarker1,
    /**
     * 
     */
    tmpMarker2,

    /**
     * object Geocoder:
     */
    geocoder,

    /**
     * object InfoWindow for displaying found location
     */
    locationInfo,

    /**
     * 
     */
    last_index = 0,

    /**
     * object Map
     */
    map,

    /**
     * 
     */
    draft,

    /**
     * if track is loaded from gpx, this variable should point at temporary gpx
     * file
     */
    fileSrc = '',

    /**
     * set this flag TRUE when user put or drag point on map
     */
    modified = false,

    /**
     * Required MIN TRACK LOCATIONS to save path
     */
    MIN_TRACK_LOCATIONS = 10;

    /**
     * 
     * @param {Object}
     *          x1
     * @param {Object}
     *          y1
     * @param {Object}
     *          x2
     * @param {Object}
     *          y2
     */
    function Line(x1, y1, x2, y2) {

      if (y2 === undefined) {
        this.a = x1;
        this.b = y1;
        this.c = x2;
      } else {
        this.a = y2 - y1;
        this.b = x1 - x2;
        this.c = (x2 * y1) - (x1 * y2);
      }
    }

    Line.prototype.distance = function(x, y) {
      return Math.abs(this.a * x + this.b * y + this.c) / Math.sqrt(this.a * this.a + this.b * this.b);
    };

    function arrayTop(elements) {
      if (!elements.length) {
        return null;
      }
      var t = elements.pop();
      elements.push(t);
      return t;
    }

    function initialize() {

      var dsOpt = {
        unitSystem : google.maps.DirectionsUnitSystem.METRIC,
        avoidHighways : true,
        avoidTolls : true
      };

      ds1 = new google.maps.DirectionsService(dsOpt);
      ds2 = new google.maps.DirectionsService(dsOpt);
      ds3 = new google.maps.DirectionsService(dsOpt);

      geocoder = new google.maps.Geocoder();

      polysBounds = new google.maps.LatLngBounds();

      locationInfo = new google.maps.InfoWindow();

      /** set center Poland point */
      map = new google.maps.Map(document.getElementById("map"), {
        zoom : 10,
        streetViewControl : false,
        mapTypeId : google.maps.MapTypeId.ROADMAP,
        scrollwheel : false,
        center : new google.maps.LatLng(52.066667, 19.483333)
      });

      var cyclemapRenderer = new google.maps.ImageMapType({
        getTileUrl : function(ll, z) {
          var X = ll.x % (1 << z);
          return "http://a.tile.opencyclemap.org/cycle/" + z + "/" + X + "/" + ll.y + ".png";
        },
        tileSize : new google.maps.Size(256, 256),
        isPng : true,
        maxZoom : 18,
        name : "OSM Cycle",
        alt : "Open Streetmap CycleMap"
      });

      map.mapTypes.set('cyclemap', cyclemapRenderer);

      var osmmapRenderer = new google.maps.ImageMapType({
        getTileUrl : function(ll, z) {
          var X = ll.x % (1 << z);
          return "http://osm.trail.pl/" + z + "/" + X + "/" + ll.y + ".png";
        },
        tileSize : new google.maps.Size(256, 256),
        isPng : true,
        maxZoom : 18,
        name : "OSM-Topo",
        alt : "Open Streetmap"
      });

      map.mapTypes.set('osm', osmmapRenderer);
      var optionsUpdate = {
        mapTypeControlOptions : {
          mapTypeIds : [ google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN, 'cyclemap', 'osm' ],
          style : google.maps.MapTypeControlStyle.DEFAULT
        }
      };
      map.setOptions(optionsUpdate);

      google.maps.event.addListener(map, 'click', function(event) {
        var latLng = event.latLng;
        handleNewPoint(latLng);
        modified = true;
      });

      /**
       * initialize fake markers: used for inserting new points between existing
       * ones
       */
      var markerOpt = {
        map : map,
        visible : false,
        draggable : true,
        icon : new google.maps.MarkerImage(facade.config.staticUrl + 'img-1.3/markers/iconset-1.png', new google.maps.Size(17, 22), new google.maps.Point(667, 0), new google.maps.Point(3, 20)),
        title : 'Przeciągnij, aby dostawić punkt'
      };

      tmpMarker1 = new google.maps.Marker(markerOpt);
      google.maps.event.addListener(tmpMarker1, 'dragend', function(event) {
        dividePoly(tmpMarker1);
        modified = true;
      });

      tmpMarker2 = new google.maps.Marker(markerOpt);
      google.maps.event.addListener(tmpMarker2, 'dragend', function(event) {
        dividePoly(tmpMarker2);
        modified = true;
      });

      if (polyCoords.length) {
        // alert( polyCoords.length + ' and optimized: ' + (optimizePath(
        // polyCoords )).length );
        // addPoints( optimizePath( polyCoords ) );
        addPoints(polyCoords);
      }

      bindForm();
    }

    function displayPoly() {
      clearMap();
      if (polyCoords.length) {
        addPoints(optimizePath(polyCoords));
      }
    }

    function initializeForm() {
      $('#track_submit').click(function() {
        $("#success_communique").remove();
        $(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
        draft = false;
        saveTrack();
      });

      $('#track_draft_submit').click(function() {
        $("#success_communique").remove();
        $(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
        draft = true;
        saveTrack();
      });

    }

    /**
     * binding events with form elements
     */
    function bindForm() {
      $('#btnGeocode').click(function() {
        codeAddress();
      });

      $('#searchAddress').keypress(function(e) {
        if (e.which === '13') {
          codeAddress();
        }
      });

      $('#btnClosePath').click(function() {
        closePath();
      });

      $('#btnSetArea').click(function() {
        fitPolysBounds();
      });

      $('#btnClear').click(function() {
        if (aMarkers.length) {
          modified = true;
        }
        clearMap();
      });
      $('#btnReversePath').click(function() {
        if (aMarkers.length) {
          modified = true;
        }
        reversePath();
      });

      $('#autoRouteLabel').click(function() {
        var checked = $('#autoRoute').prop('checked');
        $('#autoRoute').attr('checked', !checked);
      });

      $('#track_location_submit').click(function() {
        $("#success_communique").remove();
        $(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
        draft = false;
        if (validateTrackLocations()) {
          getCoordinates();
        }
      });

      $('#track_location_draft_submit').click(function() {
        $("#success_communique").remove();
        $(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
        draft = true;
        if (validateTrackLocations()) {
          getCoordinates();
        }
      });

      $('#track_title').blur(function() {
        var title = $(this).val();
        var aTitle = title.split(' ');
        if (aTitle.length < 2) {
          $(this).closest('.control-group').addClass('alert error alert-error');
          $('#title_communique').html('<span>Tytuł powinien się składać przynajmniej z 2 wyrazów i 5 liter</span>').show();
        }
        if (title.length < 5 || title.length > 80) {
          $(this).closest('.control-group').addClass('alert error alert-error');
          $('#title_communique').html('<span>Tytuł powinien się składać przynajmniej z 2 wyrazów i 5 liter</span>').show();
        }
      }).focus(function() {
      // $(this).closest('.control-group').removeClass('alert error
      // alert-error');
      // $('#title_communique').hide();
      });
    }

    /**
     * every new added point must be handled put marker on the map create new
     * poly and add to the map
     */
    function handleNewPoint(latLng, _autoRoute) {
      var marker;
      var autoRoute = (_autoRoute !== undefined) ? _autoRoute : $('#autoRoute').prop('checked');
      // IF markers array is empty add new Point and that is ALL.
      if (!aMarkers.length) {
        marker = _marker({
          position : latLng
        });
        marker.mainId = aMarkers.length;
        aMarkers.push(marker);
        return;
      }

      if (autoRoute) {
        // IF at least ONE marker exists run directionService and compute route
        // beetwen last marker and current point
        marker = arrayTop(aMarkers);
        var request = {
          origin : marker.getPosition(),
          destination : latLng,
          travelMode : google.maps.DirectionsTravelMode.WALKING
        };
        ds1.route(request, ds1_response);
      }

      else {
        var startMarker = arrayTop(aMarkers);
        var poly = _poly({
          path : [ startMarker.getPosition(), latLng ]
        });
        marker = _marker({
          position : latLng
        });
        poly.markers = [ startMarker, marker ];
        startMarker.polyId = poly.id;
        marker.polyId = poly.id;
        marker.mainId = aMarkers.length;
        aMarkers.push(marker);
        aPolys.push(poly);
        calculateDistance();
      }
    }

    /**
     * */
    function addPoints(latLngs) {

      $.each(latLngs, function(i, val) {
        var latLng = new google.maps.LatLng(val[0], val[1]);
        handleNewPoint(latLng, false);
      });
      fitPolysBounds();
    }
    /**
     * method for creating new google-maps-marker object and - binds proper
     * events - sets unique id
     */
    function _marker(opts) {
      // TODO: select proper ICON
      var img = new google.maps.MarkerImage(facade.config.staticUrl + 'img-1.3/markers/iconset-1.png', new google.maps.Size(17, 22), new google.maps.Point(684, 0), new google.maps.Point(3, 20));
      var defaults = {
        map : map,
        draggable : true,
        icon : img,
        title : 'Kliknij, aby usunąć'
      };

      $.extend(defaults, opts);
      var marker = new google.maps.Marker(defaults);
      marker.id = markerId++;

      google.maps.event.addListener(marker, 'dragend', function(event) {
        updateDragened(marker);
        modified = true;
      });

      google.maps.event.addListener(marker, 'click', function(event) {
        removeMarker(marker);
        modified = true;
      });

      google.maps.event.addListener(marker, 'mouseover', function(event) {
        showIndirectMarkers(marker);
      });

      return marker;
    }

    /**
     * method for creating new google-maps-polyline object and - sets unique id
     */
    function _poly(opts) {
      var defaults = {
        map : map,
        strokeColor : '#ff0000',
        strokeOpacity : 0.6,
        strokeWeight : 5
      };
      $.extend(defaults, opts);
      var poly = new google.maps.Polyline(defaults);
      poly.id = polyId++;
      poly.pathLength = google.maps.geometry.spherical.computeLength(poly.getPath());

      return poly;
    }

    /**
     * update poly path
     */
    function _polyPath(index, path) {
      var poly = aPolys[index];

      poly.setMap(null);
      poly.setPath(path);
      poly.setMap(map);
      poly.pathLength = google.maps.geometry.spherical.computeLength(path);
      showIndirectMarkers(aMarkers[last_index]);

      calculateDistance();
      return poly;
    }
    /**
     * method which handles directionsService in case of adding new point at the
     * end of track if status is OK - create new marker and add to the aMarkers
     * array - create new poly and add it to the aPolys array, set
     * polly.autoRoute=TRUE else - ?
     */
    function ds1_response(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        var a_route = response.routes[0].overview_path;

        // make sure that beginning of route is joined with marker!
        a_route.unshift(aMarkers[aMarkers.length - 1].getPosition());

        var n = a_route.length;
        var p = a_route[n - 1];
        var marker = _marker({
          position : p
        });
        marker.mainId = aMarkers.length;
        aMarkers.push(marker);
        var poly = _poly({
          path : a_route
        });
        poly.autoRoute = true;
        poly.bounds = response.routes[0].bounds;
        aPolys.push(poly);
        calculateDistance();
      } else {
        // TODO:handle PATH NOT UPDATED~!
        // console.debug( status );
      }
    }
    function ds2_response(response, status) {

      if (status === google.maps.DirectionsStatus.OK) {
        var a_route = response.routes[0].overview_path;
        var n = a_route.length;
        var p = a_route[n - 1];
        // make sure that end of route is joined with marker!
        a_route.push(aMarkers[last_index].getPosition());

        _polyPath(last_index - 1, a_route);
        aPolys[last_index - 1].bounds = response.routes[0].bounds;
      } else {
        // TODO:handle PATH NOT UPDATED~!
        // console.debug( status );
      }
    }
    function ds3_response(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        var a_route = response.routes[0].overview_path;
        var n = a_route.length;
        var p = a_route[0];
        // make sure that beginning of route is joined with marker!
        a_route.unshift(aMarkers[last_index].getPosition());
        _polyPath(last_index, a_route);
        aPolys[last_index].bounds = response.routes[0].bounds;
      } else {
        // TODO:handle PATH NOT UPDATED~!
        // console.debug( status );
      }
    }

    /**
     * this metod updates paths when one of markers is dragened
     */
    function updateDragened(marker) {
      // if marker is in main array of markers - IT IS ALWAYS IN THIS
      // IMPLEMENTATION
      var index = marker.mainId;
      last_index = marker.mainId;

      aMarkers[index].setPosition(marker.getPosition());

      updatePoly(index - 1, ds2_response);
      updatePoly(index, ds3_response);
    }

    /**
     * this method updates polyline
     */
    function updatePoly(index, callback) {

      if (index < 0) {
        return;
      }
      if (index >= aPolys.length) {
        return;
      }

      var poly = aPolys[index];
      var startMarker = aMarkers[index];
      var endMarker = aMarkers[index + 1];

      if (poly.autoRoute) {
        var request = {
          origin : startMarker.getPosition(),
          destination : endMarker.getPosition(),
          travelMode : google.maps.DirectionsTravelMode.DRIVING
        };
        ds2.route(request, callback ? callback : ds3_response);
      }

      else {
        var path = [ startMarker.getPosition(), endMarker.getPosition() ];
        _polyPath(index, path);
      }
    }

    /**
     * method divide poly which has index=marker.polyIndex into 2 parts creates
     * new marker: insert it on position index+1 updates poly[index] creates new
     * poly and insert it on position index+1
     */
    function dividePoly(divisor) {

      var index = divisor.polyIndex;
      var marker = _marker({
        position : divisor.getPosition()
      });
      marker.mainId = index + 1;
      moveMarkers(index + 1, 1, [ marker ]); // insert marker at position
      // index+1
      // and move right following markers

      var poly1 = aPolys[index], poly2, path1, path2;

      if (divisor.divisionIndex) {
        var path = poly1.getPath().getArray();
        path1 = path.slice(0, divisor.divisionIndex + 1);
        path2 = path.slice(divisor.divisionIndex);

        poly2 = _poly({
          path : path2
        });
        poly2.autoRoute = true;

      } else {
        path1 = [ aMarkers[index].getPosition(), aMarkers[index + 1].getPosition() ];
        path2 = [ aMarkers[index + 1].getPosition(), aMarkers[index + 2].getPosition() ];

        poly2 = _poly({
          path : path2
        });
      }
      movePolys(index + 1, 1, [ poly2 ]);
      updateDragened(aMarkers[index + 1]);
    }
    /**
     * 
     */
    function showIndirectMarkers(marker) {
      if (marker) {
        var index = marker.mainId;
        showPolyMiddle(index - 1, tmpMarker1);
        showPolyMiddle(index, tmpMarker2);
      } else {
        tmpMarker1.setVisible(false);
        tmpMarker2.setVisible(false);
      }
    }

    /**
     * 
     */
    function showPolyMiddle(index, m) {
      m.setVisible(false);
      if (index < 0) {
        return;
      }
      if (index >= aPolys.length) {
        return;
      }

      var poly = aPolys[index];
      var mid = getLineMid(aMarkers[index].getPosition(), aMarkers[index + 1].getPosition());
      m.divisionIndex = 0;

      if (poly.autoRoute && poly.getPath().getLength() > 2) {
        var path = poly.getPath();
        var pathLen = path.getLength();
        var mid_index = Math.floor(pathLen / 2);
        m.divisionIndex = mid_index;
        mid = path.getAt(mid_index);
      }

      m.setPosition(mid);
      m.setVisible(true);
      m.setMap(map);
      m.polyIndex = index;
    }

    /**
     * 
     */
    function getLineMid(p1, p2) {
      var midLat = (p1.lat() + p2.lat()) / 2;
      var midLng = (p1.lng() + p2.lng()) / 2;

      return new google.maps.LatLng(midLat, midLng);
    }

    /**
     * this method removes marker and updates related polylines
     */
    function removeMarker(marker) {
      var index = marker.mainId;
      moveMarkers(index, -1);
      movePolys((index - 1 < 0 ? 0 : index - 1), -1);
      showIndirectMarkers();
      calculateDistance();
      last_index = index;
      updatePoly(index - 1, ds2_response);
    }

    /**
     * this method squeezes or expands array of Markers
     * 
     * @param {Number}
     *          startIndex - index where to start moving elements
     * @param {Number}
     *          shift - how far should be markers moved
     * @param {Array}
     *          of markers which should be insert starting from startIndex point
     */
    function moveMarkers(startIndex, shift, ms) {
      var markers = [];
      for ( var i = 0; i < aMarkers.length + (shift > 0 ? shift : 0); i++) {
        if (shift < 0) { // remove abs(shift) elements starting from startIndex
          if (i < startIndex) {
            markers[i] = aMarkers[i];
          } else if (i + shift < startIndex) {
            // remove marker from map
            aMarkers[i].setMap(null);
          } else {
            aMarkers[i].mainId = i + shift;
            markers[i + shift] = aMarkers[i];
          }
        } else { // leave shift elements empty starting from startIndex
          if (i < startIndex) {
            markers[i] = aMarkers[i];
          } else if (i - shift < startIndex) {
            markers[i] = ms[i - startIndex];
          } else {
            aMarkers[i - shift].mainId = i;
            markers[i] = aMarkers[i - shift];
          }
        }
      }
      aMarkers = markers;
    }

    /**
     * this method squeezes or expands array of Polys
     * 
     * @param {Number}
     *          startIndex - index where to start moving elements
     * @param {Number}
     *          shift - how far should be poly moved
     * @param {Array}
     *          of poys which should be insert starting from startIndex point
     */
    function movePolys(startIndex, shift, ps) {
      var polys = [];
      for ( var i = 0; i < aPolys.length + (shift > 0 ? shift : 0); i++) {
        if (shift < 0) { // remove abs(shift) elements starting from startIndex
          if (i < startIndex) {
            polys[i] = aPolys[i];
          } else if (i + shift < startIndex) {
            // remove poly from map
            aPolys[i].setMap(null);
          } else {
            polys[i + shift] = aPolys[i];
          }
        } else { // leave shift elements empty starting from startIndex
          if (i < startIndex) {
            polys[i] = aPolys[i];
          } else if (i - shift < startIndex) {
            // leave empty cells
            polys[i] = ps[i - startIndex];
          } else {
            polys[i] = aPolys[i - shift];
          }
        }
      }
      aPolys = polys;
    }

    function formatGeocoderResult(result) {

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
    }

    /**
     * geocode an address and set map center at the returned latitude and
     * longitude values
     */
    function codeAddress() {
      var address = document.getElementById("searchAddress").value;
      $('#geoAddresses').empty().hide();
      locationInfo.close();
      geocoder.geocode({
        'address' : address
      }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results.length === 1) {
            var location = formatGeocoderResult(results[0]);
            zoomLocation(location);

          } else if (results.length > 1) {
            var locations = [];
            $.each(results, function(i, result) {
              locations.push(formatGeocoderResult(result));
            });
            viewLocationSelect(locations);
          }
        } else {
          viewLocationSelect([]);
        }
      });
    }

    /**
     * 
     */
    function viewLocationSelect(locations) {
      var txt = '';
      var outDiv = $('#geoAddresses');
      outDiv.empty();

      if (locations.length) {
        txt = '<p>Zostało znalezionych kilka pasujących adresów, kliknij na wybrany link aby zaznaczyć na mapie:</p>';
        txt += '<ul>';

        $.each(locations, function(i, location) {
          txt += '<li class="location" id="location_' + i + '">' + location.name + '</li>';
        });
        txt += '</ul>';
        outDiv.html(txt);

        $('.location').click(function() {
          var ind = (this.id).split('_')[1];
          zoomLocation(locations[ind]);
        });
      } else {
        txt = '<p>Lokalizacji nie znaleziono.</p>';
        outDiv.html(txt);
      }
      outDiv.show();
    }

    /**
     * 
     */
    function zoomLocation(location) {
      map.setCenter(location.position);
      map.setZoom(13);

      locationInfo.setContent(location.name);
      locationInfo.setPosition(location.position);

      locationInfo.open(map);
    }

    /**
     * */
    function closePath() {
      if (aMarkers.length > 1) {
        if (!aMarkers[0].getPosition().equals(aMarkers[aMarkers.length - 1].getPosition())) {
          handleNewPoint(aMarkers[0].getPosition());
        }
      }
    }

    /**
     * */
    function reversePath() {
      if (!aPolys.length) {
        return;
      }

      aPolys.reverse();
      $.each(aPolys, function(i, poly) {
        poly.id = i;
        var polyPath = poly.getPath().getArray();
        polyPath.reverse();
        poly.setPath(polyPath);
      });

      aMarkers.reverse();
      $.each(aMarkers, function(i, marker) {
        marker.mainId = i;
      });
    }

    /**
     * */
    function fitPolysBounds() {
      if (!aPolys.length) {
        return;
      }
      polysBounds = new google.maps.LatLngBounds();
      $.each(aPolys, function(i, poly) {
        if (poly.bounds) {
          polysBounds.union(poly.bounds);
        } else {
          polysBounds.extend(aMarkers[i].getPosition());
          polysBounds.extend(aMarkers[i + 1].getPosition());
        }
      });
      map.fitBounds(polysBounds);
    }

    /**
     * */
    function calculateDistance() {
      var distance = 0;
      if (!aPolys.length) {
        return 0;
      }
      $.each(aPolys, function(i, poly) {
        distance += poly.pathLength;
      });

      distance = Math.round(distance / 10) / 100;
      $('#track_distance').val(distance);
      return distance;
    }

    /**
     * Clears all markers and path
     */
    function clearMap() {

      $.each(aMarkers, function(i, marker) {
        marker.setMap(null);
        delete aMarkers[i];
      });
      aMarkers.length = 0;
      $.each(aPolys, function(i, poly) {
        poly.setMap(null);
        delete aPolys[i];
      });
      aPolys.length = 0;
      $('#track_distance').val(0);
      showIndirectMarkers();
    }

    /**
     * Optimize path
     * 
     * @param array
     *          with path points in RAW format [0]-latitude, [1]-longitude
     * @return array - optimized list of points
     */
    function optimizePath(latLngs) {

      var MAX_DIRECTION_VARIATION = 0.00005;
      var waypoints = [], optimized = [];
      var line = null, i = 0, distance = 0, waypoint = null, lastWaypoint = null;

      for (; i < latLngs.length - 1; i++) {
        waypoint = {
          'latitude' : latLngs[i][0],
          'longitude' : latLngs[i][1]
        };
        if (lastWaypoint !== null && lastWaypoint.latitude === waypoint.latitude && lastWaypoint.longitude === waypoint.longitude) {
          continue;
        }
        if (line === null || line.distance(waypoint.longitude, waypoint.latitude) > MAX_DIRECTION_VARIATION) {
          if (waypoints.length > 1) {
            line = new Line(waypoints[waypoints.length - 2].longitude, waypoints[waypoints.length - 2].latitude, waypoints[waypoints.length - 1].longitude, waypoints[waypoints.length - 1].latitude);
          }
          waypoints.push(waypoint);
          optimized.push(latLngs[i]);
          lastWaypoint = waypoint;
        }
      }
      optimized.push(latLngs[latLngs.length - 1]);
      return optimized;
    }

    /**
     * 
     */
    function validateTrack() {
      var aErrors = [];
      var aParams = {};

      var title = $('#track_title').val();
      var aTitle = title.split(' ');

      var description = $('#track_description').val();
      var aDescription = description.split(' ');
      var start_place = $('#track_start_place').val();
      var distance = $('#track_distance').val();

      var difficulty = $('input[name="difficulty"]:checked');
      var difficultyVal = 0;
      if (difficulty.length) {
        difficulty.each(function(i) {
          difficultyVal = $(this).val();
        });
      }

      var categories = $('input[name="category"]:checked');
      var categoriesVal = [];
      if (categories.length) {
        categories.each(function(i) {
          categoriesVal.push($(this).val());
        });
      }

      var tags = $('#track_tags').val();

      var fb_publish = $('#fb_publish').prop('checked');

      if (aTitle.length < 2 || title.length < 5 || title.length > 80) {
        aErrors.push({
          id : 'title_communique',
          msg : '<span>Tytuł powinien się składać przynajmniej z 2 wyrazów i 5 liter.</span>'
        });
      }
      if (start_place.length < 1) {
        aErrors.push({
          id : 'start_place_communique',
          msg : '<span>Uzupełnij miejsce startu.</span>'
        });
      }

      if (!draft) {
        if (!difficulty.length) {
          aErrors.push({
            id : 'difficulty_communique',
            msg : '<span>Wybierz trudność trasy.</span>'
          });
        }
        if (!categories.length) {
          aErrors.push({
            id : 'category_communique',
            msg : '<span>Zaznacz przynajmniej jedną kategorię.</span>'
          });
        }
        var aWords = [];
        $.each(aDescription, function(i, val) {
          if (val.length > 3) {
            aWords.push(val);
          }
        });
        if (aWords.length < 10 || description.length < 60) {
          aErrors.push({
            id : 'description_communique',
            msg : '<span>Opis trasy powinien się składać z minimum 60 znaków i 10 unikalnych wyrazów.</span>'
          });
        }
      }
      // return false;
      if (aErrors.length) {
        aErrors.push({
          id : 'validation_communique',
          msg : 'Formularz zawiera błędy. Popraw je aby zapisać trasę.'
        });
        // $.each(aErrors, function(i,err){
        // $( '#'+err.id ).html( err.msg ).show();
        // $( '#'+err.id ).closest('.control-group').addClass( 'error alert
        // alert-error');
        // });
        showError({
          noDialog : true,
          errors : aErrors,
          title : 'Błąd',
          content : 'Formularz zawiera błędy. Popraw je aby zapisać opis trasy.'
        });
        return false;
      }
      return {
        title : title,
        description : description,
        difficulty : difficultyVal,
        categories : categoriesVal,
        tags : tags,
        start_place : start_place,
        distance : distance,
        fb_publish : fb_publish
      };
    }
    /**
     * 
     */
    function validateTrackLocations() {

      var aErrors = [];

      var title = $('#track_title').val() || "";
      var aTitle = title.split(' ');

      if (aTitle.length < 2 || title.length < 5 || title.length > 80) {
        aErrors.push({
          id : 'title_communique',
          msg : '<span>Tytuł powinien się składać przynajmniej z 2 wyrazów i 5 liter</span>'
        });
      }

      var path = [];

      if (aMarkers.length) {
        path.push(aMarkers[0].getPosition());
      }

      if (aPolys.length) {
        $.each(aPolys, function(i, poly) {
          var polyPath = poly.getPath().getArray();
          path = path.concat(polyPath.slice(1));
        });
      }
      if (path.length < MIN_TRACK_LOCATIONS) {
        aErrors.push({
          id : 'path_communique',
          msg : '<span>Trasa musi mieć minimum ' + MIN_TRACK_LOCATIONS + ' punktów aby została zapisana.</span>'
        });
      }

      if (aErrors.length) {
        aErrors.push({
          id : 'validation_communique',
          msg : 'Formularz zawiera błędy. Popraw je aby zapisać trasę.'
        });
        showError({
          noDialog : true,
          errors : aErrors,
          title : 'Błąd',
          content : 'Formularz zawiera błędy. Popraw je aby zapisać ślad trasy.'
        });

        return false;
      }
      return true;
    }

    /**
     * 
     */
    function getCoordinates() {

      var path = [];

      var params = {
        geoTags : [],
        startPlace : '',
        country : '',
        administrativeRegion : '',
        distance : calculateDistance(),
        latLngs : [],
        modified : (!modified && ('' !== fileSrc)) || (fileSrc === '' && modified),
        originalGpx : (fileSrc !== '' && !modified) ? true : false
      // MARK THIS VARIABLE TRUE when track is READ FROM GPX and user did not
      // modified it
      };
      if (aMarkers.length) {
        path.push(aMarkers[0].getPosition());
      }

      if (aPolys.length) {
        $.each(aPolys, function(i, poly) {
          var polyPath = poly.getPath().getArray();
          path = path.concat(polyPath.slice(1));
        });
      }

      if (path.length < MIN_TRACK_LOCATIONS) {
        $('#validation_communique').html('Trasa musi mieć minimum ' + MIN_TRACK_LOCATIONS + ' punktów aby została zapisana.').show();
        return false;
      }

      if (path.length) {
        $.each(path, function(i, pt) {
          var point = [ pt.lat(), pt.lng() ];
          params.latLngs.push(point);
        });
      }
      var numGeocoded = 0;
      var limitGeocoded = 4;
      var startGeocoded = false;

      // First GEOCODE start point and set start_place
      var startLatLng = new google.maps.LatLng(path[0].lat(), path[0].lng());
      var startBounds = new google.maps.LatLngBounds(path[0]);
      startBounds.extend(new google.maps.LatLng(path[0].lat() + 0.02, path[0].lng() + 0.04));
      startBounds.extend(new google.maps.LatLng(path[0].lat() - 0.02, path[0].lng() - 0.04));
      startBounds.extend(new google.maps.LatLng(path[0].lat() + 0.02, path[0].lng() - 0.04));
      startBounds.extend(new google.maps.LatLng(path[0].lat() - 0.02, path[0].lng() + 0.04));

      geocoder.geocode({
        'latLng' : startLatLng,
        'bounds' : startBounds
      }, function(results, status) {
        startGeocoded = true;
        if (status === google.maps.GeocoderStatus.OK) {
          for ( var i = 0; i < results.length; i++) {
            var location = formatGeocoderResult(results[i]);
            if (location.administrativeRegion3) {
              params.startPlace = location.administrativeRegion3.long_name;
            }
            if (location.locality) {
              params.startPlace = location.locality.long_name;
            }

            if (location.country) {
              params.country = location.country.long_name;
            }
            if (location.administrativeRegion) {
              params.administrativeRegion = location.administrativeRegion.long_name;
            }

            params.geoTags = params.geoTags.concat(location.raw_tags);
          }
        }
        if (numGeocoded === limitGeocoded && startGeocoded) {
          saveCoordinates(params);
        }
      });

      var cb = function(results, status) {
        numGeocoded++;

        if (status === google.maps.GeocoderStatus.OK) {
          for ( var i = 0; i < results.length; i++) {
            var location = formatGeocoderResult(results[i]);
            params.geoTags = params.geoTags.concat(location.raw_tags);

            if ('' === params.country && location.country) {
              params.country = location.country.long_name;
            }
            if ('' === params.administrativeRegion && location.administrativeRegion) {
              params.administrativeRegion = location.administrativeRegion.long_name;
            }

          }
        }
        if (numGeocoded === limitGeocoded && startGeocoded) {
          saveCoordinates(params);
        }
      };

      var count = limitGeocoded;
      while (count--) {
        var latLng = path[Math.floor(Math.random() * path.length)];
        geocoder.geocode({
          'latLng' : latLng
        }, cb);
      }

      return true;
    }

    /**
     * 
     */
    function saveCoordinates(path) {

      var params = {
        track : path,
        draft : draft,
        track_id : $('#track_id').val(),
        track_location_id : $('#track_location_id').val(),
        title : $('#track_title').val(),
        tmp_file_src : fileSrc
      };
      var urlData = {
        dao : 13,
        action : 1,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      facade.ajax({
        type : 'POST',
        data : urlData,
        dataType : 'json',
        url : 'ajax',
        beforeSend : function() {

        },
        success : function(sData) {
          if (!sData.result.iStatus) {
            $('#track_id').val(sData.result.track.id);
            $('#track_location_id').val(sData.result.track_location.id);

            // no errors, everything is fine
            if (sData.result.sRedirect) {
              window.location = sData.result.sRedirect;
            } else {
              // display alert with proper info
              $('<div id="success_communique" class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>' + sData.result.sMessage + '</div>').insertBefore(
                  '.form-actions');
              modified = false;
              fileSrc = '';
            }
          } else {
            var aErrors = [];
            if (sData.errors) {
              $.each(sData.errors, function(key, err) {
                var id = key.split('_')[1];
                aErrors.push({
                  id : id + "_communique",
                  msg : err
                });
              });
              aErrors.push({
                id : "validation_communique",
                msg : "Formularz zawiera błędy. Popraw je aby zapisać ślad trasy."
              });
            }
            showError({
              noDialog : true,
              title : 'Błąd',
              content : sData.result.sMessage,
              errors : aErrors
            });
          }
        },
        cache : false
      });
    }

    /**
     * save track
     */
    function saveTrack() {

      var params = validateTrack();
      if (!params) {
        return false;
      }
      params['track_id'] = $('#track_id').val();
      params['draft'] = draft;

      var urlData = {
        dao : 13,
        action : 2,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      facade.ajax({
        type : 'POST',
        data : urlData,
        dataType : 'json',
        url : 'ajax',
        beforeSend : function() {

        },
        success : function(sData) {
          // alert( JSON.stringify( sData ));
          if (!sData.result.iStatus) {
            // no errors, everything is fine
            if (sData.result.sRedirect) {
              window.location = sData.result.sRedirect;
            } else {
              $('<div id="success_communique" class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>' + sData.result.sMessage + '</div>').insertBefore(
                  '.form-actions');
            }
          } else {

            var aErrors = [];
            if (sData.errors) {
              $.each(sData.errors, function(key, err) {
                var id = key.split('_')[1];
                aErrors.push({
                  id : id + "_communique",
                  msg : err
                });
              });
              aErrors.push({
                id : "validation_communique",
                msg : "Formularz zawiera błędy. Popraw je aby zapisać trasę."
              });
            }
            showError({
              noDialog : true,
              title : 'Błąd',
              content : sData.result.sMessage,
              errors : aErrors
            });
          }
        },
        cache : false
      });
    }

    /***************************************************************************
     * FOR DEBUG METHODS
     **************************************************************************/
    function debug() {
      outMarkers();
      outPolys();
    }
    function outMarkers() {
      var out = $('#polyline_markers');
      var str = '#markerów: ' + aMarkers.length + '<ul>';
      for ( var i = 0; i < aMarkers.length; i++) {
        var marker = aMarkers[i];
        if (!marker) {
          break;
        }
        str += '<li>' + i + ') lat: ' + marker.getPosition().lat() + ', lng: ' + marker.getPosition().lng() + '; mainId: ' + marker.mainId + '</li>';
      }
      str += '</ul>';
      out.html(str);

    }
    function outPolys() {
      var out = $('#polylines');
      var str = '#polilinii: ' + aPolys.length + '<ul>';
      for ( var i = 0; i < aPolys.length; i++) {
        var poly = aPolys[i];
        if (!poly) {
          break;
        }
        var path = poly.getPath().getArray();
        str += '<li>' + i + ') size: ' + path.length + '</li>';
      }
      str += '</ul>';
      out.html(str);
    }

    function showError(params) {
      if (!params.noDialog) {
        facade.dialog({
          title : params.title,
          content : params.content,
          buttons : [ {
            text : "Popraw",
            click : function() {
              $(this).closest('.modal').modal('hide');
            }
          } ],
          dialogClass : 'alert-error'
        });
      }
      if (params.errors) {
        var aErrors = params.errors;

        $.each(aErrors, function(key, err) {
          $('#' + err.id).html(err.msg).show();
          $('#' + err.id).closest('.control-group').addClass('error alert alert-error');
        });
      }
    }
    return {
      init : function(data) {
        facade.listen('map-initialised', this.mapInitialised, this);
        facade.listen('init-track-form', this.initForm, this);
        facade.listen('set-poly-cords', this.setPolyCoords, this);
        facade.listen('set-file-src', this.setFileSrc, this);
        facade.listen('display-poly', this.displayPoly, this);
        facade.listen('track-creator-error', this.showError, this);
      },
      mapInitialised : function() {
        initialize();
      },
      initForm : function() {
        initializeForm();
      },
      setPolyCoords : function(messageInfo) {
        polyCoords = messageInfo.data;
      },
      setFileSrc : function(messageInfo) {
        fileSrc = messageInfo.data;
      },
      displayPoly : function(messageInfo) {
        polyCoords = messageInfo.data;
        modified = false;
        displayPoly();
      },
      showError : function(messageInfo) {
        showError({
          title : 'Nie udało się wczytać śladu trasy',
          content : messageInfo.data
        });
      },
      destroy : function() {}
    };

  };
});
