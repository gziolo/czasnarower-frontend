module.exports = function (grunt) {
  return {
    js: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: {
        src: [ 'js/*.js', 'js/mixins/**/*.js', 'js/components/**/*.js' ]
      }
    },
    spec: {
      options: grunt.util._.merge(grunt.file.readJSON('spec/.jshintrc'), grunt.file.readJSON('.jshintrc')),
      files: {
        src: [ 'spec/**/*.js' ]
      }
    }
  };
};
