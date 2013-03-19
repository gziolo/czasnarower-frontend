module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var PORT = 8899;

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    clean : {
      build : [ 'dist' ]
    },
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
          mainConfigFile : 'js/config.js',
          optimize : 'none',
          include : [ 'js/app' ],
          out : 'dist/js/main.js'
        }
      },
      production : {
        options : {
          baseUrl : '.',
          mainConfigFile : 'js/config.js',
          optimize : 'uglify',
          include : [ 'js/app' ],
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
          src : [ 'js/*.js', 'js/widgets/**/*.js', 'spec/js/**/*.js' ]
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
        files : [ 'less/**/*.less' ],
        tasks : [ 'less' ]
      },
      js : {
        files : [ 'js/**/*.js', 'spec/js/**/*.js' ],
        tasks : [ 'spec' ]
      }
    },
    less : {
      development : {
        files : [ {
          src : 'less/bootstrap.less',
          dest : 'dist/css/basic.css'
        }, {
          src : 'less/responsive.less',
          dest : 'dist/css/responsive.css'
        } ]
      },
      production : {
        options : {
          yuicompress : true
        },
        files : [ {
          src : [ 'less/bootstrap.less', 'less/responsive.less' ],
          dest : 'dist/css/bootstrap.min.css'
        } ]
      }
    },

  });

  grunt.registerTask('spec', [ 'jshint', 'connect', 'mocha' ]);
  grunt.registerTask('run', [ 'connect', 'watch' ]);
  grunt.registerTask('build', [ 'clean',  'spec', 'requirejs', 'less' ]);
  grunt.registerTask('default', [ 'spec', 'watch' ]);
};
