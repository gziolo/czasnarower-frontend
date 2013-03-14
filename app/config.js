define(function() {
  require.config({
    baseUrl : '../',
    enforceDefine : true,
    paths : {
      aura : 'components/aura/lib',
      backbone : 'components/backbone/backbone',
      bootstrap : 'components/bootstrap/docs/assets/js/bootstrap',
      datepicker : 'app/vendor/bootstrap/plugins/datepicker',
      eventemitter : 'components/eventemitter2/lib/eventemitter2',
      jquery : 'components/jquery/jquery',
      jquery_migrate : 'components/jquery/jquery-migrate',
      json2 : 'components/json2/json2',
      lightbox : 'app/vendor/bootstrap/plugins/lightbox',
      'load-image' : 'app/vendor/bootstrap/plugins/load-image',
      text : 'components/requirejs-text/text',
      underscore : 'components/underscore/underscore'
    },
    shim : {
      'app/app' : {
        deps : [ 'jquery_migrate', 'text', 'bootstrap', 'datepicker', 'lightbox', 'backbone' ]
      },
      'aura/aura' : {
        deps : [ 'aura/ext/debug', 'aura/ext/mediator', 'aura/ext/widgets' ]
      },
      backbone : {
        deps : [ 'jquery', 'underscore' ],
        exports : 'Backbone'
      },
      bootstrap : {
        deps : [ 'jquery' ],
        exports : '$.fn.affix'
      },
      datepicker : {
        deps : [ 'bootstrap' ]
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
