/*jshint unused:false */
/*global FB */
define(function() {
  return function(facade, $) {
    'use strict';

    var bEnabled = false;
    var sPerms = 'publish_stream,email,user_hometown';

    function isEnabled() {
      return bEnabled;
    }

    function showConnecting() {
      var cHeight = $('#loading_fb').parent('.content').height();
      $('#loading_fb').css({
        'opacity' : 0.6,
        'height' : (cHeight - 30) + 'px'
      }).show();
      $('#loading_fb_txt').css({
        'top' : (cHeight / 2) + 'px'
      }).show();
    }

    function hideConnecting() {
      $('#loading_fb, #loading_fb_txt').hide();
    }

    return {
      init : function(data) {
        facade.listen('facebook-initialised', this.initialised, this);
        facade.listen('facebook-login', this.login, this);
        facade.listen('facebook-logout', this.logout, this);

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
          facade.notify({
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
      initialised : function(messageInfo) {
        bEnabled = true;
        $('body').on('click', '.facebook-login', function() {
          facade.notify({
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
      login : function(messageInfo) {
        if (!isEnabled()) {
          return;
        }
        showConnecting();
        FB.login(function(response) {
          if (response.authResponse) {
            facade.rest.create('user-session', {
              facebook_id : response.authResponse.userID
            }, {
              success : function() {
                window.location.reload();
              }
            });
          }
          hideConnecting();
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
          FB.logout(function(response) {
            sCallback();
          });
          $('.facebook-connected').hide();
        });
      },

      destroy : function() {}
    };
  };
});
