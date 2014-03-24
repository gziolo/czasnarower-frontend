module.exports = {
  require: {
    options: {
      baseUrl: './',
      optimize: 'uglify',
      name: 'bower_components/requirejs/require',
      out: 'dist/frontend/js/require.js'
    }
  },
  main: {
    options: {
      baseUrl: './',
      optimize: 'uglify',
      name: 'js/main',
      out: 'dist/frontend/js/main.js'
    }
  },
  app_development: {
    options: {
      baseUrl: './',
      mainConfigFile: 'config.js',
      optimize: 'none',
      name: 'js/app',
      out: 'dist/frontend/js/app.js'
    }
  },
  app: {
    options: {
      baseUrl: './',
      mainConfigFile: 'config.js',
      optimize: 'uglify',
      name: 'js/app',
      include: [ 'js/mixins/index', 'cookies_alert/component', 'google_plus/component', 'twitter/component', 'user_race_stats/component' ],
      out: 'dist/frontend/js/app.js'
    }
  },
  legacy: {
    options: {
      baseUrl: './',
      mainConfigFile: 'config.js',
      optimize: 'uglify',
      name: 'legacy/component',
      exclude: [ 'js/app' ],
      out: 'dist/frontend/js/components/legacy/component.js'
    }
  }
};