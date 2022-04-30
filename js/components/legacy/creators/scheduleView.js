/*jshint unused:false, maxcomplexity:55, maxstatements:30, strict:false */
/*global google */
define(function() {
    return function(facade, $) {

        var geocoder;

        var _initGeocoder = function(data) {
            geocoder = new google.maps.Geocoder();
            $('#btnGeocode').click(function() {
                _codeAddress();
            });

            $('#searchAddress').keypress(function(e) {
                if (e.which === 13) {
                    _codeAddress();
                }
            });
        };

        var _isScheduleVisibleForCategory = function(race, filters) {
            // First check category
            if (!filters.category.length) {
                return true;
            }
            var category = "" + (race.attr("data-category"));
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
         * year
         */
        var _filterCalendarRaces = function(active_tags, year) {
            var categories = active_tags['category'];
            var cycles = active_tags['cycle'];
            var categories_label = active_tags['category_txt'];
            var cycles_label = active_tags['cycle_txt'];

            var filteredIds = [];
            $('#cnr-shedule-calendar .dropdown.open .dropdown-toggle').dropdown('toggle');
            $('#cnr-shedule-calendar .cnr-schedule-cal-cnt').addClass('cnr-loading');
            $('#cnr-shedule-calendar .cnr-no-schedule').addClass('hidden');

            $('#cnr-shedule-calendar .cnr-schedule').each(function() {
                var race = $(this);
                if (_isScheduleVisibleForCategory(race, active_tags) && _isScheduleVisibleForCycle(race, active_tags) && _isScheduleVisibleForTag(race, active_tags)) {
                    race.removeClass('hidden');
                    filteredIds.push(race.attr("data-id"));
                } else {
                    race.addClass('hidden');
                }
            });

            if (!categories.length) {
                $('#cnr-shedule-calendar .cnr-active-category').html('Wszystkie');
            } else {
                $('#cnr-shedule-calendar .cnr-active-category').html(''); //categories_label);
                for (var i = 0; i < categories.length; i++) {
                    $(facade.template('scheduleTag', {
                        tag: categories[i],
                        label: categories_label[i],
                        type: 'category'
                    })).appendTo("#cnr-shedule-calendar .cnr-active-category");
                }
            }

            if (!cycles.length) {
                $('#cnr-shedule-calendar .cnr-active-cycle').text('Wszystkie');
            } else {
                $('#cnr-shedule-calendar .cnr-active-cycle').html(''); //categories_label);
                for (var idx = 0; idx < cycles.length; idx++) {
                    $(facade.template('scheduleTag', {
                        tag: cycles[idx],
                        label: cycles_label[idx],
                        type: 'cycle'
                    })).appendTo("#cnr-shedule-calendar .cnr-active-cycle");
                }
            }

            $('#cnr-shedule-calendar .cnr-number-rows-filtred').text(filteredIds.length);
            if (0 === filteredIds.length) {
                $('#cnr-shedule-calendar .cnr-no-schedule').removeClass('hidden');
            }
            updateCalendarVisibleElements();
            $('#cnr-shedule-calendar .cnr-schedule-cal-cnt').removeClass('cnr-loading');

            facade.notify({
                type: 'schedule-view-update-data',
                data: {
                    ids: filteredIds,
                    year: year
                }
            });
        };

        var updateCalendarVisibleElements = function() {
            $('#cnr-shedule-calendar .calendar-date-container').each(function() {
                var items = $(this).find('.cnr-schedule').not('.hidden');
                if (items.size() === 0) {
                    $(this).addClass('hidden');
                } else {
                    $(this).removeClass('hidden');
                }
            });

            $('#cnr-shedule-calendar .calendar-month-container').each(function() {
                var items = $(this).find('.calendar-date-container').not('.hidden');
                if (items.size() === 0) {
                    $(this).addClass('hidden');
                } else {
                    $(this).removeClass('hidden');
                }
            });
        };

        var scheduleCalendarXhr = null;

        /*
         * Call this method when year is changing. 
         * Load schedules for given year.
         */
        var _updateSchedulesCalendar = function(data) {
            var urlData,
                year = data.year;

            if (scheduleCalendarXhr !== null) {
                scheduleCalendarXhr.abort();
                scheduleCalendarXhr = null;
            }
            $('#cnr-shedule-calendar .dropdown.open .dropdown-toggle').dropdown('toggle');
            $('#cnr-shedule-calendar .cnr-schedule-cal-cnt').addClass('cnr-loading');

            urlData = {
                dao: 8,
                action: 0,
                year: year,
                dataType: 'json'
            };

            scheduleCalendarXhr = $.ajax({
                type: 'POST',
                data: urlData,
                dataType: 'json',
                url: 'ajax',
                success: function(data) {
                    $('#cnr-shedule-calendar .cnr-schedule-cal-cnt').html(
                        $(facade.template('scheduleCalendar', data)));
                    $('#cnr-shedule-calendar .cnr-number-rows').text(data.number_rows);
                    $('#cnr-shedule-calendar .cnr-number-rows-filtred').text(data.number_rows_filtred);
                    $('#cnr-shedule-calendar .cnr-active-year').text(data.active_year);
                    $('#cnr-shedule-year-select .cnr-year-menu-active-year').text(data.active_year);
                    $('#cnr-shedule-year-select li.active').removeClass('active');
                    $('#cnr-shedule-year-select li a[data-year="' + data.active_year + '"]').parent().addClass('active');
                    var active_tags = _getActiveTags();
                    if (active_tags['count'] > 0) {
                        _filterCalendarRaces(active_tags, year);
                    } else {
                        facade.notify({
                            type: 'schedule-view-update-data',
                            data: {
                                ids: data.race_ids,
                                year: year
                            }
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
        var _bindSheduleSelects = function() {
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

                _filterCalendarRaces(active_tags, year);
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
                    year: year
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
                'category': [],
                'category_txt': [],
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

        /**
         * geocode an address and set map center at the returned latitude and
         * longitude values
         */
        var _codeAddress = function() {
            var address = document.getElementById("searchAddress").value;
            $('#geoAddresses').empty().hide();

            geocoder.geocode({
                'address': address
            }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results.length === 1) {
                        var location = _formatGeocoderResult(results[0]);
                        facade.notify({
                            type: 'schedule-zoom-map',
                            data: {
                                lat: location.position.lat(),
                                lng: location.position.lng(),
                            }
                        });
                    } else if (results.length > 1) {
                        var locations = [];
                        $.each(results, function(i, result) {
                            locations.push(_formatGeocoderResult(result));
                        });
                        _viewLocationSelect(locations);
                    }
                } else {
                    _viewLocationSelect([]);
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
        var _viewLocationSelect = function(locations) {
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
                    var position = locations[ind].position;
                    facade.notify({
                        type: 'schedule-zoom-map',
                        data: {
                            lat: position.lat(),
                            lng: position.lng(),
                        }
                    });
                });
            } else {
                txt = '<p>Lokalizacji nie znaleziono.</p>';
                outDiv.html(txt);
            }
            outDiv.show();
        };


        return {
            init: function(data) {
                facade.listen('map-initialised', this.mapInitialised, this);
                facade.listen('event-attending-member-added', this.addMemberToSchedule, this);
                facade.listen('event-attending-member-removed', this.removeMemberFromSchedule, this);
                facade.listen('user-signed-out', this.updateMemberSignedOut, this);
                facade.listen('user-signed-in', this.updateMemberSignedIn, this);
                facade.listen('schedule-view-mark-user-events', this.markUserEvents, this);

                $('body').on('click', '#map_legend .cnr-btn-toggle-options', function() {
                    $('#map_legend .cnr-change-options').toggleClass('hidden');
                    $('#map_legend .cnr-selected-options').toggleClass('hidden');
                });

                _bindSheduleSelects();

            },
            mapInitialised: function() {
                _initGeocoder();
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
                var user = messageInfo.data,
                    id = 0;

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
            destroy: function() {}
        };
    };
});