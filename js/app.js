define([ 'backbone', 'bootstrap_plugins', 'flight', 'text', 'moment_pl', 'jquery_migrate' ], function() {
  "use strict";

  require([ 'legacy/component', 'cookies_alert/component' ], function(legacy, CookiesAlert) {
    CookiesAlert.attachTo('#cnr-cookies-alert');
  });
});
