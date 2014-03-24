module.exports = {
  js_development: {
    files: [
      {
        expand: true,
        cwd: 'js/',
        src: [ 'mixins/**/*.js', 'mixins/**/*.html', 'components/**/*.js', 'components/**/*.html' ],
        dest: 'dist/frontend/js/'
      }
    ]
  },
  img: {
    files: [
      {
        expand: true,
        cwd: 'img/',
        src: [ '**/*.gif', '**/*.jpg', '**/*.png' ],
        dest: 'dist/frontend/img/'
      }
    ]
  },
  font: {
    files: [
      {
        expand: true,
        cwd: 'font/',
        src: '**/*',
        dest: 'dist/frontend/font/'
      }
    ]
  }
};