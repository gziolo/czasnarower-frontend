/*jshint strict:false */
/*global setErrorCommunique */
define(function() {
  return function(sandbox, $) {

    var oWinners = {};

    function bindSuggestions() {
      $('.suggest span').click(function() {
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
      $('#position').change(function() {
        if ($(this).val() === '1') {
          $('#best_result_hours').val($('#result_hours').val());
          $('#best_result_minutes').val($('#result_minutes').val());
          $('#best_result_seconds').val($('#result_seconds').val());
        } else {

        }
      });
      $('#category_position').change(function() {
        if ($(this).val() === '1') {
          $('#best_category_result_hours').val($('#result_hours').val());
          $('#best_category_result_minutes').val($('#result_minutes').val());
          $('#best_category_result_seconds').val($('#result_seconds').val());
        } else {

        }
      });
    }
    function validateData() {
      var errors = 0, category_val = $.trim($('#category_name').val()), category_sel_val = $.trim($('#categories option:selected').val()), distance_val = $.trim($('#distance_name').val()), distance_sel_val = $
          .trim($('#distances option:selected').val()), resultHour = $.trim($('#result_hours').val()), resultMinute = $.trim($('#result_minutes').val()), resultSecond = $.trim($('#result_seconds')
          .val()), position_val = $.trim($('#position').val()), bestResultHour = $.trim($('#best_result_hours').val()), bestResultMinute = $.trim($('#best_result_minutes').val()), bestResultSecond = $
          .trim($('#best_result_seconds').val());

      $(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();

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

      errors += validateUserTime(resultHour, resultMinute, resultSecond);
      errors += validateBestUserTime(bestResultHour, bestResultMinute, bestResultSecond);

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
      if (errors > 0) {
        return false;
      }
      return true;
    }

    function validateUserTime(resultHour, resultMinute, resultSecond) {
      var errors = 0;

      if (0 > resultHour || resultHour >= 24) {
        errors += 1;
      }
      if (0 > resultMinute || resultMinute >= 60) {
        errors += 1;
      }
      if (0 > resultSecond || resultSecond >= 60) {
        errors += 1;
      }
      if (errors > 0) {
        setErrorCommunique('result_communique', 'Niepoprawny czas');
      }
      return errors;
    }

    function validateBestUserTime(bestResultHour, bestResultMinute, bestResultSecond) {
      var errors = 0;

      if (0 > bestResultHour || bestResultHour >= 24) {
        errors += 1;
      }
      if (0 > bestResultMinute || bestResultMinute >= 60) {
        errors += 1;
      }
      if (0 > bestResultSecond || bestResultSecond >= 60) {
        errors += 1;
      }
      if (errors > 0) {
        setErrorCommunique('best_result_communique', 'Niepoprawny czas zwycięzcy');
      }
      return errors;
    }

    function bindResultElements() {
      $('#category_name').change(function() {
        var val = $.trim($(this).val().toLowerCase());
        $(this).val(val);
        $('#categories option[value="-"]').attr('selected', true);
        $('#categories option').each(function() {
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
        var button = $(this).find(':input[type=submit]');

        button.button('loading');
        oEvent.preventDefault();
        if (!validateData()) {
          button.button('reset');
          return false;
        }

        sandbox.ajax({
          type : 'post',
          url : 'ajax',
          data : $('#result_form').serialize(),
          dataType : 'html',
          beforeSend : function() {
            $("#lightbox p[class='error']").hide();
          }
        }).done(function(data) {
          $('#ebilightbox').html(data);
          $('#ebilightbox').html(data);
          if ($('#ebilightbox form').length > 0) {
            createDistanceSelect();
            bindResultForm();
          }
        }).always(function() {
          button.button('reset');
        });
      });
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
      var urlData = {
        dao : 11,
        action : 5,
        dataType : 'json',
        params : JSON.stringify({
          id : iId
        })
      };
      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        cache : false,
        global : false
      }).done(function(data) {
        if (!Number(data['delete'].iStatus)) {
          sandbox.notify({
            type : 'result-removed',
            data : {
              id : data['delete'].result_id
            }
          });
          if (iScheduleId) {
            sandbox.notify({
              type : 'event-attending-member-removed',
              data : {
                id : "8_" + iScheduleId
              }
            });
          }
        } else {
          sandbox.dialogError({
            title : 'Błąd',
            content : data['delete'].sMessage,
            errors : data.errors
          });
        }
      });
    }

    function showAddForm(iScheduleId) {
      var sUrlData = "dao=11&action=1&schedule_id=" + iScheduleId;
      sandbox.ajax({
        type : 'POST',
        data : sUrlData,
        dataType : 'html',
        url : 'ajax',
        cache : false
      }).done(function(data) {
        $("#ebilightbox").empty().html(data).modal('show');
        if ($('#result_form').length) {
          createDistanceSelect();
          bindResultForm();
        }
        bindDatepicker();
      });
    }
    function showEditForm(iId) {
      var sUrlData = "dao=11&action=3&id=" + iId;

      sandbox.ajax({
        type : 'POST',
        data : sUrlData,
        dataType : 'html',
        url : 'ajax',
        cache : false
      }).done(function(data) {
        $("#ebilightbox").empty().html(data).modal('show');
        if ($('#result_form').length) {
          createDistanceSelect();
          bindResultForm();
        }
      });
    }

    function bindDatepicker() {
      $('#datepicker').datepicker({
        format : 'yyyy-mm-dd',
        language : 'pl'
      }).on('changeDate', function() {
        var date = $('#add_race_day').val();
        getRaces4SelectedDate(date);
      });
      $('#datepicker').datepicker('show');
    }

    function getRaces4SelectedDate(dateTxt) {

      var sUrlData = "dao=8&action=12&start_day=" + dateTxt + "&dataType=json";

      sandbox.ajax({
        type : 'POST',
        data : sUrlData,
        url : 'ajax',
        beforeSend : function() {
          $('#races').html('<h6 class="loading">szukam wyścigów...</h6>');
        },
        cache : false,
        global : false
      }).done(function(data) {
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
      });
    }

    function bindButtons() {
      $('body').on('click', '.addResult', function(e) {
        var userSigned = sandbox.getUserData() != null;
        if (!userSigned) {
          sandbox.notify({
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

      $('.cnr-result-remove').each(function() {
        var elem = $(this);
        var params = {
          id : elem.attr('data-id'),
          schedule_id : elem.attr('data-schedule-id')
        };
        _bindConfirmResultRemove(params);
      });
    }
    return {
      init : function() {
        sandbox.listen('result-set-winners', this.initResult, this);
        sandbox.listen('result-removed', this.resultRemoved, this);
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
