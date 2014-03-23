module.exports = function(grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  var PORT = 8899;

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    clean : {
      css : [ 'dist/frontend/css' ],
      img : [ 'dist/frontend/img' ],
      js : [ 'dist/frontend/js' ],
      font : [ 'dist/frontend/font' ]
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
          name : 'bower_components/requirejs/require',
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
          include : [ 'js/mixins/index', 'cookies_alert/component', 'google_plus/component', 'twitter/component', 'user_race_stats/component' ],
          out : 'dist/frontend/js/app.js'
        }
      },
      legacy : {
        options : {
          baseUrl : './',
          mainConfigFile : 'config.js',
          optimize : 'uglify',
          name : 'legacy/component',
          exclude : [ 'js/app' ],
          out : 'dist/frontend/js/components/legacy/component.js'
        }
      }
    },
    jshint : {
      js : {
        options : {
          jshintrc : '.jshintrc'
        },
        files : {
          src : [ 'js/*.js', 'js/mixins/**/*.js', 'js/components/**/*.js' ]
        }
      },
      spec : {
        options : grunt.util._.merge(grunt.file.readJSON('spec/.jshintrc'), grunt.file.readJSON('.jshintrc')),
        files : {
          src : [ 'spec/**/*.js' ]
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
    copy : {
      js_development : {
        files : [ {
          expand : true,
          cwd : 'js/',
          src : [ 'mixins/**/*.js', 'mixins/**/*.html', 'components/**/*.js', 'components/**/*.html' ],
          dest : 'dist/frontend/js/'
        } ]
      },
      img : {
        files : [ {
          expand : true,
          cwd : 'img/',
          src : [ '**/*.gif', '**/*.jpg', '**/*.png' ],
          dest : 'dist/frontend/img/'
        } ]
      },
      font : {
        files : [ {
          expand : true,
          cwd : 'font/',
          src : '**/*',
          dest : 'dist/frontend/font/'
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
  grunt.registerTask('css-development', [ 'clean:css', 'clean:img', 'clean:font', 'less:development', 'copy:img', 'copy:font' ]);
  grunt.registerTask('css-production', [ 'clean:css', 'clean:img', 'clean:font', 'less:production', 'copy:img', 'copy:font' ]);
  grunt.registerTask('js-development', [ 'clean:js', 'requirejs:require', 'requirejs:main', 'requirejs:app_development', 'copy:js_development' ]);
  grunt.registerTask('js-production', [ 'clean:js', 'requirejs:require', 'requirejs:main', 'requirejs:app', 'requirejs:legacy' ]);
  grunt.registerTask('server', [ 'connect', 'watch' ]);
  grunt.registerTask('build-development', [ 'spec', 'js-development', 'css-development' ]);
  grunt.registerTask('build', [ 'spec', 'js-production', 'css-production' ]);
  grunt.registerTask('default', [ 'spec', 'watch' ]);
};
