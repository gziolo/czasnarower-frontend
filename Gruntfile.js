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
      development : {
        options : {
          baseUrl : '.',
          mainConfigFile : 'app/config.js',
          optimize : 'none',
          include : [ 'app/app' ],
          out : 'dist/js/main.js'
        }
      },
      production : {
        options : {
          baseUrl : '.',
          mainConfigFile : 'app/config.js',
          optimize : 'uglify',
          include : [ 'app/app' ],
          out : 'dist/js/main.min.js'
        }
      }
    },
    jshint : {
      all : {
        options : {
          jshintrc : '.jshintrc'
        },
        files : {
          src : [ 'app/*.js', 'app/widgets/**/*.js', 'spec/app/**/*.js' ]
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
  grunt.registerTask('server', [ 'connect', 'watch' ]);
  grunt.registerTask('build', [ 'connect', 'spec', 'requirejs', 'less' ]);
  grunt.registerTask('default', [ 'connect', 'spec', 'watch' ]);
};
