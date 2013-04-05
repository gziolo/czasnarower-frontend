define([ 'backbone', 'bootstrap_plugins', 'flight', 'text', 'moment_pl', 'jquery_migrate' ], function() {
  'use strict';

  require([ 'legacy/component', 'cookies_alert/component', 'users_stats/component' ], function(legacy, CookiesAlert, UsersStats) {
    CookiesAlert.attachTo('#cnr-cookies-alert');
    UsersStats.attachTo('#cnr-users-stats');
  });
});
