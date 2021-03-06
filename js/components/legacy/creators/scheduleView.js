/*jshint unused:false, maxcomplexity:55, maxstatements:30, strict:false */
/*global google, InfoBox, MarkerClusterer */
define(function() {
  return function(facade, $) {

    /**
     * array Maps data
     */
    var _data = [],
      maps = {},
      _initialFilteredRaces = {},

      /**
       * object InfoWindow for displaying found location
       */
      locationInfo, locationLabel,

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
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
      });
      maps[data.id] = map;
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

    var _resizeMapBox = function(map) {
      google.maps.event.trigger(map, 'resize');
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
          center: centerLatLng,
          radius: data.radius
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
          var src = facade.config.staticUrl + 'img-1.3/markers/iconset-1.4.png', anchor = {
            x: 60,
            y: 32
          };

          if (!mode) {
            // use the small icons - 20x20
            anchor = _getScheduleAnchor(schedule.category, schedule.past, 20);
          } else if (Number(i) === Number(data.selected)) {
            anchor = {
              x: 380,
              y: 32
            };

          } else {
            anchor = _getScheduleAnchor(schedule.category, 0, 20);
          }
          var img = new google.maps.MarkerImage(
            src,
            new google.maps.Size(20, 30),
            new google.maps.Point(anchor.x, anchor.y),
            new google.maps.Point(10, 15)
          );

          var marker = _marker(map, schedule, {
            position: latLng,
            id: Number(i),
            icon: img,
          });
          if (data.selected) {
            visibleMarkers.push(marker);
            marker.setMap(map);
          }
          markersBounds.extend(latLng);
          markers[Number(i)] = marker;
        }
      });
      if (data.races.groups) {
        groups = data.races.groups;
      }
      if (_initialFilteredRaces[map.getDiv().id]) {
        _refreshMapMarkers({map_id: map.getDiv().id, ids: _initialFilteredRaces[map.getDiv().id]});
      }
      if (data.selected) {
        _zoomSchedule(map, markers[data.selected]);
      }
      _refreshMapMarkersCount();
    };

    var _refreshMapMarkersCount = function() {
      var count = Object.keys(visibleMarkers).length;
      $('.map-global-header .caption').html("<span style='color: #ff7600'>" + count + '</span> wyścigów');
    };

    /*
     *  Method for updating markers on map based on given IDs.
     */
    var _refreshMapMarkers = function(data) {
      var ids = data.ids;
      var map = maps[data.map_id];

      if (data.year) {
        $.each(_data, function(id, map_data) {
          if (map_data.id === data.map_id) {
            if (data.year === map_data.year) {
              //update ids
              visibleMarkers = [];
              $.each(markers, function(index, marker) {
                if ($.inArray(index, ids) >= 0) {
                  visibleMarkers.push(marker);
                  marker.setMap(map);
                } else {
                  marker.setMap(null);
                }
              });
              _refreshMapMarkersCount();
            } else {
              $.each(visibleMarkers, function(index, marker) {
                marker.setMap(null);
              });
              _data[id].year = data.year;
              facade.rest.getAll('race-location', {
                year: data.year
              }, {
                success: function(response) {
                  if (response.data) {
                    markers = {};
                    _initialFilteredRaces[data.map_id] = ids;
                    _createSchedules(map, {year: data.year, races: response.data});
                  }
                },
                complete: function() {
                  _refreshMapMarkersCount();
                }
              });
            }
          }
        });
      } else {
        //update ids
        visibleMarkers = [];
        $.each(markers, function(index, marker) {
          if ($.inArray(index, ids) >= 0) {
            visibleMarkers.push(marker);
            marker.setMap(map);
          } else {
            marker.setMap(null);
          }
        });
        _refreshMapMarkersCount();
      }
    };

    var _isScheduleVisibleForCategory = function(race, filters) {
      // First check category
      if (!filters.category.length) {
        return true;
      }
      var category = ""+ ( race.attr("data-category"));
      return (0 <= $.inArray(category, filters.category));
    };
    var _isScheduleVisibleForCycle = function(race, filters) {
      // First check category
      if (!filters.cycle.length) {
        return true;
      }
      var cycle = (race.attr("data-cycle"));
      var cycle_arr = cycle.split(',');
      for (var index in cycle_arr) {
        if (cycle_arr.hasOwnProperty(index)) {
          var item = cycle_arr[index];
          if (0 <= $.inArray(item, filters.cycle)) {
            return true;
          }
        }
      }
      return false;
    };
    var _isScheduleVisibleForTag = function(race, filters) {
      // First check category
      if (!filters.other.length) {
        return true;
      }
      var tags = (race.attr("data-tags"));
      var tags_arr = tags.split(',');
      for (var index in tags_arr) {
        if (tags_arr.hasOwnProperty(index)) {
          var item = tags_arr[index];
          if (0 <= $.inArray(item, filters.other)) {
            return true;
          }
        }
      }
      return false;
    };
    /*
     * This method is used when calendar is fully loaded for whole year and 
     * some filters are applied:
     * - cycle
     * - category
     * based on active_tags parameter
     * Pass selected IDs to the active map and update view.
     * map is object containing id of map and year
     */
    var _filterCalendarRaces = function(active_tags, map) {
      var categories = active_tags['category'];
      var cycles = active_tags['cycle'];
      var categories_label = active_tags['category_txt'];
      var cycles_label = active_tags['cycle_txt'];

      var filtredIds = [];
      $('#cnr-shedule-calendar .dropdown.open .dropdown-toggle').dropdown('toggle');
      $('#cnr-shedule-calendar .cnr-schedule-cal-cnt').addClass('cnr-loading');
      $('#cnr-shedule-calendar .cnr-no-schedule').addClass('hidden');

      $('#cnr-shedule-calendar .cnr-schedule' ).each(function() {
        var race = $(this);
        if (_isScheduleVisibleForCategory(race, active_tags) && _isScheduleVisibleForCycle(race, active_tags) && _isScheduleVisibleForTag(race, active_tags)) {
          race.removeClass('hidden');
          filtredIds.push(race.attr("data-id"));
        } else {
          race.addClass('hidden');
        }
      });

      if (!categories.length) {
        $('#cnr-shedule-calendar .cnr-active-category').html('Wszystkie');
      } else {
        $('#cnr-shedule-calendar .cnr-active-category').html('');//categories_label);
        for (var i= 0; i < categories.length; i++) {
          $(facade.template('scheduleTag', {
              tag: categories[i],
              label: categories_label[i],
              type: 'category'
            })
          ).appendTo("#cnr-shedule-calendar .cnr-active-category");
        }
      }

      if (!cycles.length) {
        $('#cnr-shedule-calendar .cnr-active-cycle').text('Wszystkie');
      } else {
        $('#cnr-shedule-calendar .cnr-active-cycle').html('');//categories_label);
        for (var idx = 0; idx < cycles.length; idx++) {
          $(facade.template('scheduleTag', {
              tag: cycles[idx],
              label: cycles_label[idx],
              type: 'cycle'
            }
          )).appendTo("#cnr-shedule-calendar .cnr-active-cycle");
        }
      }

      $('#cnr-shedule-calendar .cnr-number-rows-filtred').text(filtredIds.length);
      if (0 === filtredIds.length) {
        $('#cnr-shedule-calendar .cnr-no-schedule').removeClass('hidden');
      }
      updateCalendarVisibleElements();
      //fixAccordionOpenElement();
      $('#cnr-shedule-calendar .cnr-schedule-cal-cnt').removeClass('cnr-loading');
      if (map) {
        _refreshMapMarkers({
          ids: filtredIds,
          map_id: map.id,
          year: map.year
        });
      }
    };
    
    var fixAccordionOpenElement = function() {
      $('#cnr-shedule-calendar .calendar-month-container.hidden .in').collapse('hide');
      if ($('#cnr-shedule-calendar .calendar-month-container:not(".hidden") .in').length === 0) {
        var firstMonth = $('#cnr-shedule-calendar .calendar-month-container').not('.hidden').first();
        if (firstMonth.length !== 0) {
          firstMonth.find('.accordion-body').collapse('show');
        }
      }
    };

    var updateCalendarVisibleElements = function(){
      $('#cnr-shedule-calendar .calendar-date-container').each(function(){
          var items = $( this ).find('.cnr-schedule').not('.hidden');
          if( items.size() === 0) {
            $(this).addClass('hidden');
          } else {
            $(this).removeClass('hidden');
          }
        }
      );

      $('#cnr-shedule-calendar .calendar-month-container').each(function(){
          var items = $( this ).find('.calendar-date-container').not('.hidden');
          if( items.size() === 0) {
            $(this).addClass('hidden');
          } else {
            $(this).removeClass('hidden');
          }
        }
      );
    };

    var scheduleCalendarXhr = null;
    
    /*
     * Call this method when year is changing. 
     * Load schedules for given year.
     */
    var _updateSchedulesCalendar = function(data) {
      var urlData,
          year = data.year,
          map = data.map_id;

      if ( scheduleCalendarXhr !== null ) {
        scheduleCalendarXhr.abort();
        scheduleCalendarXhr = null;
      }
      $('#cnr-shedule-calendar .dropdown.open .dropdown-toggle').dropdown('toggle');
      $('#cnr-shedule-calendar .cnr-schedule-cal-cnt').addClass('cnr-loading');

      urlData = {
        dao: 8,
        action: 0,
        year: year,
        dataType : 'json'
      };

      scheduleCalendarXhr = $.ajax({
        type: 'POST',
        data: urlData,
        dataType : 'json',
        url: 'ajax',
        success: function(data) {
          $('#cnr-shedule-calendar .cnr-schedule-cal-cnt').html(
            $(facade.template('scheduleCalendar', data)));
          $('#cnr-shedule-calendar .cnr-number-rows').text(data.number_rows);
          $('#cnr-shedule-calendar .cnr-number-rows-filtred').text(data.number_rows_filtred);
          $('#cnr-shedule-calendar .cnr-active-year').text(data.active_year);
          $('#cnr-shedule-year-select .cnr-year-menu-active-year').text(data.active_year);
          $('#cnr-shedule-year-select li.active').removeClass('active');
          $('#cnr-shedule-year-select li a[data-year="'+ data.active_year + '"]').parent().addClass('active');
          var active_tags = _getActiveTags();
          if (active_tags['count'] > 0) {
            _filterCalendarRaces(active_tags, {id: map, year: year});
          } else {
            _refreshMapMarkers({
              ids: data.race_ids,
              map_id: map,
              year: year
            });
          }
        },
        complete: function() {
          scheduleCalendarXhr = null;
          $('#cnr-shedule-calendar .cnr-schedule-cal-cnt').removeClass('cnr-loading');
        },
        cache: false,
        global: false
      });
    };

    /*
     * Binding schedule-select events.
     * Including tags-removal.
     * Called once on loading full calendar, 
     * use live() method to be able to bing future element-events.
     */
    var _bindSheduleSelects = function(map_id) {
      $('#cnr-shedule-category-select').multiselect({
        nonSelectedText: 'Rodzaj wyścigu',
        allSelectedText: 'Wszystkie',
        includeSelectAllOption: false,
        nSelectedText: ' wybranych kategorii',
        maxHeight: 200,
        buttonText: function(options, select) {
          return 'Rodzaj wyścigu';
        },
        buttonContainer: '<li class="dropdown"></li>',
        buttonClass: '',
        templates: {
          button: '<a class="multiselect dropdown-toggle" data-toggle="dropdown" href="#"><i class="icon-list icon icon-white"></i> Rodzaj wyścigu&nbsp;<b class="caret"></b></a>'
        },
        onChange: function(option, checked, select) {
          _updateData();
        }
      });

      $('#cnr-shedule-cycle-select').multiselect({
        nonSelectedText: 'Cykl wyścigu',
        allSelectedText: 'Wszystkie',
        includeSelectAllOption: false,
        nSelectedText: ' wybranych cykli',
        maxHeight: 200,
        buttonText: function(options, select) {
          return 'Cykl wyścigu';
        },
        buttonContainer: '<li class="dropdown"></li>',
        buttonClass: '',
        templates: {
          button: '<a class="multiselect dropdown-toggle" data-toggle="dropdown" href="#"><i class="icon-list icon icon-white"></i> Cykl wyścigu&nbsp;<b class="caret"></b></a>'
        },
        onChange: function(option, checked, select) {
          _updateData();
        }
      });

      function _updateData() {
        var active_tags = _getActiveTags(),
          year = +$('#cnr-shedule-calendar .cnr-active-year').text();

        _filterCalendarRaces(active_tags, {id: map_id, year: year});
      }

      $('.cnr-remove-tag-filter').live('click', function() {
        var tag = $(this).attr('data-tag');
        var type = $(this).attr('data-type');
        if (type === 'cycle') {
          $('#cnr-shedule-cycle-select').multiselect('deselect', tag);
        } else if (type === 'category') {
          $('#cnr-shedule-category-select').multiselect('deselect', tag);
        } else if (type === 'other') {
          $('#cnr-shedule-calendar .cnr-active-tag-other').remove();
        }
        $(this).remove();
        _updateData();
      });

      $('body').on('click', '.cnr-change-calendar-year', function(evt) {
        var year = $(this).attr('data-year');
        if ($(this).parent().hasClass('active')) {
          return false;
        }
        _updateSchedulesCalendar({
          year: year,
          map_id: map_id
        });
        return false;
      });
    };

    /*
     * Get all active categories and cycles for filtering calendar.
     * Return object with proper arrays to filter.
     */
    var _getActiveTags = function() {
      var active_tags = {
        'category' : [],
        'category_txt' : [],
        'cycle': [],
        'cycle_txt': [],
        'other': [],
        'other_txt': [],
        'count': 0
      };
      // FOR other check in sub-header.
      $('#cnr-shedule-calendar .cnr-remove-tag-filter[data-type="other"]').each(function() {
        active_tags['other'].push($(this).attr('data-tag'));
        active_tags['other_txt'].push($(this).attr('data-label'));
        active_tags['count'] += 1;
      });
      $('#cnr-shedule-category-select option').each(function() {
        if ($(this).attr('selected')) {
          active_tags['category'].push($(this).attr('data-category'));
          active_tags['category_txt'].push($(this).text());
          active_tags['count'] += 1;
        }
      });
      $('#cnr-shedule-cycle-select option').each(function() {
        if ($(this).attr('selected')) {
          active_tags['cycle'].push($(this).attr('data-tag'));
          active_tags['cycle_txt'].push($(this).text());
          active_tags['count'] += 1;
        }
      });
      return active_tags;
    };

    var _getScheduleAnchor = function(cat, past, size) {
      var aAnchors = {
        1: {
          x: (size ? 340 : 544),
          y: (size ? 32 : 0)
        },
        2: {
          x: (size ? 300 : 481),
          y: (size ? 32 : 0)
        },
        3: {
          x: (size ? 260 : 416),
          y: (size ? 32 : 0)
        },
        4: {
          x: (size ? 220 : 352),
          y: (size ? 32 : 0)
        },
        5: {
          x: (size ? 180 : 289),
          y: (size ? 32 : 0)
        },
        6: {
          x: (size ? 802 : 849),
          y: (size ? 32 : 0)
        },
        7: {
          x: (size ? 140 : 224),
          y: (size ? 32 : 0)
        },
        8: {
          x: (size ? 100 : 160),
          y: (size ? 32 : 0)
        },
        9: {
          x: (size ? 60 : 96),
          y: (size ? 32 : 0)
        },
        10: {
          x: (size ? 60 : 96),
          y: (size ? 32 : 0)
        },
        11: {
          x: (size ? 722 : 722),
          y: (size ? 32 : 0)
        },
        12: {
          x: (size ? 722 : 722),
          y: (size ? 32 : 0)
        },
        13: {
          x: (size ? 439 : 481),
          y: (size ? 32 : 0)
        },
        100: {
          x: (size ? 762 : 785),
          y: (size ? 32 : 0)
        },
        101: {
          x: (size ? 360 : 576),
          y: (size ? 32 : 0)
        },
        102: {
          x: (size ? 320 : 512),
          y: (size ? 32 : 0)
        },
        103: {
          x: (size ? 280 : 448),
          y: (size ? 32 : 0)
        },
        104: {
          x: (size ? 240 : 384),
          y: (size ? 32 : 0)
        },
        105: {
          x: (size ? 80 : 128),
          y: (size ? 32 : 0)
        },
        106: {
          x: (size ? 822 : 881),
          y: (size ? 32 : 0)
        },
        107: {
          x: (size ? 160 : 256),
          y: (size ? 32 : 0)
        },
        108: {
          x: (size ? 120 : 192),
          y: (size ? 32 : 0)
        },
        109: {
          x: (size ? 80 : 128),
          y: (size ? 32 : 0)
        },
        110: {
          x: (size ? 782 : 817),
          y: (size ? 32 : 0)
        },
        111: {
          x: (size ? 742 : 753),
          y: (size ? 32 : 0)
        },
        112: {
          x: (size ? 742 : 753),
          y: (size ? 32 : 0)
        },
        113: {
          x: (size ? 459 : 512),
          y: (size ? 32 : 0)
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
        map: null
      };

      $.extend(defaults, opts);
      var marker = new google.maps.Marker(defaults);
      marker.past = schedule.past;
      marker.category = schedule.category;

      var content = '<div class="previewBox"><span class="arrowTop">&nbsp;</span>';
      content += '<h5><a title="Przejdź do strony wyścigu" href="' + schedule.url_view + '"/>' + schedule.race_name + ' &raquo;</a></h5>';
      content += '<p><span class="nowrap"><i class="icon-calendar icon icon-blue"></i> ' + schedule.start_day + '</span> ';
      content += '<span class="nowrap"><i class="icon icon-map-marker icon-blue"></i> ' + schedule.start_place + '</span> ';
      content += '<span class="nowrap"><i class="icon-tag icon icon-blue"></i> ' + schedule.race_sort + '</span></p>';
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
        'address': address
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
        raw_name: result.formatted_address,
        name: result.formatted_address,
        position: result.geometry.location,
        locality: '',
        administrativeRegion: '',
        country: '',
        raw_tags: []
      };

      var addr_components = result.address_components;
      for (var index = 0; index < addr_components.length; index++) {
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
      map.setZoom(12);
      locationInfo.close();
      locationInfo.setOptions({
        content : marker.content,
        position : marker.getPosition()
      });
      locationInfo.open(map, marker);
    };

    return {
      init: function(data) {
        facade.listen('map-initialised', this.mapInitialised, this);
        facade.listen('schedule-view-register-map', this.registerMap, this);
        facade.listen('schedule-view-load-map', this.loadMap, this);
        facade.listen('schedule-view-load-preview', this.loadMap, this);
        facade.listen('event-attending-member-added', this.addMemberToSchedule, this);
        facade.listen('event-attending-member-removed', this.removeMemberFromSchedule, this);
        facade.listen('user-signed-out', this.updateMemberSignedOut, this);
        facade.listen('user-signed-in', this.updateMemberSignedIn, this);
        facade.listen('schedule-view-mark-user-events', this.markUserEvents, this);
        facade.listen('schedule-view-filter-races', this.filterRacesOnMap, this);
        facade.listen('schedule-view-filtered-races', this.setInitialFilteredRaces, this);

        $('body').on('click', '.cnr-expand-map-link', function() {
            var mapBox = $(this).parents('.cnr-map-global');
            if (mapBox.hasClass('cnr-expanded')) {
              return;
            }
            $('body .cnr-expand-map').click();
          }
        );

        $('body').on('click', '#map_legend .cnr-btn-toggle-options', function() {
          $('#map_legend .cnr-change-options').toggleClass('hidden');
          $('#map_legend .cnr-selected-options').toggleClass('hidden');
        });

      },
      mapInitialised: function() {
        geocoder = new google.maps.Geocoder();
        markersBounds = new google.maps.LatLngBounds();
        locationInfo = new InfoBox({
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
        });
        locationLabel = new InfoBox({
          disableAutoPan : true,
          pixelOffset : new google.maps.Size(0, 5),
          closeBoxURL : "",
          isHidden : false,
          pane : "floatPane",
          enableEventPropagation : true
        });
        //locationInfo = new google.maps.InfoWindow({content: ''});
        var length = _data.length;
        for (var i = 0; i < length; i++) {
          _initializeMap(_data[i]);
        }

        _googleMapsLoaded = true;
      },
      setInitialFilteredRaces: function(messageInfo) {
        _initialFilteredRaces[messageInfo.data.map_id] = messageInfo.data.ids;
      },
      registerMap: function(messageInfo) {
        if (!messageInfo.data.id || (!messageInfo.data.races)) {
          return;
        }
        _data.push(messageInfo.data);
        if (_googleMapsLoaded) {
          _initializeMap(messageInfo.data);
        }
      },
      filterRacesOnMap: function(messageInfo) {
        _refreshMapMarkers(messageInfo.data);
      },
      loadMap: function(messageInfo) {
        var options = messageInfo.data, mapBox;

        if (!options.year || !$('#' + options.id).length) {
          return;
        }
        mapBox = $('#map_global');
        mapBox.addClass('cnr-loading');
        options.completeCallback = function() {
          mapBox.removeClass('cnr-loading');

          $('body').on('click', '.cnr-expand-map', function() {
            var mapBox = $(this).parents('.cnr-map-global');
            mapBox.addClass('cnr-expanded');
            _resizeMapBox(maps[options.id]);
          });

          $('body').on('click', '.cnr-collapse-map', function() {
            var mapBox = $(this).parents('.cnr-map-global');
            mapBox.removeClass('cnr-expanded');
            _resizeMapBox(maps[options.id]);
          });
          _bindSheduleSelects(options.id);

        };
        facade.rest.getAll('race-location', {
          year: options.year
        }, {
          success: function(response) {
            if (response.data) {
              if (options.successCallback) {
                options.successCallback();
              }
              options.races = response.data;
              facade.notify({
                type: 'schedule-view-register-map',
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
      addMemberToSchedule: function(messageInfo) {
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
      removeMemberFromSchedule: function(messageInfo) {
        var user = facade.getUserData();
        $(".cnr-attendee[data-id=" + messageInfo.data.id + '][data-user-id=' + user.id + ']').remove();
        $('#join_event_btn').show();
        $('#leave_event_btn').hide();
        $('#leave_event_btn.removeActivity').attr('data-id', '');
        var numAttendee = $('#schedule_members .cnr-attendee').size();
        $(".cnr-shedule_plan_no").html((numAttendee ? 'Liczba zapisanych: ' + numAttendee : 'Nikt jeszcze nie zgłosił udziału.'));

      },
      updateMemberSignedIn: function(messageInfo) {
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
      updateMemberSignedOut: function(messageInfo) {
        $('#join_event_btn').show();
        $('#leave_event_btn').hide();
        $('#leave_event_btn.removeActivity').attr('data-id', '');
        $('.addActivity, .addResult').show();
      },
      markUserEvents: function(messageInfo) {
        var attending = messageInfo.data.attending || [];
        var results = messageInfo.data.results || [];
        $.each(attending, function(i) {
          $('.addActivity[data-itemId="' + attending[i] + '"]').hide();
        });
        $.each(results, function(i) {
          $('.addResult[id="schedule_' + results[i] + '"]').hide();
        });
      },
      destroy: function() {
      }
    };
  };
});
