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
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var PORT = 8899;

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    clean : {
      build : [ 'dist/frontend' ]
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
      require : {
        options : {
          baseUrl : './',
          optimize : 'uglify',
          name : 'components/requirejs/require',
          out : 'dist/frontend/js/require.js'
        }
      },
      main : {
        options : {
          baseUrl : './',
          optimize : 'uglify',
          name : 'js/main',
          out : 'dist/frontend/js/main.js'
        }
      },
      /*development : {
        options : {
          baseUrl : './',
          mainConfigFile : 'config.js',
          optimize : 'none',
          name : 'js/app',
          out : 'dist/frontend/js/app.js'
        }
      },*/
      production : {
        options : {
          baseUrl : './',
          mainConfigFile : 'config.js',
          optimize : 'uglify',
          name : 'js/app',
          out : 'dist/frontend/js/app.js'
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
    less : {
      /*development : {
        files : [ {
          src : 'less/bootstrap.less',
          dest : 'dist/frontend/css/basic.css'
        }, {
          src : 'less/responsive.less',
          dest : 'dist/frontend/css/responsive.css'
        } ]
      },*/
      production : {
        options : {
          yuicompress : true
        },
        files : [ {
          src : [ 'less/bootstrap.less', 'less/responsive.less' ],
          dest : 'dist/frontend/css/bootstrap.css'
        } ]
      }
    },
    imagemin : {
      all : {
        files : [ {
          expand : true,
          cwd : 'img/',
          src : '**/*',
          dest : 'dist/frontend/img/'
        } ]
      }
    },
    copy : {
      all : {
        files : [ {
          expand : true,
          cwd : 'img/',
          src : '**/*.gif',
          dest : 'dist/frontend/img/'
        } ]
      }
    },
    watch : {
      less : {
        files : [ 'less/**/*.less' ],
        tasks : [ 'less' ]
      },
      js : {
        files : [ 'js/**/*.js', 'spec/js/**/*.js' ],
        tasks : [ 'spec' ]
      }
    }
  });

  grunt.registerTask('spec', [ 'jshint', 'connect', 'mocha' ]);
  grunt.registerTask('css', [ 'less', 'imagemin', 'copy' ]);
  grunt.registerTask('run', [ 'connect', 'watch' ]);
  grunt.registerTask('build', [ 'clean', 'spec', 'requirejs', 'css' ]);
  grunt.registerTask('default', [ 'spec', 'watch' ]);
};
