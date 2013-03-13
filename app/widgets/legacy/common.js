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
  var photoDescriptionValue = $("input[name='photo_description']").val();
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

  if (descriptionValue.length < 60) {
    setErrorCommunique('description_communique', 'Opis nie został poprawnie wypełniony: wpisz tekst o długości minimum 60 znaków');
    errors += 1;
  }

  if (titleValue.length < 3 || titleValue.length > 80) {
    setErrorCommunique('title_communique', 'Tytuł nie został poprawnie wypełniony: wpisz tekst o długości 3-80 znaków');
    errors += 1;
  }

  if (urlValue.length > 0 && urlValue.indexOf("http://") != 0 && urlValue.indexOf("https://") != 0) {
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
  var startHourValue = $("input[name='start_hour']").val();
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
  if (urlValue.length > 0 && urlValue.indexOf("http://") != 0 && urlValue.indexOf("https://") != 0) {
    setErrorCommunique('url_communique', 'Adres strony musi zaczynać się od http:// lub https://');
    errors += 1;
  }
  if (errors > 0) {
    setErrorCommunique('validation_communique', 'Nie wszystkie pola formularza zostały poprawnie wypełnione. Popraw błędne pola i spróbuj raz jeszcze.');
    return false;
  }
  return true;
}
function setErrorCommunique(fieldName, textMsg) {
  $('#' + fieldName).closest('.control-group').addClass('error alert alert-error');
  $('#' + fieldName).html(textMsg);
  $('#' + fieldName).fadeIn(1000);
}

$(document).ready(function() {

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

  $('body').addClass('body_bg');
  $('#outside_container').addClass('outside_container_bg');
  $('#content').addClass('content_bg');

  var avatar = $('#user_menu .avatar').attr('src');
  $('#comment_form .avatar').attr('src', avatar);

  $('body').ajaxStart(function() {
    var oCss = {
      'height' : document.body.offsetHeight + "px",
      'width' : document.body.offsetWidth + "px"
    };
    $(document.body).find('#preloader_content').show().css(oCss).end().find('#preloader_bg').show().css(oCss);
    $('#preloader_bg').css("opacity", 0.6);
  });
  $('body').ajaxStop(function() {
    $(document.body).find('#preloader_content').hide().end().find('#preloader_bg').hide();
  });

});
