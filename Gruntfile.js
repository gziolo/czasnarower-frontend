module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-mocha');

  var PORT = 8899;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: PORT,
          base: '.'
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: '.',
          optimize: 'none',
          enforceDefine: true,
          paths: {
            jquery : 'components/jquery/jquery',
            jquery_migrate: 'components/jquery/jquery-migrate'
          },
          shim: {
            jquery_migrate : {
              deps : ['jquery'],
              exports : 'jQuery.migrateWarnings'
            }
          },
          include: [
            'lib/main'
          ],
          out: 'dist/js/main.js'
        }
      }
    },
    jshint: {
      all: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: [
            'lib/**/*.js',
            'spec/lib/**/*.js'
          ]
        }
      }
    },
    mocha: {
      all: {
          options: {
              urls: ['http://localhost:<%= connect.server.options.port %>/spec/index.html']
          }
      }
    },
    watch: {
      files: [
        'lib/**/*.js',
        'spec/lib/**/*.js'
      ],
      tasks: ['spec']
    },
    less : {
      development : {
        files : {
          'dist/css/bootstrap.css' : 'bootstrap/less/bootstrap.less',
          'dist/css/responsive.css' : 'bootstrap/less/responsive.less'
        }
      },
      production : {
        options: {
          yuicompress: true
        },
        files : {
          'dist/css/bootstrap.min.css' : ['bootstrap/less/bootstrap.less', 'bootstrap/less/responsive.less']
        }
      }
    },
    
  });

  grunt.registerTask('spec', ['jshint', 'mocha']);
  grunt.registerTask('build', ['connect', 'spec', 'requirejs', 'less']);
  grunt.registerTask('default', ['connect', 'spec', 'watch']);
};
