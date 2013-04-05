define(function() {
  require.config({
    enforceDefine : true,
    config : {
      text : {
        useXhr : function(url, protocol, hostname, port) {
          return true;
        }
      }
    },
    paths : {
      backbone : 'components/backbone/backbone',
      bootstrap : 'components/bootstrap/docs/assets/js/bootstrap',
      bootstrap_datepicker : 'js/vendor/bootstrap/plugins/datepicker',
      bootstrap_lightbox : 'js/vendor/bootstrap/plugins/lightbox',
      bootstrap_plugins : 'js/vendor/bootstrap/index',
      bootstrap_tag : 'js/vendor/bootstrap/plugins/bootstrap-tag',
      es5shim : 'components/es5-shim/es5-shim',
      es5sham : 'components/es5-shim/es5-sham',
      fuelux_datagrid : 'components/fuelux/dist/datagrid',
      jquery : 'components/jquery/jquery',
      jquery_migrate : 'components/jquery/jquery-migrate',
      json2 : 'components/json2/json2',
      'load-image' : 'js/vendor/bootstrap/plugins/load-image',
      moment : 'js/vendor/moment/moment',
      moment_pl : 'js/vendor/moment/moment-pl',
      text : 'components/requirejs-text/text',
      underscore : 'components/lodash/dist/lodash.underscore',

      cookies_alert : 'js/components/cookies_alert',
      user_race_stats : 'js/components/user_race_stats',
      legacy : 'js/components/legacy'
    },
    map : {
      '*' : {
        flight : 'components/flight/lib/index',
        mixins : 'js/mixins/index'
      }
    },
    shim : {
      backbone : {
        deps : [ 'jquery', 'underscore' ],
        exports : 'Backbone'
      },
      bootstrap : {
        deps : [ 'jquery' ],
        exports : '$.fn.affix'
      },
      bootstrap_datepicker : {
        deps : [ 'bootstrap' ]
      },
      bootstrap_tag : {
        deps : [ 'bootstrap' ],
        exports : '$.fn.tag'
      },
      'components/flight/lib/index' : {
        deps : [ 'jquery_migrate', 'es5shim', 'es5sham' ]
      },
      fuelux_datagrid : {
        deps : [ 'bootstrap' ]
      },
      jquery : {
        deps : [ 'json2' ]
      },
      jquery_migrate : {
        deps : [ 'jquery' ],
        exports : 'jQuery.migrateWarnings',
        init : function($) {
          $.migrateMute = true;
        }
      },
      json2 : {
        exports : 'JSON'
      },
      underscore : {
        exports : '_'
      }
    }
  });
});
