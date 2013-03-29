module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-mocha');

  var PORT = 8899;

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    clean : {
      css : [ 'dist/frontend/css' ],
      img : [ 'dist/frontend/img' ],
      js : [ 'dist/frontend/js' ]
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
          out : 'dist/frontend/js/app.js'
        }
      },
      legacy : {
        options : {
          baseUrl : './',
          mainConfigFile : 'config.js',
          optimize : 'uglify',
          name : 'legacy/main',
          exclude : [ 'js/app' ],
          out : 'dist/frontend/js/widgets/legacy/main.js'
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
          urls : [ 'http://localhost:<%= connect.server.options.port %>/spec/index.html' ],
          reporter : 'Spec'
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
          cwd : 'js/',
          src : [ 'widgets/**/*.js', 'widgets/**/*.html' ],
          dest : 'dist/frontend/js/'
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
  grunt.registerTask('css-development', [ 'clean:css', 'clean:img', 'less:development', 'imagemin', 'copy:img' ]);
  grunt.registerTask('css-production', [ 'clean:css', 'clean:img', 'less:production', 'imagemin', 'copy:img' ]);
  grunt.registerTask('js-development', [ 'clean:js', 'requirejs:require', 'requirejs:main', 'requirejs:app_development', 'copy:js_development' ]);
  grunt.registerTask('js-production', [ 'clean:js', 'requirejs:require', 'requirejs:main', 'requirejs:app', 'requirejs:legacy' ]);
  grunt.registerTask('server', [ 'connect', 'watch' ]);
  grunt.registerTask('build-development', [ 'spec', 'js-development', 'css-development' ]);
  grunt.registerTask('build', [ 'spec', 'js-production', 'css-production' ]);
  grunt.registerTask('default', [ 'spec', 'watch' ]);
};
