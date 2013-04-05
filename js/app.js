define([ 'backbone', 'bootstrap_plugins', 'flight', 'text', 'moment_pl', 'jquery_migrate' ], function() {
  'use strict';

  require([ 'legacy/component', 'cookies_alert/component', 'user_race_stats/component' ], function(legacy, CookiesAlert, UserRaceStats) {
    CookiesAlert.attachTo('#cnr-cookies-alert');
    UserRaceStats.attachTo('#cnr-user-race-stats');
  });
});
