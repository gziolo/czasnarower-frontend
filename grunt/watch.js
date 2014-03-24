module.exports = {
  less: {
    files: [ 'less/**/*.less' ],
    tasks: [ 'less' ]
  },
  js: {
    files: [ 'js/**/*.js', 'spec/js/**/*.js' ],
    tasks: [ 'spec' ]
  }
};