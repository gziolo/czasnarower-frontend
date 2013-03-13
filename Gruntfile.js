module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-mocha');

  var PORT = 8899;

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    connect : {
      server : {
        options : {
          port : PORT,
          base : '.'
        }
      }
    },
    requirejs : {
      compile : {
        options : {
          baseUrl : '.',
          optimize : 'none',
          enforceDefine : true,
          paths : {
            aura : 'components/aura/lib',
            backbone : 'components/backbone/backbone',
            bootstrap : 'components/bootstrap/docs/assets/js/bootstrap',
            eventemitter : 'components/eventemitter2/lib/eventemitter2',
            jquery : 'components/jquery/jquery',
            jquery_migrate : 'components/jquery/jquery-migrate',
            text : 'components/requirejs-text/text',
            underscore : 'components/underscore/underscore'
          },
          shim : {
            'app/app' : {
              deps : [ 'jquery_migrate', 'bootstrap', 'backbone' ]
            },
            backbone : {
              deps : [ 'underscore', 'jquery' ],
              exports : 'Backbone'
            },
            bootstrap : {
              deps : [ 'jquery' ],
              exports : '$.fn.affix'
            },
            jquery_migrate : {
              deps : [ 'jquery' ],
              exports : 'jQuery.migrateWarnings'
            },
            underscore : {
              exports : '_'
            }
          },
          include : [ 'jquery', 'text', 'aura/ext/debug', 'aura/ext/mediator', 'aura/ext/widgets', 'app/app' ],
          out : 'dist/js/main.js'
        }
      }
    },
    jshint : {
      all : {
        options : {
          jshintrc : '.jshintrc'
        },
        files : {
          src : [ 'app/**/*.js', 'spec/app/**/*.js' ]
        }
      }
    },
    mocha : {
      all : {
        options : {
          urls : [ 'http://localhost:<%= connect.server.options.port %>/spec/index.html' ]
        }
      }
    },
    watch : {
      css : {
        files : [ 'bootstrap/less/**/*.less' ],
        tasks : [ 'less' ]
      },
      js : {
        files : [ 'app/**/*.js', 'spec/app/**/*.js' ],
        tasks : [ 'spec' ]
      }
    },
    less : {
      development : {
        files : {
          'dist/css/basic.css' : 'bootstrap/less/bootstrap.less',
          'dist/css/responsive.css' : 'bootstrap/less/responsive.less',
          'dist/css/lightbox.css' : 'bootstrap/less/plugins/lightbox.less'
        }
      },
      production : {
        options : {
          yuicompress : true
        },
        files : {
          'dist/css/bootstrap.min.css' : [ 'bootstrap/less/bootstrap.less', 'bootstrap/less/responsive.less', 'bootstrap/less/plugins/lightbox.less' ]
        }
      }
    },

  });

  grunt.registerTask('spec', [ 'jshint', 'mocha' ]);
  grunt.registerTask('build', [ 'connect', 'spec', 'requirejs', 'less' ]);
  grunt.registerTask('default', [ 'connect', 'spec', 'watch' ]);
};
