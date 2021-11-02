/*jshint maxstatements:50, maxcomplexity:15, unused:false, strict:false */
/*global google, tinymce */
define(function() {
  return function(sandbox, $) {

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
    draft = true,

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
     * @param {Object} x1
     * @param {Object} y1
     * @param {Object} x2
     * @param {Object} y2
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
          mapTypeIds : [ google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN, 'sigma', 'osm' ],
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
        icon : new google.maps.MarkerImage(sandbox.config.staticUrl + 'img-1.3/markers/iconset-1.png', new google.maps.Size(17, 22), new google.maps.Point(667, 0), new google.maps.Point(3, 20)),
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
        addPoints(polyCoords);
      }

      bindForm();
    }

    function displayPoly() {
      clearMap();
      var simplifyPath = function( points, tolerance ) {
        // helper classes 
        var Vector = function( x, y ) {
          this.x = x;
          this.y = y;
          
        };
        var Line = function( p1, p2 ) {
          this.p1 = p1;
          this.p2 = p2;
          
          this.distanceToPoint = function( point ) {
            // slope
            var m = ( this.p2[1] - this.p1[1] ) / ( this.p2[0] - this.p1[0] ),
              // y offset
              b = this.p1[1] - ( m * this.p1[0] ),
              d = [];
            // distance to the linear equation
            d.push( Math.abs( point[1] - ( m * point[0] ) - b ) / Math.sqrt( Math.pow( m, 2 ) + 1 ) );
            // distance to p1
            d.push( Math.sqrt( Math.pow( ( point[0] - this.p1[0] ), 2 ) + Math.pow( ( point[1] - this.p1[1] ), 2 ) ) );
            // distance to p2
            d.push( Math.sqrt( Math.pow( ( point[0] - this.p2[0] ), 2 ) + Math.pow( ( point[1] - this.p2[1] ), 2 ) ) );
            // return the smallest distance
            return d.sort( function( a, b ) {
              return ( a - b ); //causes an array to be sorted numerically and ascending
            } )[0];
          };
        };
        
        var douglasPeucker = function( points, tolerance ) {
          if ( points.length <= 2 ) {
            return [points[0]];
          }
          var returnPoints = [],
            // make line from start to end 
            line = new Line( points[0], points[points.length - 1] ),
            // find the largest distance from intermediate poitns to this line
            maxDistance = 0,
            maxDistanceIndex = 0,
            p;
          for( var i = 1; i <= points.length - 2; i++ ) {
            var distance = line.distanceToPoint( points[ i ] );
            if( distance > maxDistance ) {
              maxDistance = distance;
              maxDistanceIndex = i;
            }
          }
          // check if the max distance is greater than our tollerance allows 
          if ( maxDistance >= tolerance ) {
            p = points[maxDistanceIndex];
            line.distanceToPoint( p, true );
            // include this point in the output 
            returnPoints = returnPoints.concat( douglasPeucker( points.slice( 0, maxDistanceIndex + 1 ), tolerance ) );
            // returnPoints.push( points[maxDistanceIndex] );
            returnPoints = returnPoints.concat( douglasPeucker( points.slice( maxDistanceIndex, points.length ), tolerance ) );
          } else {
            // ditching this point
            p = points[maxDistanceIndex];
            line.distanceToPoint( p, true );
            returnPoints = [points[0]];
          }
          return returnPoints;
        };
        var arr = douglasPeucker( points, tolerance );
        // always have to push the very last point on so it doesn't get left off
        arr.push( points[points.length - 1 ] );
        return arr;
      };

      if (polyCoords.length) {
        var latlngs = [];
        
        var simplifiedLinePath = simplifyPath(polyCoords, 0.00015);
        addPoints(simplifiedLinePath);
      }
    }

    function initializeUploadForm(messageInfo) {
      var data = messageInfo.data;
      $("#track_path").fileinput({
        browseLabel: "Wybierz plik .gpx",
        showPreview: false,
        language: "pl",
        theme: "gly",
        layoutTemplates: {
          main2: '{preview}\n{remove}\n{cancel}\n{upload}\n{browse}\n',
          main1: '{preview}\n' +
            '<div class="input-group {class}">\n' +
            '   {caption}\n' +
            '   <div class="input-group-btn">\n' +
            '       {remove}\n' +
            '       {cancel}\n' +
            '       {upload}\n' +
            '       {browse}\n' +
            '   </div>\n' +
            '</div>'
        },
        showRemove: false,
        uploadAsync: true,
        uploadExtraData: data.params,
        uploadUrl: "ajax"
      }).on('fileuploaded', function(event, data, previewId, index) {
        var response = data.response;
        console.log(response);
        $('#gpx_field .help-block').html(response.result.sMessage);
        if (!response.result.iStatus) {
          sandbox.notify({
            type: 'display-poly',
            data: response.result.params.track_locations
          });
          sandbox.notify({type: 'set-file-src',
            data: response.result.params.tmp_file_src
          });
        } else {
          $('#gpx_field').addClass('has-error has-danger');
        }
      }).on('filebatchselected', function(event, numFiles, label) {
        $('#gpx_field').removeClass('has-error has-danger');
        $('#gpx_field .help-block').html('');
      }).on('fileuploaderror', function(event, data, msg) {
        var response = data.response;
        $('#gpx_field .help-block').html(response.result.sMessage);
        $('#gpx_field').addClass('has-error has-danger');
      });
    }

    function initializeForm() {

      $('#track_form').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
          return false;
        } else {
          e.preventDefault();
          saveTrack(draft ? $('#track_draft_submit') : $('#track_submit'));
        }
      });

      $('#track_submit').on('click', function() {
        $('#validation_communique').removeClass('alert alert-error error').html('');
        draft = false;
        $('#track_form').submit();
      });

      $('#track_draft_submit').on('click', function() {
        $('#validation_communique').removeClass('alert alert-error error').html('');
        draft = true;
        $('#track_form').submit();
      });
    }

    /**
     * binding events with form elements
     */
    function bindForm() {

      $('#track_locations_form').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
          return false;
        } else {
          e.preventDefault();
          if (validateTrackLocations()) {
            getCoordinates();
          }
        }
      });

      $('#track_location_submit').on('click', function() {
        $('#validation_communique').removeClass('alert alert-error error').html('');
        $('#track_field .help-block').removeClass('has-danger has-error').html('');
        $('#track_locations_form').submit();
      });

      $('#btnGeocode').on('click', function() {
        codeAddress();
      });

      $('#searchAddress').on('keypress', function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode === '13'){
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
      var img = new google.maps.MarkerImage(sandbox.config.staticUrl + 'img-1.3/markers/iconset-1.png', new google.maps.Size(17, 22), new google.maps.Point(684, 0), new google.maps.Point(3, 20));
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
     * @param {Number} startIndex - index where to start moving elements
     * @param {Number} shift - how far should be markers moved
     * @param {Array} of markers which should be insert starting from startIndex
     *          point
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
     * @param {Number} startIndex - index where to start moving elements
     * @param {Number} shift - how far should be poly moved
     * @param {Array} of poys which should be insert starting from startIndex
     *          point
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
     *
     */
    function getTrackParams() {
      var difficulty = $('input[name="difficulty"]:checked');
      var categories = $('input[name="category"]:checked');
      var categoriesVal = [];
      if (categories.length) {
        categories.each(function(i) {
          categoriesVal.push($(this).val());
        });
      }

      return {
        title : $('#track_title').val(),
        description : (typeof(tinymce) !== "undefined") ? tinymce.activeEditor.getContent() : $("#track_description").val(),
        difficulty : (difficulty.length ? difficulty.val() : 0),
        categories : categoriesVal,
        tags : $('#track_tags').val(),
        start_place : $('#track_start_place').val(),
        distance : $('#track_distance').val(),
        fb_publish : $('#fb_publish').prop('checked'),
        special_highlighted : $('#special_highlighted').prop('checked'),
        special_tag_silvini : $('#special_tag_silvini').prop('checked'),
        special_tag_autumn_contest:  $('#special_tag_autumn_contest').prop('checked'),
        special_tag_dworelizy_contest: $('#special_tag_dworelizy_contest').prop('checked'),
        track_id: $('#track_id').val(),
        draft: draft
      };
    }
    /**
     *
     */
    function validateTrackLocations() {

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
        $('.map-box').parent('.form-group').addClass('has-error has-danger');
        $('.map-box').parent('.form-group').find('.help-block.with-errors').html('Trasa musi mieć minimum ' + MIN_TRACK_LOCATIONS + ' punktów aby została zapisana.');
        return false;
      }
      return true;
    }

    /**
     *
     */
    function getCoordinates() {

      var button = $('#track_location_submit');
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

      /*
      if (path.length < MIN_TRACK_LOCATIONS) {
        $('#validation_communique').html('Trasa musi mieć minimum ' + MIN_TRACK_LOCATIONS + ' punktów aby została zapisana.').show();
        return false;
      }
      */

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
          saveCoordinates(button, params);
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
          saveCoordinates(button, params);
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
    function saveCoordinates(button, path) {
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

      button.button('loading');
      sandbox.ajax({
        type : 'POST',
        data : urlData,
        dataType : 'json',
        url : 'ajax',
        cache : false
      }).done(function(data) {
        // no errors, everything is fine
        if (!data.result.iStatus) {
          if (data.result.track.id && !params['track_id']) {
            $('#track_id').val(data.result.track.id);
            $('#track_location_id').val(data.result.track_location.id);
            history.pushState({}, 'Edycja trasy rowerowej', data.result.url.edition);
          }
          $('#validation_communique').addClass("alert alert-success").html(
          data.result.sMessage);
          if (data.result.sRedirect) {
            window.location = data.result.sRedirect;
          } else {
            modified = false;
            fileSrc = '';
          }
        } else {
          var aErrors = [];
          if (data.errors) {
            $.each(data.errors, function(key, err) {
              var formElem = $('[name="' + key + '"]').closest('.control-group');
              formElem.find('.help-block.with-errors').html(err);
              formElem.addClass('has-error has-danger');
            });
          }
          $('#validation_communique').addClass("alert alert-error").html(data.result.sMessage);
        }
      }).always(function() {
        button.button('reset');
      });
    }

    /**
     * save track
     */
    function saveTrack(button) {
      button.button('loading');
      var params = getTrackParams();
      if (!params) {
        button.button('reset');
        return false;
      }
      
      sandbox.ajax({
        cache : false,
        data : {
          dao : 13,
          action : 2,
          dataType : 'json',
          params : JSON.stringify(params)
        },
        dataType : 'json',
        type : 'POST',
        url : 'ajax'
      }).done(
          function(data) {
            if (!data.result.iStatus) {
              // no errors, everything is fine
              if (!draft) {
                $('#validation_communique').addClass("alert alert-success").html(
                  data.result.sMessage);
                window.location = data.url.preview;
              } else {
                $('#validation_communique').addClass("alert alert-success").html(
                  data.result.sMessage +
                  (data.url && data.url.preview ? (" | <a href='" + data.url.preview + "'>Wyświetl podgląd</a>") : "") +
                  (data.url && data.url.manage_photos ? (" | <a href='" + data.url.manage_photos + "'>Dodaj zdjęcia</a>") : "")
                );
              }
            } else {
              if (data.errors) {
                $.each(data.errors, function(key, err) {
                  var formElem = $('[name="' + key + '"]').closest('.control-group');
                  formElem.find('.help-block.with-errors').html(err);
                  formElem.addClass('has-error has-danger');
                });
              }
              $('#validation_communique').addClass("alert alert-error").html(data.result.sMessage);
            }
          }).always(function() {
        button.button('reset');
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
        sandbox.dialog({
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
        sandbox.listen('map-initialised', this.mapInitialised, this);
        sandbox.listen('init-track-form', this.initForm, this);
        sandbox.listen('set-poly-cords', this.setPolyCoords, this);
        sandbox.listen('init-track-upload-form', this.initUploadForm, this);
        sandbox.listen('set-file-src', this.setFileSrc, this);
        sandbox.listen('display-poly', this.displayPoly, this);
        sandbox.listen('track-creator-error', this.showError, this);
      },
      mapInitialised : function() {
        initialize();
      },
      initForm : function() {
        initializeForm();
      },
      initUploadForm: function(messageInfo){
        sandbox.requireScripts(['js/fileinput/fileinput_pl.js', 'js/fileinput/fileinput_theme.js'], function() {
            initializeUploadForm(messageInfo);
          });
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
