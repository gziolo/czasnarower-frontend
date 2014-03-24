module.exports = {
  all: {
    options: {
      urls: [ 'http://localhost:<%= connect.server.options.port %>/spec/index.html' ],
      reporter: 'Spec'
    }
  }
};