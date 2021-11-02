/*jshint maxparams:25, maxcomplexity:20, unused:false, strict:false */
/*global $, wrapSelection */
function setErrorCommunique(fieldName, textMsg) {
  $('#' + fieldName).closest('.control-group').addClass('error alert alert-error');
  $('#' + fieldName).html(textMsg);
  $('#' + fieldName).fadeIn(1000);
}

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

define(['jquery',
        'legacy/core',
        'legacy/creators/component',
        'legacy/creators/draft',
        'legacy/creators/entryView',
        'legacy/creators/eventAttending',
        'legacy/creators/fileUploader',
        'legacy/creators/news',
        'legacy/creators/map',
        'legacy/creators/mapHandler',
        'legacy/creators/message',
        'legacy/creators/photoView',
        'legacy/creators/plot',
        'legacy/creators/schedule',
        'legacy/creators/scheduleResult',
        'legacy/creators/scheduleView',
        'legacy/creators/tinymce',
        'legacy/creators/track',
        'legacy/creators/trackView',
        'legacy/creators/user',
        'legacy/creators/usersDataView'],
       function($,
                core,
                componentCallback,
                draftCallback,
                entryViewCallback,
                eventAttendingCallback,
                fileUploaderCallback,
                newsCallback,
                mapCallback,
                mapHandlerCallback,
                messageCallback,
                photoViewCallback,
                plotCallback,
                scheduleCallback,
                scheduleResultCallback,
                scheduleViewCallback,
                tinymceCallback,
                trackCallback,
                trackViewCallback,
                userCallback,
                usersDataViewCallback) {
  'use strict';

  window.Core = core;
  core.creator.register('component', componentCallback);
  core.creator.register('draft', draftCallback);
  core.creator.register('entryView', entryViewCallback);
  core.creator.register('eventAttending', eventAttendingCallback);
  core.creator.register('fileUploader', fileUploaderCallback);
  core.creator.register('news', newsCallback);
  core.creator.register('map', mapCallback);
  core.creator.register('mapHandler', mapHandlerCallback);
  core.creator.register('message', messageCallback);
  core.creator.register('photoView', photoViewCallback);
  core.creator.register('plot', plotCallback);
  core.creator.register('schedule', scheduleCallback);
  core.creator.register('scheduleResult', scheduleResultCallback);
  core.creator.register('scheduleView', scheduleViewCallback);
  core.creator.register('tinymce', tinymceCallback);
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
