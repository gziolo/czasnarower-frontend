define(function() {
  require.config({
    enforceDefine : true,
    paths : {
      // aura : 'components/aura/lib',
      backbone : 'components/backbone/backbone',
      bootstrap : 'components/bootstrap/docs/assets/js/bootstrap',
      bootstrap_datepicker : 'js/vendor/bootstrap/plugins/datepicker',
      bootstrap_lightbox : 'js/vendor/bootstrap/plugins/lightbox',
      bootstrap_tag : 'js/vendor/bootstrap/plugins/bootstrap-tag',
      eventemitter : 'components/eventemitter2/lib/eventemitter2',
      jquery : 'components/jquery/jquery',
      jquery_migrate : 'components/jquery/jquery-migrate',
      json2 : 'components/json2/json2',
      'load-image' : 'js/vendor/bootstrap/plugins/load-image',
      moment : 'js/vendor/moment/moment',
      moment_pl : 'js/vendor/moment/moment-pl',
      text : 'components/requirejs-text/text',
      underscore : 'components/lodash/dist/lodash.underscore',

      legacy : 'js/widgets/legacy'
    },
    shim : {
      /*'aura/aura' : {
        deps : [ 'aura/ext/debug', 'aura/ext/mediator', 'aura/ext/widgets' ]
      },*/
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
      jquery : {
        deps : [ 'json2' ]
      },
      jquery_migrate : {
        deps : [ 'jquery' ],
        exports : 'jQuery.migrateWarnings'
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
