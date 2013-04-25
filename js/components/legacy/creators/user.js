/*jshint unused:false */
/*global bindFormElements */
define(function() {
  return function(facade, $) {
    'use strict';

    var timeVal = 500;
    var infoLoaded = false;
    function _getUserPanel() {

      infoLoaded = true;

      var oQuickbox = $('.user_quickbox.data .info_panel .activities');
      var urlData = {
        dao : 22,
        action : 12,
        dataType : 'json'
      };
      facade.ajax({
        data : urlData,
        url : 'ajax',
        beforeSend : function() {
          facade.showLoader({
            elem : oQuickbox,
            msg : 'Trwa wczytywanie...',
            overlayCss : {
              'height' : '0'
            },
            loaderCss : {
              'padding' : '5px',
              'background-color' : 'white',
              'left' : '10px',
              'position' : 'absolute'
            }
          });
        },
        complete : function() {
          facade.hideLoader({
            elem : oQuickbox
          });
        },
        success : function(oData) {
          if (oData.data) {
            facade.notify({
              type : 'user-data-loaded',
              data : oData.data
            });
          } else {
            facade.dialogError({
              title : 'Błąd',
              content : oData.error.sMessage,
              errors : oData.errors
            });
          }
        },
        cache : false,
        global : false
      });
    }

    function bindLoginForm() {

      $('#log_in_form').bind('submit', function(oEvent) {
        $.ajax({
          type : 'post',
          url : 'ajax',
          data : $('#log_in_form').serialize(),
          beforeSend : function() {
            $("#lightbox p[class='error']").hide();
          },
          success : function(sData) {
            $('#ebilightbox').html(sData);
            $("#ebilightbox p[class='error']").fadeIn('slow');
            $('#login_communique').css('backgroundColor', '#FDF8D3');
            $('#login_communique').css('color', '#333333');
            bindLoginForm();
          }
        });
        oEvent.preventDefault();
      });
      bindFormElements('#ebilightbox');
      $('#nickname').trigger('focus');
    }

    function bindRegistrationForm() {

      $('#registration_form input[type=submit]').on('click', function() {
        var submitButton = $(this);
        
        $.ajax({
          type : 'post',
          url : 'ajax',
          data : $('#registration_form').serialize(),
          beforeSend : function() {
            submitButton.button('loading');
            $("#ebilightbox p[class='error']").hide();
          }
        }).done(function(sData) {
          $('#ebilightbox').html(sData);
          $("#ebilightbox p[class='error']").fadeIn('slow');
          $('#registration_communique').css('background-color', '#FDF8D3');
          $('#registration_communique').css('color', '#333333');
          bindRegistrationForm();
        }).always(function() {
          submitButton.button('reset');
        });
        return false;
      });
      
      bindFormElements('#ebilightbox');
      $('#registration_form input').focus(function() {
        $(this).next('label.tip').css('display', 'block');
      }).blur(function() {
        $(this).next('label.tip').fadeOut(1000);
      });
      $('#registration_username').trigger('focus');
    }

    function bindReminderForm() {

      $('#reminder_form').bind('submit', function(oEvent) {
        $.ajax({
          type : 'post',
          url : 'ajax',
          data : $('#reminder_form').serialize(),
          beforeSend : function() {
            $("#ebilightbox p[class='error']").hide();
          },
          success : function(sData) {
            $('#ebilightbox').html(sData);
            $("#ebilightbox p[class='error']").fadeIn('slow');
            bindReminderForm();
          }
        });
        oEvent.preventDefault();
      });
      bindFormElements('#ebilightbox');
      $('#reminder_email').trigger('focus');
    }

    function bindRecommendationForm() {

      $('#recommendation_form').bind('submit', function(oEvent) {
        $.ajax({
          type : 'post',
          url : 'ajax',
          data : $('#recommendation_form').serialize(),
          beforeSend : function() {
            $("#recommendation_box p[class='error']").hide();
          },
          success : function(sData) {
            $('#recommendation_box').html(sData);
            setTimeout(function() {
              $("#recommendation_communique").fadeOut(2000);
            }, 5000);
            bindRecommendationForm();
          }
        });
        oEvent.preventDefault();
      });
      bindFormElements('#recommendation_form');
    }

    return {
      init : function(data) {
        facade.listen('user-registration-form', this.showRegistrationForm, this);
        facade.listen('user-sign-in-form', this.showSignInForm, this);
        facade.listen('user-signed-in', this.signedIn, this);
        facade.listen('user-reminder-form', this.showReminderForm, this);
        facade.listen('user-sign-out', this.signOut, this);
        facade.listen('user-signed-out', this.signedOut, this);
        facade.listen('user-data-loaded', this.appendUserData, this);

        $('body').on('click', '.cnr-registration-form', function(e) {
          facade.notify({
            type : 'user-registration-form'
          });
          e.preventDefault();
        });
        $('body').on('click', '.cnr-sign-in-form', function(e) {
          facade.notify({
            type : 'user-sign-in-form'
          });
          e.preventDefault();
        });
        $('body').on('click', '.reminder-form', function(e) {
          facade.notify({
            type : 'user-reminder-form'
          });
          e.preventDefault();
        });

        $('body').on('click', '.sign-out', function(e) {
          e.stopPropagation();
          facade.notify({
            type : 'user-sign-out'
          });
          e.preventDefault();
        });

        bindRecommendationForm();
      },
      showRegistrationForm : function(messageInfo) {
        facade.ajax({
          type : 'POST',
          url : 'ajax',
          data : "dao=21&action=4",
          dataType : 'html',
          beforeSend : function() {},
          success : function(sData) {
            $("#ebilightbox").html(sData).modal();
            bindRegistrationForm();
            bindFormElements('#ebilightbox');
          },
          cache : false
        });
      },
      showSignInForm : function(messageInfo) {
        facade.ajax({
          type : 'POST',
          url : 'ajax',
          data : "dao=21&action=1",
          dataType : 'html',
          beforeSend : function() {},
          success : function(sData) {
            $("#ebilightbox").html(sData).modal();
            bindLoginForm();
          },
          cache : false
        });
      },
      signedIn : function(messageInfo) {
        var user = messageInfo.data;
        facade.setUserData(user);
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
        $(".signed-out").fadeOut(timeVal);
        $('#comment_form .avatar').attr('src', user.avatar);

        $('#user_menu .welcome').click(function() {
          $('.user_quickbox').not('.data').addClass('hidden');
          $('.user_quickbox.data').toggleClass('hidden');
          if (!infoLoaded) {
            _getUserPanel();
          }
        });
      },
      showReminderForm : function(messageInfo) {
        facade.ajax({
          type : 'POST',
          url : 'ajax',
          data : "dao=21&action=6",
          dataType : 'html',
          beforeSend : function() {},
          success : function(sData) {
            $("#ebilightbox").html(sData);
            bindReminderForm();
            bindFormElements('#ebilightbox');
          },
          cache : false
        });
      },
      signOut : function(messageInfo) {
        facade.notify({
          type : 'facebook-logout',
          data : {
            callback : function() {
              facade.ajax({
                type : "POST",
                url : "ajax",
                data : "dao=21&action=3",
                dataType : 'html',
                beforeSend : function() {},
                success : function(sData) {
                  $('#user_panel').html(sData);
                },
                cache : false
              });
            }
          }
        });
      },
      signedOut : function(messageInfo) {
        facade.setUserData(null);
        $('.signed-in, .user-signed-in, .team_member, .user-signed-in-exclude').fadeOut(timeVal);
        $(".signed-out").fadeIn(timeVal);
        infoLoaded = false;
      },
      appendUserData : function(messageInfo) {
        var data = $(facade.template('userInfo', messageInfo.data));
        $('#user_menu .user_quickbox.data .info_panel .activities').append(data);
      },
      destroy : function() {}
    };

  };
});
