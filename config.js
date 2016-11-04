define(function() {
  'use strict';

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
      backbone : 'bower_components/backbone/backbone',
      bootstrap : 'bower_components/bootstrap/docs/assets/js/bootstrap',
      bootstrap_datepicker : 'js/vendor/bootstrap/plugins/datepicker',
      bootstrap_lightbox : 'js/vendor/bootstrap/plugins/lightbox',
      bootstrap_plugins : 'js/vendor/bootstrap/index',
      bootstrap_tag : 'js/vendor/bootstrap/plugins/bootstrap-tag',
      bootstrap_collapse : 'js/vendor/bootstrap/plugins/bootstrap-collapse',
      bootstrap_multiselect : 'js/vendor/bootstrap/plugins/bootstrap-multiselect',
      wysihtml5: 'js/vendor/bootstrap/plugins/wysihtml5',
      bootstrap_wysihtml5: 'js/vendor/bootstrap/plugins/bootstrap-wysihtml5',
      bootstrap_wysihtml5_pl: 'js/vendor/bootstrap/plugins/bootstrap-wysihtml5.pl-PL',
      es5shim : 'bower_components/es5-shim/es5-shim',
      es5sham : 'bower_components/es5-shim/es5-sham',
      flight : 'bower_components/flight',
      jquery : 'bower_components/jquery/jquery',
      jquery_migrate : 'bower_components/jquery/jquery-migrate',
      json2 : 'bower_components/json2/json2',
      'load-image' : 'js/vendor/bootstrap/plugins/load-image',
      moment : 'js/vendor/moment/moment',
      moment_pl : 'js/vendor/moment/moment-pl',
      text : 'bower_components/requirejs-text/text',
      underscore : 'bower_components/lodash/dist/lodash.underscore',
      cookies_alert : 'js/components/cookies_alert',
      google_plus : 'js/components/google_plus',
      twitter : 'js/components/twitter',
      user_race_stats : 'js/components/user_race_stats',
      legacy : 'js/components/legacy'
    },
    map : {
      '*' : {
        flight_index : 'flight/lib/index',
        fuelux_combobox : 'bower_components/fuelux/dist/combobox',
        fuelux_datagrid : 'bower_components/fuelux/dist/datagrid',
        fuelux_select : 'bower_components/fuelux/dist/select',
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
      bootstrap_wysihtml5 : {
        deps : [ 'bootstrap', 'wysihtml5'],
        exports : '$.fn.wysihtml5'
      },
      bootstrap_wysihtml5_pl: {
        deps: ['bootstrap_wysihtml5'],
        exports : '$.fn.wysihtml5'
      },
      bootstrap_datepicker : {
        deps : [ 'bootstrap' ]
      },
      bootstrap_tag : {
        deps : [ 'bootstrap' ],
        exports : '$.fn.tag'
      },
      bootstrap_collapse : {
        deps : [ 'bootstrap'],
        exports : '$.fn.collapse'
      },
      bootstrap_multiselect : {
        deps : [ 'bootstrap' ],
        exports : '$.fn.multiselect'
      },
      'bower_components/flight/lib/index' : {
        deps : [ 'jquery_migrate', 'es5shim', 'es5sham' ]
      },
      'bower_components/fuelux/dist/combobox' : {
        deps : [ 'bootstrap' ]
      },
      'bower_components/fuelux/dist/datagrid' : {
        deps : [ 'bootstrap' ]
      },
      'bower_components/fuelux/dist/select' : {
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
        deps : [ 'es5shim', 'es5sham' ],
        exports : '_'
      },
      wysihtml5: {
        exports : 'wysihtml5'
      },
      '//apis.google.com/js/plusone.js' : {
        exports : 'gapi'
      }
    }
  });
});
