define([ 'es5shim', 'es5sham', 'backbone', 'bootstrap_plugins', 'flight_index', 'text', 'moment_pl', 'jquery_migrate' ], function() {
  'use strict';

  require([ 'legacy/component', 'cookies_alert/component', 'google_plus/component', 'twitter/component', 'user_race_stats/component' ], function(legacy, CookiesAlertComponent, GooglePlusComponent,
      TwitterComponent, UserRaceStatsComponent) {
    CookiesAlertComponent.attachTo('#cnr-cookies-alert');
    GooglePlusComponent.attachTo('body');
    TwitterComponent.attachTo('body');
    UserRaceStatsComponent.attachTo('#cnr-user-race-stats');
  });
});
