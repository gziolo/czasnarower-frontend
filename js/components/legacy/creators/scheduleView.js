/*jshint unused:false, maxcomplexity:50, maxstatements:30, strict:false */
/*global google, InfoBox, MarkerClusterer */
define(function() {
  return function(facade, $) {

    /**
     * array Maps data
     */
    var _data = [],

    /**
     * object InfoWindow for displaying found location
     */
    locationInfo, locationLabel, markerCluster,

    /**
     * object which keeps info about all markers
     */
    markers = {}, visibleMarkers = [],

    groups = {},

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
      if (data.races) {
        _createSchedules(map, data);
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

    var _createSchedules = function(map, data) {
      var schedule = {}, latitude = 52.066667, longitude = 19.483333, zoom = 7,
        minZoomLevel = 6, area;
      
      if (data.selected) {
        schedule = data.races.races[Number(data.selected)];
        latitude = schedule.latitude;
        longitude = schedule.longitude;
      }
      var centerLatLng = new google.maps.LatLng(latitude, longitude);
      map.setCenter(centerLatLng);

      if (data.zoom) {
        zoom = data.zoom;
      }
      map.setZoom(zoom);

      if (data.radius) {
        var circle = new google.maps.Circle({
          center : centerLatLng,
          radius : data.radius
        });
        area = circle.getBounds();

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

      var mode = data.mode || 0;

      $.each(data.races.races, function(i, schedule) {
        var latLng = new google.maps.LatLng(schedule.latitude, schedule.longitude);
        if (!area || area.contains(latLng)) {
          var src = facade.config.staticUrl + 'img-1.3/markers/iconset-1.1.png', anchor = {
            x : 60,
            y : 32
          };

          if (!mode) {
            anchor = _getScheduleAnchor(schedule.category, schedule.past);
          } else if (Number(i) === Number(data.selected)) {
            anchor = {
              x : 380,
              y : 32
            };

          } else {
            anchor = _getScheduleAnchor(schedule.category, 0, 20);
          }
          var img = new google.maps.MarkerImage(src, new google.maps.Size((mode ? 20 : 32), (mode ? 20 : 32)), new google.maps.Point(anchor.x, anchor.y), new google.maps.Point((mode ? 10 : 16),
              (mode ? 10 : 16)));

          var marker = _marker(map, schedule, {
            position : latLng,
            id : Number(i),
            icon : img,
            map: null
            //map : (mode || !schedule.past) ? map : null
          });
          //markersBounds.extend(latLng);
          markers[Number(i)] = marker;
        }
      });

      markerCluster = new MarkerClusterer(map, {
        maxZoom: 11,
        gridSize: 50,
        zoomOnClick: true
      });

      if (data.races.groups) {
        groups = data.races.groups;

        $('.schedule-category,.schedule-past').change(function () {
          _updateSchedulesView(map);
        });

        var categories = $('.schedule-category');
        categories.each(function (i) {

          var category = $(this).val();
          if (groups[category]) {
            $(this).attr('disabled', false);
          }
        });
      }

      //if (data.category) {
      _selectScheduleCategory(data.category, map);
      //}
      if (data.selected) {
        _zoomSchedule(map, markers[data.selected]);
      }
    };

    var _selectScheduleCategory = function (cat, map) {
      var categories = $('.schedule-category');
      if (cat) {
        categories.each(function (i) {

          var category = $(this).val();

          if (category === cat) {
            $(this).attr('checked', true);
          } else {
            $(this).attr('checked', false);
          }
        });
      }
      _updateSchedulesView(map);
    };

    var _updateSchedulesView = function(map) {
      markerCluster.clearMarkers();
      var past = $('#cat-past').prop('checked');
      var categories = $('.schedule-category');
      //markersBounds = new google.maps.LatLngBounds();
      
      visibleMarkers = [];
      
      categories.each(function(i) {
        var category = $(this).val();
        var isChecked = $(this).prop('checked');

        if (groups[category]) {
          if (groups[category][0]) {
            $.each(groups[category][0], function (i, elem) {
              if (isChecked) {
                visibleMarkers.push(markers[elem]);
              }
            });
          }
          if (groups[category][1]) {
            $.each(groups[category][1], function (i, elem) {
              if (isChecked) {
                visibleMarkers.push(markers[elem]);
              }
            });
          }
        }
      });
      
      markerCluster.addMarkers(visibleMarkers);
      
      //map.fitBounds(markersBounds);
    };

    var _getScheduleAnchor = function(cat, past, size) {
      var aAnchors = {
        1 : {
          x : (size ? 340 : 544),
          y : (size ? 32 : 0)
        },
        2 : {
          x : (size ? 300 : 481),
          y : (size ? 32 : 0)
        },
        3 : {
          x : (size ? 260 : 416),
          y : (size ? 32 : 0)
        },
        4 : {
          x : (size ? 220 : 352),
          y : (size ? 32 : 0)
        },
        5 : {
          x : (size ? 60 : 96),
          y : (size ? 32 : 0)
        },
        6 : {
          x : (size ? 802 : 849),
          y : (size ? 32 : 0)
        },
        7 : {
          x : (size ? 140 : 224),
          y : (size ? 32 : 0)
        },
        8 : {
          x : (size ? 100 : 160),
          y : (size ? 32 : 0)
        },
        9 : {
          x : (size ? 60 : 96),
          y : (size ? 32 : 0)
        },
        10 : {
          x : (size ? 60 : 96),
          y : (size ? 32 : 0)
        },
        11 : {
          x : (size ? 723 : 723),
          y : (size ? 32 : 0)
        },
        100 : {
          x : (size ? 762 : 785),
          y : (size ? 32 : 0)
        },
        101 : {
          x : (size ? 360 : 576),
          y : (size ? 32 : 0)
        },
        102 : {
          x : (size ? 320 : 512),
          y : (size ? 32 : 0)
        },
        103 : {
          x : (size ? 280 : 448),
          y : (size ? 32 : 0)
        },
        104 : {
          x : (size ? 240 : 384),
          y : (size ? 32 : 0)
        },
        105 : {
          x : (size ? 80 : 128),
          y : (size ? 32 : 0)
        },
        106 : {
          x : (size ? 822 : 881),
          y : (size ? 32 : 0)
        },
        107 : {
          x : (size ? 160 : 256),
          y : (size ? 32 : 0)
        },
        108 : {
          x : (size ? 120 : 192),
          y : (size ? 32 : 0)
        },
        109 : {
          x : (size ? 80 : 128),
          y : (size ? 32 : 0)
        },
        110 : {
          x : (size ? 782 : 817),
          y : (size ? 32 : 0)
        },
        111 : {
          x : (size ? 742 : 753),
          y : (size ? 32 : 0)
        }
      };
      var index = Number(cat) + (past ? 100 : 0);

      return aAnchors[index];
    };

    /**
     * method for creating new google-maps-marker object and - binds proper
     * events
     */
    var _marker = function(map, schedule, opts) {
      var defaults = {
        map : map
      };

      $.extend(defaults, opts);
      var marker = new google.maps.Marker(defaults);
      marker.past = schedule.past;
      marker.category = schedule.category;

      var content = '<div class="previewBox"><span class="arrowTop">&nbsp;</span>';
      content += '<h5><a title="Przejdź do strony wyścigu" href="' + schedule.url_view + '"/>' + schedule.race_name + '</a></h5>';
      content += '<h6 class="muted">' + schedule.nick + '</h6>';
      content += '<p><i class="icon icon-map-marker"></i> ' + schedule.start_place + ' / ' + schedule.race_sort + '</p>';
      content += '<p><i class="icon-calendar icon"></i> ' + schedule.start_day + '</p>';
      content += '<h6 class="pull-right"><a title="Przejdź do strony wyścigu" href="' + schedule.url_view + '"/>więcej &raquo;</a></h6>';
      content += '</div>';

      marker.content = content;

      google.maps.event.addListener(marker, 'mouseover', function(event) {
        locationLabel.close();
        locationLabel.setOptions({
          content : '<div class="labelBox"><span class="arrowTop">&nbsp;</span><h5>' + (schedule.title.length > 40 ? schedule.title.substring(0, 40) + '...' : schedule.title) +
              ' <small> &raquo; kliknij w ikonę</small></h5></div>',
          position : marker.getPosition()
        });
        locationLabel.open(map, marker);
      });
      google.maps.event.addListener(marker, 'mouseout', function(event) {
        locationLabel.close();
      });

      google.maps.event.addListener(marker, 'click', function(event) {
        locationLabel.close();
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
    var _zoomSchedule = function(map, marker) {
      // map.setCenter( marker.getPosition() );
      map.setZoom(12);
      locationInfo.close();
      locationInfo.setOptions({
        content : marker.content,
        position : marker.getPosition()
      });
      locationInfo.open(map, marker);
    };

    function update() {
      _updateSchedulesView();
    }

    return {
      init : function(data) {
        facade.listen('map-initialised', this.mapInitialised, this);
        facade.listen('schedule-view-register-map', this.registerMap, this);
        facade.listen('schedule-view-load-map', this.loadMap, this);
        facade.listen('event-attending-member-added', this.addMemberToSchedule, this);
        facade.listen('event-attending-member-removed', this.removeMemberFromSchedule, this);
        facade.listen('user-signed-out', this.updateMemberSignedOut, this);
        facade.listen('user-signed-in', this.updateMemberSignedIn, this);
        facade.listen('schedule-view-mark-user-events', this.markUserEvents, this);

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
          data.completeCallback = function () {
            button.button('reset');
            mapBox.removeClass('cnr-loading');
          };
          data.successCallback = function () {
            button.data('params', null);
          };
          facade.notify({
            type: 'schedule-view-load-map',
            data: data
          });
        });

        $('body').on('click', '.cnr-collapse-map', function () {
          var button = $(this),
            mapBox = button.parents('.cnr-map-global');

          mapBox.removeClass('cnr-expanded');
        });
        $('body').on('click', '#map_legend .cnr-btn-toggle-options', function () {
          $('#map_legend .cnr-change-options').toggleClass('hidden');
          $('#map_legend .cnr-selected-options').toggleClass('hidden');
        });
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
        if (!messageInfo.data.id || (!messageInfo.data.races)) {
          return;
        }
        _data.push(messageInfo.data);
        if (_googleMapsLoaded) {
          _initializeMap(messageInfo.data);
        }
      },
      loadMap : function(messageInfo) {
          var options = messageInfo.data;
          if (!options.year || !$('#' + options.id).length) {
            return;
          }
          facade.rest.getAll('race-location', {
            year : options.year
          }, {
            success : function(response) {
              if (response.data) {
                if (options.successCallback) {
                  options.successCallback();
                }
                options.races = response.data;
                facade.notify({
                  type : 'schedule-view-register-map',
                  data : options
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
      addMemberToSchedule : function(messageInfo) {
        var dao = +messageInfo.data.item_dao;
        if (dao !== 8) {
          return;
        }
        var memberData = facade.getUserData();
        memberData.ea_id = messageInfo.data.id;
        if ($("#schedule_members").length) {
          $(facade.template('eventAttendingMember', memberData)).prependTo("#schedule_members");
        }
        $('#join_event_btn, .addActivity[data-itemId="' + messageInfo.data.item_id + '"]').hide();
        $('#leave_event_btn').show();
        $('#leave_event_btn.removeActivity').attr('data-id', messageInfo.data.id);
        var numAttendee = $('#schedule_members .cnr-attendee').size();
        $(".cnr-shedule_plan_no").html(numAttendee ? 'Liczba zapisanych: ' + numAttendee : 'Nikt jeszcze nie zgłosił udziału.');

        // handle home-recommended-schedules
        var homeElem = $('.shedule-participants[data-scheduleId="' + messageInfo.data.item_id + '"]');
        if (homeElem.length) {
          var num = +homeElem.find('.info .number').first().text();
          homeElem.find('.info .number').text(num + 1);
        }
      },
      removeMemberFromSchedule : function(messageInfo) {
        var user = facade.getUserData();
        $(".cnr-attendee[data-id=" + messageInfo.data.id + '][data-user-id=' + user.id + ']').remove();
        $('#join_event_btn').show();
        $('#leave_event_btn').hide();
        $('#leave_event_btn.removeActivity').attr('data-id', '');
        var numAttendee = $('#schedule_members .cnr-attendee').size();
        $(".cnr-shedule_plan_no").html((numAttendee ? 'Liczba zapisanych: ' + numAttendee : 'Nikt jeszcze nie zgłosił udziału.'));

      },
      updateMemberSignedIn : function(messageInfo) {
        var user = messageInfo.data, id = 0;

        // check if user is on the member list
        var matching = $('#schedule_members .cnr-attendee[data-user-id=' + user.id + '], #results .cnr-attendee[data-user-id=' + user.id + ']');
        if (matching.size()) {
          $('#join_event_btn').hide();
          id = matching.first().attr('data-id');
          $('#leave_event_btn.removeActivity').attr('data-id', id);
          $('#leave_event_btn').show();
        } else {
          $('#join_event_btn').show();
          $('#leave_event_btn').hide();
        }
        matching = $('#results .cnr-attendee[data-user-id=' + user.id + ']');
      },
      updateMemberSignedOut : function(messageInfo) {
        $('#join_event_btn').show();
        $('#leave_event_btn').hide();
        $('#leave_event_btn.removeActivity').attr('data-id', '');
        $('.addActivity, .addResult').show();
      },
      markUserEvents : function(messageInfo) {
        var attending = messageInfo.data.attending || [];
        var results = messageInfo.data.results || [];
        $.each(attending, function(i) {
          $('.addActivity[data-itemId="' + attending[i] + '"]').hide();
        });
        $.each(results, function(i) {
          $('.addResult[id="schedule_' + results[i] + '"]').hide();
        });
      },
      destroy : function() {}
    };
  };
});
