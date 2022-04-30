/*jshint strict:false */
/*global FB */
define(function() {
  return function(sandbox, $) {
    'use strict';

    return {
      init : function(data) {
        if (!data.appId) {
          return;
        }

        window.fbAsyncInit = function() {
          FB.init({
            appId : data.appId,
            xfbml: true,
            autoLogAppEvents : true,
            version : 'v12.0'
          });
        };
        var e = document.createElement('script');
        e.async = true;
        e.id = 'facebook-jssdk';
        e.src = '//connect.facebook.net/pl_PL/all.js';
        if (!$('#fb-root').size()) {
          $('body').append('<div id="fb-root"></div>');
        }
        $('#fb-root').append(e);
      },
      destroy : function() {}
    };
  };
});
