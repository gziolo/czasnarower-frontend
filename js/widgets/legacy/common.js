/*global wrapSelection */
function setErrorCommunique(fieldName, textMsg) {
  $('#' + fieldName).closest('.control-group').addClass('error alert alert-error');
  $('#' + fieldName).html(textMsg);
  $('#' + fieldName).fadeIn(1000);
}

var Schedule = {

  getRaces4selectedDay : function(sStartDay) {
    var sUrlData = "dao=8&action=12&start_day=" + sStartDay;

    $.ajax({
      type : 'POST',
      data : sUrlData,
      url : 'ajax',
      beforeSend : function() {
        $("#planned_races").hide();
      },
      success : function(sData) {
        $("#planned_races").html(sData);
      },
      cache : false,
      global : false
    });
  }
};

var Forum = {

  Thread : {

    validateForm : function() {

      $(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
      var errors = 0;

      var titleValue = $("input[name='title']").val();
      var descriptionValue = $("textarea[name='message']").val();

      if (descriptionValue && descriptionValue.length < 1) {
        setErrorCommunique('description_communique', 'Wpisz treść wiadomości');
        errors += 1;
      }

      if (titleValue.length < 3 || titleValue.length > 80) {
        setErrorCommunique('title_communique', 'Tytuł nie został poprawnie wypełniony: wpisz tekst o długości 3-80 znaków');
        errors += 1;
      }

      if (errors > 0) {
        setErrorCommunique('validation_communique', 'Nie wszystkie pola formularza zostały poprawnie wypełnione. Popraw błędne pola i spróbuj raz jeszcze.');
        return false;
      }
      return true;
    }
  }

};

var HTMLtextarea = {
  setBold : function() {
    wrapSelection("'''", "'''", "Pogrubienie");
  },
  setCite : function() {
    wrapSelection('"""', '"""', "Cytat");
  },
  setHeader : function() {
    if (document.selection) {
      wrapSelection("\r\n== ", " ==\n", "Nagłówek");
    } else {
      wrapSelection("\n== ", " ==\n", "Nagłówek");
    }
  },
  setLink : function() {
    wrapSelection("[", " tytuł linka]", "http://www.example.com");
  },
  setList : function() {
    if (document.selection) {
      wrapSelection("\r\n* element A\r\n* element B\r\n* element C", "", "");
    } else {
      wrapSelection("\n* element A\n* element B\n* element C", "", "");
    }
  }
};

function bindNewWindow(sTarget) {

  sTarget = sTarget ? sTarget + " " : "";
  $(sTarget + ".new_window").click(function() {
    window.open(this.href);
    return false;
  });
}

function bindFormElements(sTarget) {

  sTarget = sTarget ? sTarget + " " : "";
  $(sTarget + "input[class='button']").hover(function() {
    $(this).parent("fieldset").addClass("active");
  }, function() {
    $(this).parent("fieldset").removeClass("active");
  });

  $(sTarget + ".submit_button").hover(function() {
    $(this).parent().parent().addClass("active");
  }, function() {
    $(this).parent().parent().removeClass("active");
  });

  $(sTarget + "input" + ", " + sTarget + "textarea").not("[type='submit']").focus(function() {
    $(this).addClass("focused");
  });
  $(sTarget + "input" + ", " + sTarget + "textarea").not("[type='submit']").blur(function() {
    $(this).removeClass("focused");
  });

}

function bindButtons(sTarget) {

  sTarget = sTarget ? sTarget + " " : "";
  $("ul[class='popular'] li h5 a").hover(function() {
    $(this).parents("h5").parents("li").addClass("active");
  }, function() {
    $(this).parents("h5").parents("li").removeClass("active");
  });

  $("#user_menu li a").hover(function() {
    $(this).parents("li").addClass("active");
  }, function() {
    $(this).parents("li").removeClass("active");
  });

  $("p .edit a, h6 .edit a").hover(function() {
    $(this).parents("span").addClass("active");
  }, function() {
    $(this).parents("span").removeClass("active");
  });
}

function validateUserPhoto() {

  $(".control-group").removeClass('alert alert-error error');

  var photoValue = $("input[name='photo']").val();
  if (!photoValue) {
    setErrorCommunique('photo_error_communique', 'Prosimy o dodanie zdjęcia');
    return false;
  }
  return true;
}
function sendUserPhoto() {
  var result = validateUserPhoto();
  if (result) {
    $('#photo_form .submit_button').attr('disabled', 'disabled');
  }
  return result;
}
function validateNews() {

  $(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();

  var errors = 0;

  var titleValue = $("input[name='title']").val();
  var descriptionValue = $("textarea[name='description']").val();
  var urlValue = $("input[name='url']").val();
  var bDraft = ($("input[name='draft']").val() === '1');
  var category = +$("select[name='category']").val();
	  
  if (titleValue.length < 3 || titleValue.length > 80) {
    setErrorCommunique('title_communique', 'Tytuł nie został poprawnie wypełniony: wpisz tekst o długości 3-80 znaków');
    errors += 1;
  }
  if(!category) {
    setErrorCommunique('news_category_communique', 'Kategoria nie została wybrana');
    errors += 1;
  }
  if (!bDraft && descriptionValue.length < 60) {
    setErrorCommunique('description_communique', 'Opis nie został poprawnie wypełniony: wpisz tekst o długości minimum 60 znaków');
    errors += 1;
  }

  if (!bDraft && urlValue.length > 0 && urlValue.indexOf("http://") !== 0 && urlValue.indexOf("https://") !== 0) {
    setErrorCommunique('url_communique', 'Adres strony musi zaczynać się od http:// lub https://');
    errors += 1;
  }

  if (errors > 0) {
    setErrorCommunique('validation_communique', 'Nie wszystkie pola formularza zostały poprawnie wypełnione. Popraw błędne pola i spróbuj raz jeszcze.');
    return false;
  }
  return true;
}

function validateSchedule() {

  $(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();

  var errors = 0;
  var raceNameValue = $("input[name='race_name']").val();
  var startPlaceValue = $("input[name='start_place']").val();
  var startDayValue = $("input[name='start_day']").val();
  var urlValue = $("input[name='url']").val();

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

  bindButtons();
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

  var avatar = $('#user_menu .avatar').attr('src');
  $('#comment_form .avatar').attr('src', avatar);

  $('#schedule_start_datepicker').datepicker({
    format : 'yyyy-mm-dd',
    language : 'pl'
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

  $('.form_steps li').not('.active').css("opacity", 0.5);

  $('input[id=photo]').change(function() {
    $('#photoCover').val($(this).val());
  });

  $('input[id=track_file]').change(function() {
    $('#track_fileCover').val($(this).val());
  });

  $('#myCarousel').carousel({
    interval : 5000
  }).bind('slid', function(evt) {
    var id = $("#myCarousel .item.active").attr("data-id");
    // console.log(id);
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
      selector : "a[rel=tooltip]"
    });
  });
}

/*
 * Sample usage: var _core = _core || []; _core.push(['register', 'instruction
 * 1', 'instruction', {test: 'test'}]); _core.push(['notify', {type: 'test'}]);
 */
var _core = _core || [];

define([ 'jquery', 'legacy/core', 'legacy/creators/comment', 'legacy/creators/component', 'legacy/creators/draft', 'legacy/creators/entryView', 'legacy/creators/eventAttending',
    'legacy/creators/facebook', 'legacy/creators/map', 'legacy/creators/mapHandler', 'legacy/creators/message', 'legacy/creators/photoView', 'legacy/creators/plot', 'legacy/creators/plusone',
    'legacy/creators/scheduleResult', 'legacy/creators/scheduleView', 'legacy/creators/teamView', 'legacy/creators/track', 'legacy/creators/trackView', 'legacy/creators/twitter',
    'legacy/creators/user', 'legacy/creators/usersDataView' ], function($, core, commentCallback, componentCallback, draftCallback, entryViewCallback, eventAttendingCallback, facebookCallback,
    mapCallback, mapHandlerCallback, messageCallback, photoViewCallback, plotCallback, plusoneCallback, scheduleResultCallback, scheduleViewCallback, teamViewCallback, trackCallback,
    trackViewCallback, twitterCallback, userCallback, usersDataViewCallback) {

  window.Core = core;
  core.creator.register('comment', commentCallback);
  core.creator.register('component', componentCallback);
  core.creator.register('draft', draftCallback);
  core.creator.register('entryView', entryViewCallback);
  core.creator.register('eventAttending', eventAttendingCallback);
  core.creator.register('facebook', facebookCallback);
  core.creator.register('map', mapCallback);
  core.creator.register('mapHandler', mapHandlerCallback);
  core.creator.register('message', messageCallback);
  core.creator.register('photoView', photoViewCallback);
  core.creator.register('plot', plotCallback);
  core.creator.register('plusone', plusoneCallback);
  core.creator.register('scheduleResult', scheduleResultCallback);
  core.creator.register('scheduleView', scheduleViewCallback);
  core.creator.register('teamView', teamViewCallback);
  core.creator.register('track', trackCallback);
  core.creator.register('trackView', trackViewCallback);
  core.creator.register('twitter', twitterCallback);
  core.creator.register('user', userCallback);
  core.creator.register('usersDataView', usersDataViewCallback);

  $(document).ready(function() {
    var length = _core.length;
    var action;

    bindLoadEvents();

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
