module.exports = {
  development: {
    files: [
      {
        src: [ 'less/bootstrap.less', 'less/responsive.less' ],
        dest: 'dist/frontend/css/bootstrap.css'
      }
    ]
  },
  production: {
    options: {
      yuicompress: true
    },
    files: [
      {
        src: [ 'less/bootstrap.less', 'less/responsive.less' ],
        dest: 'dist/frontend/css/bootstrap.css'
      }
    ]
  }
};