/*global bindFormElements, setErrorCommunique */
define(function() {
  return function(facade, $) {

    var oWinners = {};

    function bindSuggestions() {
      $('.suggest span').click(function(oEvent) {
        var val = $(this).text();
        $(this).parent().children().removeClass('selected');
        $(this).addClass('selected');
        var inputName = ($(this).parent().attr('id') || '').split('-')[0];
        $('#' + inputName).val(val);
        $(this).parent().hide();
      });

      $('#category_name, #distance_name, #race_cycle').focus(function() {
        $(this).next('.suggest').show();
      }).keyup(function() {
        $(this).next('.suggest').hide();
      });

    }

    function bindPositions() {
      $('#position').change(function(oEvent) {
        if ($(this).val() === '1') {
          $('#best_result_hours').val($('#result_hours').val());
          $('#best_result_minutes').val($('#result_minutes').val());
          $('#best_result_seconds').val($('#result_seconds').val());
        } else {

        }
      });
      $('#category_position').change(function(oEvent) {
        if ($(this).val() === '1') {
          $('#best_category_result_hours').val($('#result_hours').val());
          $('#best_category_result_minutes').val($('#result_minutes').val());
          $('#best_category_result_seconds').val($('#result_seconds').val());
        } else {

        }
      });
    }
    function validateData() {

      $(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
      var errors = 0;
      var category_val = $.trim($('#category_name').val());
      var category_sel_val = $.trim($('#categories option:selected').val());
      var distance_val = $.trim($('#distance_name').val());
      var distance_sel_val = $.trim($('#distances option:selected').val());
      var distance_length_val = $.trim($('#distance_length').val());
      var gender_val = $('#gender').val();
      var resultHour = $.trim($('#result_hours').val());
      var resultMinute = $.trim($('#result_minutes').val());
      var resultSecond = $.trim($('#result_seconds').val());
      var position_val = $.trim($('#position').val());
      var category_position_val = $.trim($('#category_position').val());
      var bestResultHour = $.trim($('#best_result_hours').val());
      var bestResultMinute = $.trim($('#best_result_minutes').val());
      var bestResultSecond = $.trim($('#best_result_seconds').val());

      if (category_val === '') {
        if (category_sel_val === '-') {
          setErrorCommunique('category_communique', 'Musisz podać kategorię');
          errors += 1;
        } else {
          $('#category_name').val(category_sel_val);
        }
      }

      if (distance_val === '') {
        if (distance_sel_val === '-') {
          setErrorCommunique('distance_communique', 'Musisz zdefiniować dystans');
          errors += 1;
        } else {
          $('#distance_name').val(distance_sel_val);
        }
      }

      if (0 > resultHour || resultHour >= 24) {
        errors += 1;
        setErrorCommunique('result_communique', 'Niepoprawny czas');
      }
      if (0 > resultMinute || resultMinute >= 60) {
        errors += 1;
        setErrorCommunique('result_communique', 'Niepoprawny czas');
      }
      if (0 > resultSecond || resultSecond >= 60) {
        errors += 1;
        setErrorCommunique('result_communique', 'Niepoprawny czas');
      }

      if (0 > bestResultHour || bestResultHour >= 24) {
        errors += 1;
        setErrorCommunique('best_result_communique', 'Niepoprawny czas zwycięzcy');
      }
      if (0 > bestResultMinute || bestResultMinute >= 60) {
        errors += 1;
        setErrorCommunique('best_result_communique', 'Niepoprawny czas zwycięzcy');
      }
      if (0 > bestResultSecond || bestResultSecond >= 60) {
        errors += 1;
        setErrorCommunique('best_result_communique', 'Niepoprawny czas zwycięzcy');
      }

      if (!resultHour && !resultMinute && !resultSecond && !position_val) {
        errors += 1;
        setErrorCommunique('result_communique', 'Musisz podać czas lub miejsce');
      }

      if (bestResultHour &&
          bestResultMinute &&
          bestResultSecond &&
          (bestResultHour > resultHour || bestResultHour === resultHour && bestResultMinute > resultMinute || bestResultHour === resultHour && bestResultMinute === resultMinute &&
              bestResultSecond > resultSecond)) {
        setErrorCommunique('result_communique', 'Czas zwycięzcy nie może być gorszy od Twojego');
        errors += 1;
      }

      if (errors) {
        return false;
      }
      return true;
    }

    function bindResultElements() {
      $('#category_name').change(function() {
        var val = $.trim($(this).val().toLowerCase());
        $(this).val(val);
        $('#categories option[value="-"]').attr('selected', true);
        $('#categories option').each(function(index, elem) {
          if (val === $(this).text()) {
            $(this).attr('selected', true);
          }
        });
      });
      $('#distance_name').change(function() {
        var repl = false;
        var val = $.trim($(this).val().toLowerCase());
        $(this).val(val);
        $('#distances option[value="-"]').attr('selected', true);
        $('#distance_length').val('');
        $.each(oWinners, function(index, distance) {
          if (val === index) {
            $('#distances option[value=' + val + ']').attr('selected', true);
            $('#distance_length').val(distance.km);
            createCategorySelect(val);
            repl = true;
          }
        });
        if (!repl) {
          createCategorySelect('-');
        }
      });
    }

    function bindResultForm() {

      $('#result_form').bind('submit', function(oEvent) {
        oEvent.preventDefault();
        if (!validateData()) {
          return false;
        }
        facade.ajax({
          type : 'post',
          url : 'ajax',
          data : $('#result_form').serialize(),
          dataType : 'html',
          beforeSend : function() {
            $("#lightbox p[class='error']").hide();
          },
          success : function(sData) {
            $('#ebilightbox').html(sData);
            $('#ebilightbox').html(sData);
            if ($('#ebilightbox form').length > 0) {
              createDistanceSelect();
              bindResultForm();
            }
          }
        });

      });
      bindFormElements('#ebilightbox');
      bindResultElements();
      bindPositions();
      bindSuggestions();
    }

    function createCategorySelect(distance_val, category_val) {
      var selCat = $('#categories').unbind();
      $('#categories option').remove();

      if (oWinners[distance_val] && 0 < oWinners[distance_val]['categories'].length) {
        category_val = category_val || 0;
        $.each(oWinners[distance_val]['categories'], function(index, cat) {
          var isCurrentCategory = (category_val === cat.category_name || category_val === index);
          selCat.append('<option ' + (isCurrentCategory ? 'selected ' : '') + 'class="category-select" value="' + index + '">' + cat.category_name + '</option>');
          if (isCurrentCategory) {
            var categoryData = oWinners[distance_val]['categories'][index];
            $('#category_racers').val(categoryData ? categoryData.racers : '0');
            $('#best_category_result_hours').val(categoryData ? categoryData.h : '00');
            $('#best_category_result_minutes').val(categoryData ? categoryData.m : '00');
            $('#best_category_result_seconds').val(categoryData ? categoryData.s : '00');
            $('#category_name').val(cat.category_name).hide();
            $('#category_name_label').hide();
          }
        });
      } else {
        $('#category_name').val('').show();
        $('#category_name_label').show();
      }
      selCat.append('<option value="-">inna</option>');

      selCat.change(function() {
        var category = $(this).val();
        var categoryData = category !== '-' ? oWinners[distance_val]['categories'][category] : null;
        $('#category_racers').val(category !== '-' ? categoryData.racers : '0');
        $('#best_category_result_hours').val(category !== '-' ? categoryData.h : '00');
        $('#best_category_result_minutes').val(category !== '-' ? categoryData.m : '00');
        $('#best_category_result_seconds').val(category !== '-' ? categoryData.s : '00');
        if (category !== '-') {
          $('#category_name').val(oWinners[distance_val]['categories'][category]['category_name']).hide();
          $('#category_name_label').hide();
        } else {
          $('#category_name').val('').show();
          $('#category_name_label').show();
        }
      });
    }

    function selectDistance(distance) {
      var distanceData = (distance !== '-' && oWinners[distance] !== undefined && oWinners[distance].open !== undefined) ? oWinners[distance].open : null;
      $('#racers').val(distanceData ? distanceData.racers : '0');
      $('#best_result_hours').val(distanceData ? distanceData.h : '00');
      $('#best_result_minutes').val(distanceData ? distanceData.m : '00');
      $('#best_result_seconds').val(distanceData ? distanceData.s : '00');
      $('#category_racers').val('0');
      $('#best_category_result_hours').val('00');
      $('#best_category_result_minutes').val('00');
      $('#best_category_result_seconds').val('00');
      $('#category_name').val('');

      if (distance === '-') {
        $('#distance_name').val('').show();
        $('#distance_length').val('').show();
        $('#distance_name_label').show();
        $('#distance_length_label').show();

      } else {
        $('#distance_name').val(distance).hide();
        $('#distance_name_label').hide();

        if (oWinners[distance] !== undefined && oWinners[distance].km !== undefined) {
          $('#distance_length').val(oWinners[distance].km).hide();
          $('#distance_length_label').hide();
        } else {
          $('#distance_length').val('').show();
          $('#distance_length_label').show();
        }
      }

    }

    function createDistanceSelect() {

      var selDist = $('#distances').unbind();

      $('#distances option').remove();
      var distance_val = $('#distance_name').val();
      var category_val = $('#category_name').val();
      $.each(oWinners, function(index, distance) {
        selDist.append('<option ' + (distance_val === index ? 'selected ' : '') + ' class="distance-select" value="' + index + '">' + index + (distance.km ? ' (' + distance.km + 'km)' : '') +
            '</option>');
        if (distance_val === index) {
          var distanceData = oWinners[distance_val].open ? oWinners[distance_val].open : null;
          $('#racers').val(distanceData ? distanceData.racers : '0');
          $('#best_result_hours').val(distanceData ? distanceData.h : '00');
          $('#best_result_minutes').val(distanceData ? distanceData.m : '00');
          $('#best_result_seconds').val(distanceData ? distanceData.s : '00');
        }
      });
      selDist.append('<option value="-">inny</option>');

      selDist.change(function() {
        var distance = $(this).val();
        selectDistance(distance);
        createCategorySelect(distance);
      });

      distance_val = $('#distances').val();
      selectDistance(distance_val);
      createCategorySelect(distance_val, category_val);
    }

    function _bindConfirmResultRemove(params) {
      var elem = $('#result_' + params.id + ' .cnr-result-remove');
      var html = "<p>Czy na pewno chcesz usunąć wynik?</p><button class='btn btn-small btn-danger confirm-remove'>Usuń</button><button class='btn btn-small cancel-remove'>Anuluj</button>";
      elem.popover({
        html : true,
        content : html,
        title : 'Potwierdzenie',
        placement : 'right'
      });

      $('body').on('click', '#result_' + params.id + ' .confirm-remove', function() {
        elem.popover('hide');
        _removeResult(params);
      });
      $('body').on('click', '#result_' + params.id + ' .cancel-remove', function() {
        elem.popover('hide');
      });
    }

    function _removeResult(params) {
      var iId = params.id;
      var iScheduleId = params.schedule_id || 0;
      var oResult = $('#result_' + iId);
      var urlData = {
        dao : 11,
        action : 5,
        dataType : 'json',
        params : JSON.stringify({
          id : iId
        })
      };
      facade.ajax({
        data : urlData,
        url : 'ajax',
        beforeSend : function() {},
        complete : function() {},
        success : function(oData) {
          if (!Number(oData['delete'].iStatus)) {
            facade.notify({
              type : 'result-removed',
              data : {
                id : oData['delete'].result_id
              }
            });
            if (iScheduleId) {
              facade.notify({
                type : 'event-attending-member-removed',
                data : {
                  id : "8_" + iScheduleId
                }
              });
            }
          } else {
            facade.dialogError({
              title : 'Błąd',
              content : oData['delete'].sMessage,
              errors : oData.errors
            });
          }
        },
        cache : false,
        global : false
      });
    }

    function showAddForm(iScheduleId) {
      var sUrlData = "dao=11&action=1&schedule_id=" + iScheduleId;
      facade.ajax({
        type : 'POST',
        data : sUrlData,
        dataType : 'html',
        url : 'ajax',
        beforeSend : function() {},
        success : function(sData) {
          $("#ebilightbox").empty().html(sData).modal('show');
          if ($('#result_form').length) {
            createDistanceSelect();
            bindResultForm();
          }
          bindDatepicker();
        },
        cache : false
      });
    }
    function showEditForm(iId) {
      var sUrlData = "dao=11&action=3&id=" + iId;
      facade.ajax({
        type : 'POST',
        data : sUrlData,
        dataType : 'html',
        url : 'ajax',
        beforeSend : function() {},
        success : function(sData) {
          $("#ebilightbox").empty().html(sData).modal('show');
          if ($('#result_form').length) {
            createDistanceSelect();
            bindResultForm();
          }
        },
        cache : false
      });
    }

    function bindDatepicker() {
      $('#datepicker').datepicker({
        format : 'yyyy-mm-dd',
        language : 'pl'
      }).on('changeDate', function(ev) {
        var date = $('#add_race_day').val();
        getRaces4SelectedDate(date);
      });
      $('#datepicker').datepicker('show');
    }

    function getRaces4SelectedDate(dateTxt) {

      var sUrlData = "dao=8&action=12&start_day=" + dateTxt + "&dataType=json";

      facade.ajax({
        type : 'POST',
        data : sUrlData,
        url : 'ajax',
        beforeSend : function() {
          $('#races').html('<h6 class="loading">szukam wyścigów...</h6>');
        },
        success : function(data) {

          if (data.error) {
            $('#races').html('<h6>' + data.error.s_message + '</h6>');
          } else {
            var foundItems = data.schedule.length;
            var items = data.schedule;

            $('#races').html('<h4>Wybierz wyścig</h4>').append(
                '<p>W dniu <span class="label label-info">' + dateTxt + '</span> odbyły się wyścigi (' + foundItems + '). Wybierz do którego chcesz dodać wynik.</p>').append(
                '<ul id="races_list" class="unstyled"></ul');
            if (foundItems) {
              $.each(items, function(index, race) {
                $('#races_list').height($('#datepicker').height());
                $('#races_list').append('<li class="race-item addResult" id="schedule_' + race.id + '"><b>' + race.race_name + '</b> - ' + race.start_place + ' (' + race.race_sort + ')</li>');
              });
            }
          }
        },
        cache : false,
        global : false
      });
    }

    function bindButtons() {
      $('body').on('click', '.addResult', function(e) {
        var userSigned = facade.getUserData() != null;
        if (!userSigned) {
          facade.notify({
            type : 'user-sign-in-form'
          });
          e.stopPropagation();
          e.preventDefault();
          return false;
        }
        var scheduleId = ($(this).attr('id') || '').split('_')[1];
        showAddForm(scheduleId);
        e.preventDefault();
        return false;
      });
      $('body').on('click', '.editResult', function() {
        var id = ($(this).attr('id') || '').split('_')[1];
        showEditForm(id);
      });

      $('.cnr-result-remove').each(function(index) {
        var elem = $(this);
        var params = {
          id : elem.attr('data-id'),
          schedule_id : elem.attr('data-schedule-id')
        };
        _bindConfirmResultRemove(params);
      });
    }
    return {
      init : function(data) {
        facade.listen('result-set-winners', this.initResult, this);
        facade.listen('result-removed', this.resultRemoved, this);
        bindButtons();
      },

      initResult : function(messageInfo) {
        var aData = messageInfo.data;
        oWinners = {};
        if (aData.length) {
          $.each(aData, function(index, winner) {
            var distance = winner.distance_name;
            var distance_length = winner.distance_length;
            var category = (winner.category_name).toLowerCase();

            if (!oWinners[distance]) {
              oWinners[distance] = {
                'km' : 0,
                'open' : {},
                'categories' : []
              };
            }
            if (distance_length) {
              oWinners[distance]['km'] = distance_length;
            }
            if (category === 'open') {
              oWinners[distance]['open'] = winner;
            } else {
              oWinners[distance]['categories'].push(winner);
            }
          });
        }
      },
      resultRemoved : function(messageInfo) {
        var data = messageInfo.data;
        $("#result_" + data.id).fadeOut(500);
      },
      destroy : function() {}
    };
  };
});
