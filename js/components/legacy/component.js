/*jshint maxparams:25, maxcomplexity:20, unused:false, strict:false */
/*global $, wrapSelection */
function setErrorCommunique(fieldName, textMsg) {
  $('#' + fieldName).closest('.control-group').addClass('error alert alert-error');
  $('#' + fieldName).html(textMsg);
  $('#' + fieldName).fadeIn(1000);
}

var Schedule = {

  getRaces4selectedDay: function(sStartDay) {
    var sUrlData = "dao=8&action=12&start_day=" + sStartDay;

    $.ajax({
      type: 'POST',
      data: sUrlData,
      url: 'ajax',
      beforeSend: function() {
        $("#planned_races").hide();
      },
      success: function(sData) {
        $("#planned_races").html(sData);
      },
      cache: false,
      global: false
    });
  }
};
var User = {

  checkUsername: function(sUsername, iUserId) {
    if (sUsername.length < 3 || sUsername.length > 25) {
      setErrorCommunique('username_communique', 'Prosimy o podanie nazwy użytkownika zawierającej od 3 do 25 znaków.');
      return;
    }
    var urlData = {
      dao: 21,
      action: 10,
      dataType: 'json',
      username: sUsername,
      user_id: iUserId
    };
    $.ajax({
      type: 'POST',
      data: urlData,
      dataType: 'json',
      url: 'ajax',
      beforeSend: function() {
        $(".control-group").first().removeClass('alert alert-error error').find('span[id$="communique"]').text('Sprawdzam dostępność...');

      },
      success: function(aData) {
        $(".control-group").first().find('span[id$="communique"]').text('');
        if (0 === aData.i_status) {
          if (aData.b_nicknameUsed) {
            setErrorCommunique('username_communique', 'Podana nazwa użytkownika jest już zajęta.');
          } else {
            $(".control-group").first().find('span[id$="communique"]').text('Nazwa użytkownika jest dostępna.');
          }
        }
      },
      cache: false,
      global: false
    });
  }
};

function bindNewWindow() {

  $('body').on('click', '.new_window, .cnr-new-window', function() {
    window.open(this.href);
    return false;
  });
}

function validateSchedule() {

  var errors = 0, raceNameValue = $("input[name='race_name']").val(), startPlaceValue = $("input[name='start_place']").val(), startDayValue = $("input[name='start_day']").val(), urlValue = $(
    "input[name='url']").val(), sortValue = +$("select[name='race_sort']").val();

  if (startDayValue.length < 1) {
    setErrorCommunique('start_day_communique', 'Data wyścigu nie została wybrana');
    errors += 1;
  }
  if (raceNameValue.length < 1) {
    setErrorCommunique('race_name_communique', 'Nazwa wyścigu lub cyklu jest wymagana');
    errors += 1;
  }
  if (startPlaceValue.length < 1) {
    setErrorCommunique('start_place_communique', 'Miejsce startu jest wymagane');
    errors += 1;
  }
  if (!sortValue) {
    setErrorCommunique('race_sort_communique', 'Rodzaj wyścigu nie został wybrany');
    errors += 1;
  }
  if (urlValue.length > 0 && urlValue.indexOf("http://") !== 0 && urlValue.indexOf("https://") !== 0) {
    setErrorCommunique('url_communique', 'Adres strony musi zaczynać się od http:// lub https://');
    errors += 1;
  }
  if (errors > 0) {
    setErrorCommunique('validation_communique', 'Nie wszystkie pola formularza zostały poprawnie wypełnione. Popraw błędne pola i spróbuj raz jeszcze.');
    return false;
  }
  return true;
}

function bindLoadEvents() {

  bindNewWindow();

  $('html').click(function() {
    $('.user_quickbox').not('.hidden').addClass('hidden');
    $('#menu #actions_btn.active').removeClass('active');
  });
  $('body').on('click', '.user_quickbox, #user_menu .button, #user_menu .welcome, #menu #actions_btn', function(e) {
    e.stopPropagation();
  });
  $('#menu #actions_btn').on('click', function() {
    $(this).toggleClass('active');
  });

  setTimeout(function() {
    $("#userData_communique").fadeOut(2000);
  }, 5000);


  $('#schedule_start_datepicker').datepicker({
    format: 'yyyy-mm-dd',
    language: 'pl'
  }).on('changeDate', function(ev) {
    $('#schedule_start_day').val($('#schedule_start_datepicker').data('date'));
    var date = $('#schedule_start_day').val();
    Schedule.getRaces4selectedDay(date);
    $('#schedule_start_datepicker').datepicker('hide');
  });

  $('#schedule_cycle').change(function() {
    var cycleName = $(this);
    var raceName = $("#schedule_race_name");
    var changeValue = true;
    if (raceName.val()) {
      changeValue = false;
      $(this).find('option').each(function() {
        if ($(this).text() === raceName.val()) {
          changeValue = true;
        }
      });
    }
    if (changeValue) {
      if (cycleName.val() !== 'inny') {
        raceName.val(cycleName.val());
      } else {
        raceName.val('');
      }
    }
  });

  $('#myCarousel').carousel({
    interval: 5000
  }).bind('slid', function(evt) {
    var id = $("#myCarousel .item.active").attr("data-id");
    $("#myCarousel .carousel-items article.active").removeClass("active");
    $("#myCarousel .carousel-items article[data-id=" + id + "]").addClass("active");
  });

  $('#myCarousel .carousel-items article').bind("mouseover", function(evt) {
    var id = +$(this).attr('data-id') - 1;
    $("#myCarousel .active").removeClass("active");
    $("#myCarousel .carousel-items article[data-id=" + (id + 1) + "]").addClass("active");
    $("#myCarousel .item[data-id=" + (id + 1) + "]").addClass("active");
  });

  $(function() {
    $("body").tooltip({
      selector: "a[rel=tooltip]"
    });
  });
}

function bindFormEvents() {

  $('body').on('submit', '#schedule_form', function() {
    var valid;
    var form = $(this);
    var button = form.find(':input[type=submit]');

    button.button('loading');
    form.find(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
    valid = validateSchedule();
    if (valid === false) {
      button.button('reset');
    }
    return valid;
  });
  $('body').on('submit', '#user_data_form, #team_form, #password_change_form', function() {
    var button = $(this).find(':input[type=submit]');

    button.button('loading');
    return true;
  });
}

/*
 * Sample usage: var _core = _core || []; _core.push(['register', 'instruction
 * 1', 'instruction', {test: 'test'}]); _core.push(['notify', {type: 'test'}]);
 */
var _core = _core || [];

define(['jquery', 'legacy/core', 'legacy/creators/comment', 'legacy/creators/component', 'legacy/creators/draft', 'legacy/creators/entryView', 'legacy/creators/eventAttending', 'legacy/creators/facebook', 'legacy/creators/fileUploader', 'legacy/creators/news', 'legacy/creators/map', 'legacy/creators/mapHandler', 'legacy/creators/message', 'legacy/creators/photoView', 'legacy/creators/plot',
  'legacy/creators/scheduleResult', 'legacy/creators/scheduleView', 'legacy/creators/teamView', 'legacy/creators/track', 'legacy/creators/trackView',
  'legacy/creators/user', 'legacy/creators/usersDataView'], function($, core, commentCallback, componentCallback, draftCallback, entryViewCallback, eventAttendingCallback, facebookCallback, fileUploaderCallback, newsCallback, mapCallback, mapHandlerCallback, messageCallback, photoViewCallback, plotCallback, scheduleResultCallback, scheduleViewCallback, teamViewCallback, trackCallback, trackViewCallback, userCallback, usersDataViewCallback) {
  'use strict';

  window.Core = core;
  core.creator.register('comment', commentCallback);
  core.creator.register('component', componentCallback);
  core.creator.register('draft', draftCallback);
  core.creator.register('entryView', entryViewCallback);
  core.creator.register('eventAttending', eventAttendingCallback);
  core.creator.register('facebook', facebookCallback);
  core.creator.register('fileUploader', fileUploaderCallback);
  core.creator.register('news', newsCallback);
  core.creator.register('map', mapCallback);
  core.creator.register('mapHandler', mapHandlerCallback);
  core.creator.register('message', messageCallback);
  core.creator.register('photoView', photoViewCallback);
  core.creator.register('plot', plotCallback);
  core.creator.register('scheduleResult', scheduleResultCallback);
  core.creator.register('scheduleView', scheduleViewCallback);
  core.creator.register('teamView', teamViewCallback);
  core.creator.register('track', trackCallback);
  core.creator.register('trackView', trackViewCallback);
  core.creator.register('user', userCallback);
  core.creator.register('usersDataView', usersDataViewCallback);

  $(document).ready(function() {
    var length = _core.length;
    var action;

    bindLoadEvents();
    bindFormEvents();

    while (length--) {
      action = _core.shift();
      if ('register' === action[0]) {
        var data = action[3] || null;
        core.register(action[1], action[2], data);
      }
      _core.push(action);
    }
    core.startAll();
    length = _core.length;
    while (length--) {
      action = _core.shift();
      if ('notify' === action[0]) {
        core.notify(action[1]);
      }
    }
  });
});
