/*jshint strict:false */
define(function() {
  return function(sandbox, $) {
    'use strict';

    var timeVal = 500;
    var infoLoaded = false;
    function _getUserPanel() {

      infoLoaded = true;

      var urlData = {
        dao : 22,
        action : 12,
        dataType : 'json'
      };
      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        cache : false,
        global : false
      }).done(function(oData) {
        if (oData.data) {
          sandbox.notify({
            type : 'user-data-loaded',
            data : oData.data
          });
        } else {
          sandbox.dialogError({
            title : 'Błąd',
            content : oData.error.sMessage,
            errors : oData.errors
          });
        }
      });
    }

    function bindSignInForm() {

      $('body').on('click', '.cnr-sign-in-form', function() {
        sandbox.notify({
          type : 'user-sign-in-form'
        });
        return false;
      });

      $('body').on('submit', '#log_in_form', function() {
        var form = $(this);
        var submitButton = form.find(':input[type="submit"]');

        submitButton.button('loading');
        sandbox.ajax({
          type : 'post',
          url : 'ajax',
          data : form.serialize(),
          dataType : 'html',
          beforeSend : function() {
            $("#lightbox p[class='error']").hide();
          }
        }).done(function(data) {
          $('#ebilightbox').html(data);
          $("#ebilightbox p[class='error']").fadeIn('slow');
          $('#nickname').trigger('focus');
        }).always(function() {
          submitButton.button('reset');
        });
        return false;
      });
    }

    function bindRegistrationForm() {

      $('body').on('click', '.cnr-registration-form', function() {
        sandbox.notify({
          type : 'user-registration-form'
        });
        return false;
      });

      $('body').on('submit', '#registration_form', function() {
        var form = $(this);
        var submitButton = form.find(':input[type="submit"]');

        submitButton.button('loading');
        sandbox.ajax({
          type : 'post',
          url : 'ajax',
          data : form.serialize(),
          dataType : 'html',
          beforeSend : function() {
            $("#ebilightbox p[class='error']").hide();
          }
        }).done(function(data) {
          $('#ebilightbox').html(data);
          $("#ebilightbox p[class='error']").fadeIn('slow');
          $('#registration_username').trigger('focus');
        }).always(function() {
          submitButton.button('reset');
        });
        return false;
      });
    }

    function bindReminderForm() {

      $('body').on('click', '.reminder-form', function() {
        sandbox.notify({
          type : 'user-reminder-form'
        });
        return false;
      });

      $('body').on('submit', '#reminder_form', function() {
        var form = $(this);
        var submitButton = form.find(':input[type="submit"]');

        submitButton.button('loading');
        sandbox.ajax({
          type : 'post',
          url : 'ajax',
          data : form.serialize(),
          dataType : 'html',
          beforeSend : function() {
            $("#ebilightbox p[class='error']").hide();
          }
        }).done(function(data) {
          $('#ebilightbox').html(data);
          $("#ebilightbox p[class='error']").fadeIn('slow');
          $('#reminder_email').trigger('focus');
        }).always(function() {
          submitButton.button('reset');
        });
        return false;
      });
    }

    function bindRecommendationForm() {

      $('body').on('submit', '#recommendation_form', function() {
        var form = $(this);
        var submitButton = form.find(':input[type="submit"]');

        submitButton.button('loading');
        sandbox.ajax({
          type : 'post',
          url : 'ajax',
          data : form.serialize(),
          dataType : 'html',
          beforeSend : function() {
            $("#recommendation_box p[class='error']").hide();
          }
        }).done(function(data) {
          $('#recommendation_box').html(data);
          setTimeout(function() {
            $("#recommendation_communique").fadeOut(2000);
          }, 5000);
        }).always(function() {
          submitButton.button('reset');
        });
        return false;
      });
    }

    function bindSignOutButton() {
      $('body').on('click', '.cnr-sign-out', function() {
        var signOutButton = $(this);

        signOutButton.button('loading');
        sandbox.notify({
          type : 'facebook-logout',
          data : {
            callback : function() {
              sandbox.ajax({
                type : "POST",
                url : "ajax",
                data : "dao=21&action=3",
                dataType : 'html',
                cache : false
              }).done(function(data) {
                $('#user_panel').html(data);
              }).always(function() {
                signOutButton.button('reset');
              });
            }
          }
        });
        return false;
      });
    }

    return {
      init : function() {
        sandbox.listen('user-registration-form', this.showRegistrationForm, this);
        sandbox.listen('user-sign-in-form', this.showSignInForm, this);
        sandbox.listen('user-signed-in', this.signedIn, this);
        sandbox.listen('user-reminder-form', this.showReminderForm, this);
        sandbox.listen('user-signed-out', this.signedOut, this);
        sandbox.listen('user-data-loaded', this.appendUserData, this);

        bindRegistrationForm();
        bindSignInForm();
        bindReminderForm();
        bindSignOutButton();
        bindRecommendationForm();
      },
      showRegistrationForm : function() {
        sandbox.ajax({
          type : 'POST',
          url : 'ajax',
          data : "dao=21&action=4",
          dataType : 'html',
          cache : false
        }).done(function(data) {
          $("#ebilightbox").html(data).modal();
        });
      },
      showSignInForm : function() {
        sandbox.ajax({
          type : 'POST',
          url : 'ajax',
          data : "dao=21&action=1",
          dataType : 'html',
          cache : false
        }).done(function(data) {
          $("#ebilightbox").html(data).modal();
        });
      },
      signedIn : function(messageInfo) {
        var user = messageInfo.data;

        sandbox.setUserData(user);
        if ($('body.cnr-user-loading').length > 0) {
          $('body').removeClass('cnr-user-loading');
          $('.signed-out, .user-signed-in, .team_member, .user-signed-in-exclude').hide();
        } else {
          $(".signed-out").fadeOut(timeVal);
        }
        if ($("#member_" + user.nick).length > 0) {
          $("#join_team_button").fadeOut(timeVal);
          $("#leave_team_button, .team_member").fadeIn(timeVal);
        } else {
          $("#join_team_button").fadeIn(timeVal);
          $("#leave_team_button, .team_member").fadeOut(timeVal);
        }
        var selectorSignIn = '.signed-in, .user-signed-in[data-user-id=' + user.id + '], .user-signed-in-exclude[data-user-id-exclude!=' + user.id + ']';
        $.each(user.permissions.split(','), function() {
          if (this.length) {
            selectorSignIn += ', .user-signed-in[data-permission="' + this + '"]';
          }
        });
        $(selectorSignIn).fadeIn(timeVal);
        $('#comment_form .avatar').attr('src', user.avatar);

        $('#user_menu .welcome').click(function() {
          $('.user_quickbox').not('.data').addClass('hidden');
          $('.user_quickbox.data').toggleClass('hidden');
          if (!infoLoaded) {
            _getUserPanel();
          }
        });
        $('.cnr-add-dropdown').off('click.signed-out');
      },
      showReminderForm : function() {
        sandbox.ajax({
          type : 'POST',
          url : 'ajax',
          data : "dao=21&action=6",
          dataType : 'html',
          cache : false
        }).done(function(data) {
          $("#ebilightbox").html(data);
        });
      },
      signedOut : function() {
        sandbox.setUserData(null);
        if ($('body.cnr-user-loading').length > 0) {
          $('body').removeClass('cnr-user-loading');
          $('.signed-in, .user-signed-in, .team_member, .user-signed-in-exclude').hide();
        } else {
          $('.signed-in, .user-signed-in, .team_member, .user-signed-in-exclude').fadeOut(timeVal);
        }
        $(".signed-out").fadeIn(timeVal);
        $('.cnr-add-dropdown').on('click.signed-out', function() {
          sandbox.notify({
            type : 'user-sign-in-form'
          });
          return false;
        });
        infoLoaded = false;
      },
      appendUserData : function(messageInfo) {
        var data = $(sandbox.template('userInfo', messageInfo.data));
        $('#user_menu .user_quickbox.data .info_panel .activities').append(data);
      },
      destroy : function() {}
    };

  };
});
