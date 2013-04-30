/*global FB */
define(function() {
  return function(sandbox, $) {
    'use strict';

    var bEnabled = false;
    var sPerms = 'publish_stream,email,user_hometown';

    function isEnabled() {
      return bEnabled;
    }

    function showConnecting() {
      $('.cnr-facebook-connect').button('loading');
    }

    function hideConnecting() {
      $('.cnr-facebook-connect').button('reset');
    }

    return {
      init : function(data) {
        sandbox.listen('facebook-initialised', this.initialised, this);
        sandbox.listen('facebook-login', this.login, this);
        sandbox.listen('facebook-logout', this.logout, this);

        if (!data.appId) {
          return;
        }
        window.fbAsyncInit = function() {
          FB.init({
            appId : data.appId,
            status : true,
            cookie : true,
            xfbml : true,
            oauth : true,
            channelUrl : '//' + document.location.host + '/facebook/channel.php'
          });
          sandbox.notify({
            type : 'facebook-initialised'
          });
        };
        var e = document.createElement('script');
        e.async = true;
        e.src = '//connect.facebook.net/pl_PL/all.js';
        if (!$('#fb-root').size()) {
          $('body').append('<div id="fb-root"></div>');
        }
        $('#fb-root').append(e);
      },
      initialised : function() {
        bEnabled = true;
        $('body').on('click', '.cnr-facebook-connect', function() {
          sandbox.notify({
            type : 'facebook-login'
          });
        });
        FB.getLoginStatus(function(response) {
          if (!response.authResponse) {
            return;
          }
          $('.facebook-connected').show();
        });
      },
      login : function() {
        if (!isEnabled()) {
          return;
        }
        showConnecting();
        FB.login(function(response) {
          if (response.authResponse) {
            sandbox.rest.create('user-session', {
              facebook_id : response.authResponse.userID
            }, {
              success : function() {
                window.location.reload();
              }
            });
          } else {
            hideConnecting();
          }
        }, {
          scope : sPerms
        });
        return true;
      },

      logout : function(messageInfo) {
        var sCallback = messageInfo.data.callback || function() {};
        if (!isEnabled()) {
          sCallback();
          return;
        }
        FB.getLoginStatus(function(response) {
          if (!response.authResponse) {
            sCallback();
            return;
          }
          FB.logout(function() {
            sCallback();
          });
          $('.facebook-connected').hide();
        });
      },

      destroy : function() {}
    };
  };
});
