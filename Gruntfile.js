module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-mocha');

  var PORT = 8899;

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    clean : {
      all : [ 'dist/frontend' ]
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
      app_development : {
        options : {
          baseUrl : './',
          mainConfigFile : 'config.js',
          optimize : 'none',
          name : 'js/app',
          out : 'dist/frontend/js/app.js'
        }
      },
      app : {
        options : {
          baseUrl : './',
          mainConfigFile : 'config.js',
          optimize : 'uglify',
          name : 'js/app',
          include : [ 'legacy/common' ],
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
        src : [ 'http://localhost:<%= connect.server.options.port %>/spec/index.html' ],
        options : {
          mocha : {
            ui : 'tdd'
          },
          run : true
        }
      }
    },
    less : {
      development : {
        files : [ {
          src : [ 'less/bootstrap.less', 'less/responsive.less' ],
          dest : 'dist/frontend/css/bootstrap.css'
        } ]
      },
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
      js_development : {
        files : [ {
          expand : true,
          cwd : 'js/widgets/',
          src : [ '**/*.js', '**/*.html' ],
          dest : 'dist/frontend/js/widgets'
        } ]
      },
      img : {
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
  grunt.registerTask('css-development', [ 'less:development', 'imagemin', 'copy:img' ]);
  grunt.registerTask('css-production', [ 'less:production', 'imagemin', 'copy:img' ]);
  grunt.registerTask('js-development', [ 'requirejs:require', 'requirejs:main', 'requirejs:app_development', 'copy:js_development' ]);
  grunt.registerTask('js-production', [ 'requirejs:require', 'requirejs:main', 'requirejs:app' ]);
  grunt.registerTask('run', [ 'connect', 'watch' ]);
  grunt.registerTask('build-development', [ 'clean', 'spec', 'js-development', 'css-development' ]);
  grunt.registerTask('build', [ 'clean', 'spec', 'js-production', 'css-production' ]);
  grunt.registerTask('default', [ 'spec', 'watch' ]);
};
