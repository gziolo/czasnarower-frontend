/*jshint strict:false, maxcomplexity:15 */
/*global DISQUS, setErrorCommunique */
define(function() {
  return function(sandbox, $) {
    'use strict';

    var timeVal = 500;
    var infoLoaded = false;

    function _getUserPanel() {

      infoLoaded = true;

      var urlData = {
        dao: 22,
        action: 12,
        dataType: 'json'
      };
      sandbox.ajax({
        data: urlData,
        url: 'ajax',
        cache: false,
        global: false
      }).done(function(oData) {
        if (oData.data) {
          sandbox.notify({
            type: 'user-data-loaded',
            data: oData.data
          });
        } else {
          sandbox.dialogError({
            title: 'Błąd',
            content: oData.error.sMessage,
            errors: oData.errors
          });
        }
      });
    }

    function bindSignInForm() {

      $('body').on('click', '.cnr-sign-in-form', function() {
        sandbox.notify({
          type: 'user-sign-in-form'
        });
        return false;
      });

      $('body').on('submit', '#log_in_form', function() {
        var form = $(this);
        var submitButton = form.find(':input[type="submit"]');
        submitButton.button('loading');
        sandbox.ajax({
          type: 'post',
          url: 'ajax',
          data: form.serialize(),
          dataType: 'html',
          beforeSend: function() {
            $("#lightbox p[class='error']").hide();
          }
        }).done(function(data) {
          if ($('#ebilightbox').html()) {
            $('#ebilightbox').html(data);
            $("#ebilightbox p[class='error']").fadeIn('slow');
            $('#nickname').trigger('focus');
          } else {
            $('body').html(data);
          }
        }).always(function() {
          submitButton.button('reset');
        });
        return false;
      });
    }

    function bindRegistrationForm() {

      $('body').on('click', '.cnr-registration-form', function() {
        sandbox.notify({
          type: 'user-registration-form'
        });
        return false;
      });

      $('body').on('submit', '#registration_form', function() {
        var $form = $(this);
        var $submitButton = $form.find(':input[type="submit"]');
        $submitButton.button('loading');
        $form.find(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
        // validate email
        var valid = (function() {
          var errors = 0;
          var emailValue = $.trim($form.find("input[type='text'].second:eq(0)").val());
          if (emailValue.length === 0) {
            setErrorCommunique('email_communique', 'Prosimy o podanie adresu email.');
            errors += 1;
          }
          else {
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!regex.test(emailValue)) {
              setErrorCommunique('email_communique', 'Prosimy o podanie poprawnego adresu email.');
              errors += 1;
            }
          }
          return (errors === 0);
        })();
        if (valid === false) {
          $submitButton.button('reset');
          return valid;
        }
        sandbox.ajax({
          type: 'post',
          url: 'ajax',
          data: $form.serialize(),
          dataType: 'html',
          beforeSend: function() {
          }
        }).done(function(data) {
          $('#ebilightbox').html(data);
          $("input[type='text'].second:eq(0)").trigger('focus');
        }).always(function() {
          $submitButton.button('reset');
        });
        return false;
      });
    }

    function bindReminderForm() {

      $('body').on('click', '.reminder-form', function() {
        sandbox.notify({
          type: 'user-reminder-form'
        });
        return false;
      });

      $('body').on('submit', '#reminder_form', function() {
        var form = $(this);
        var submitButton = form.find(':input[type="submit"]');
        submitButton.button('loading');
        form.find(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
        // validate email
        var valid = (function() {
          var errors = 0;
          var emailValue = $.trim(form.find("input[name='email']").val());
          if (emailValue.length === 0) {
            setErrorCommunique('email_communique', 'Prosimy o podanie adresu email.');
            errors += 1;
          }
          else {
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!regex.test(emailValue)) {
              setErrorCommunique('email_communique', 'Prosimy o podanie poprawnego adresu email.');
              errors += 1;
            }
          }
          return (errors === 0);
        })();
        if (valid === false) {
          submitButton.button('reset');
          return valid;
        }
        sandbox.ajax({
          type: 'post',
          url: 'ajax',
          data: form.serialize(),
          dataType: 'html',
          beforeSend: function() {
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

    function bindActivationForm() {
      $('body').on('change', "#registration_username", function() {
        var userNameValue = $.trim($("input[name='username']").val());
        var userId = $("input[name='user_id']").val();
        sandbox.notify({
          type: 'user-nick-availability',
          data: {'username': userNameValue, 'userId': userId}
        });
      });

      $('body').on('submit', '#activation_form', function() {
        var valid;
        var form = $(this);
        var button = form.find(':input[type=submit]');
        button.button('loading');
        form.find(".control-group").removeClass('alert alert-error error').find('span[id$="communique"]').hide();
        valid = (function() {
          var errors = 0,
            userNameValue = $.trim($("input[name='username']").val()),
            password1Value = $("input[type='password'].first:eq(0)").val(),
            password2Value = $("input[type='password'].first:eq(1)").val();

          var nickControlGroup = $("input[name='username']").parents('.control-group');
          if (nickControlGroup.hasClass('error')) {
            errors += 1;
          }
          if (userNameValue.length < 3 || userNameValue.length > 25) {
            setErrorCommunique('username_communique', 'Prosimy o podanie nazwy użytkownika zawierającej od 3 do 25 znaków.');
            errors += 1;
          }
          if (password1Value.length < 3 || password1Value.length > 25) {
            setErrorCommunique('password_communique', 'Prosimy o podanie hasła zawierającego od 3 do 25 znaków.');
            errors += 1;
          }
          if (password2Value.length < 3 || password2Value.length > 25) {
            setErrorCommunique('password2_communique', 'Prosimy o podanie hasła zawierającego od 3 do 25 znaków.');
            errors += 1;
          }
          if (password1Value !== password2Value) {
            setErrorCommunique('password_communique', 'Podane hasła nie są identyczne.');
            setErrorCommunique('password2_communique', '');
            errors += 1;
          }
          if (errors > 0) {
            setErrorCommunique('validation_communique', 'Nie wszystkie pola formularza zostały poprawnie wypełnione. Popraw błędne pola i spróbuj raz jeszcze.');
            return false;
          }
          return true;
        })();
        if (valid === false) {
          button.button('reset');
        }
        return valid;
      });
    }

    function bindUpdateNickForm() {
      $('body').on('change', "#registration_username", function() {
        var userNameValue = $.trim($("input[name='username']").val());
        var userId = $("input[name='user_id']").val();
        sandbox.notify({
          type: 'user-nick-availability',
          data: {'username': userNameValue, 'userId': userId}
        });
      });

      $('body').on('submit', '#nick_update_form', function() {
        var form = $(this);
        var submitButton = form.find(':input[type="submit"]');
        submitButton.button('loading');

        var valid = (function() {
          var errors = 0,
            userNameValue = $.trim($("input[name='username']").val()),
            nickControlGroup = $("input[name='username']").parents('.control-group');
          if (nickControlGroup.hasClass('error')) {
            errors += 1;
          }
          if (userNameValue.length < 3 || userNameValue.length > 25) {
            setErrorCommunique('username_communique', 'Prosimy o podanie nazwy użytkownika zawierającej od 3 do 25 znaków.');
            errors += 1;
          }
          if (errors > 0) {
            return false;
          }
          return true;
        })();
        if (valid === false) {
          submitButton.button('reset');
          return valid;
        }
        sandbox.ajax({
          type: 'post',
          url: 'ajax',
          data: form.serialize(),
          dataType: 'html',
          beforeSend: function() {
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

    function bindRecommendationForm() {

      $('body').on('submit', '#recommendation_form', function() {
        var form = $(this);
        var submitButton = form.find(':input[type="submit"]');

        submitButton.button('loading');
        sandbox.ajax({
          type: 'post',
          url: 'ajax',
          data: form.serialize(),
          dataType: 'html',
          beforeSend: function() {
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
          type: 'facebook-logout',
          data: {
            callback: function() {
              sandbox.ajax({
                type: "POST",
                url: "ajax",
                data: "dao=21&action=3",
                dataType: 'html',
                cache: false
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
      init: function() {
        sandbox.listen('user-registration-form', this.showRegistrationForm, this);
        sandbox.listen('user-sign-in-form', this.showSignInForm, this);
        sandbox.listen('user-nick-update-form', this.showNickForm, this);
        sandbox.listen('user-nick-updated', this.nickUpdated, this);
        sandbox.listen('user-signed-in', this.signedIn, this);
        sandbox.listen('user-reminder-form', this.showReminderForm, this);
        sandbox.listen('user-signed-out', this.signedOut, this);
        sandbox.listen('user-data-loaded', this.appendUserData, this);
        sandbox.listen('user-nick-availability', this.checkNickAvailability, this);

        bindRegistrationForm();
        bindSignInForm();
        bindReminderForm();
        bindSignOutButton();
        bindRecommendationForm();
        bindUpdateNickForm();
        bindActivationForm();
      },
      showRegistrationForm: function() {
        sandbox.ajax({
          type: 'POST',
          url: 'ajax',
          data: "dao=21&action=4",
          dataType: 'html',
          cache: false
        }).done(function(data) {
          $("#ebilightbox").html(data).modal();
          $('#registration_username').trigger('focus');
        });
      },
      showSignInForm: function() {
        sandbox.ajax({
          type: 'POST',
          url: 'ajax',
          data: "dao=21&action=1",
          dataType: 'html',
          cache: false
        }).done(function(data) {
          $("#ebilightbox").html(data).modal();
        });
      },
      showNickForm: function() {
        sandbox.ajax({
          type: 'POST',
          url: 'ajax',
          data: "dao=21&action=11",
          dataType: 'html',
          cache: false
        }).done(function(data) {
          $("#ebilightbox").html(data).modal();
        });
      },
      signedIn: function(messageInfo) {
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
            $('.cnr-user-activities').addClass('cnr-loading');
            _getUserPanel();
          }
        });
        $('.cnr-add-dropdown').off('click.signed-out');
        if (user.is_fbid && (/^fb_(\d)+/g).test(user.raw_nick)) {
          sandbox.notify({
            type: 'user-nick-update-form'
          });
        }
      },
      nickUpdated: function(messageInfo) {
        var user = messageInfo.data;
        sandbox.setUserData(user);
      },
      showReminderForm: function() {
        sandbox.ajax({
          type: 'POST',
          url: 'ajax',
          data: "dao=21&action=6",
          dataType: 'html',
          cache: false
        }).done(function(data) {
          $("#ebilightbox").html(data);
        });
      },
      signedOut: function() {
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
            type: 'user-sign-in-form'
          });
          return false;
        });
        if ($('#disqus_thread').html()) {
          DISQUS.reset({
            reload:true,
            config: function () {
              this.page.remote_auth_s3 = '';
            }
          });
        }
        infoLoaded = false;
      },
      appendUserData: function(messageInfo) {
        var data = $(sandbox.template('userInfo', messageInfo.data));
        $('#user_menu .user_quickbox.data .info_panel .activities').append(data);
        $('.cnr-user-activities').removeClass('cnr-loading');
      },
      checkNickAvailability: function(messageInfo) {
        var params = messageInfo.data;
        if (params.username.length < 3 || params.username.length > 25) {
          setErrorCommunique('username_communique', 'Prosimy o podanie nazwy użytkownika zawierającej od 3 do 25 znaków.');
          return;
        }
        var urlData = {
          dao: 21,
          action: 10,
          dataType: 'json',
          username: params.username,
          user_id: params.userId || 0
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
      },
      destroy: function() {
      }
    };

  };
});
