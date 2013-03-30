define([ 'underscore', 'flight', 'text!cookies_alert/templates/alert.html' ], function(_, flight, alertTemplate) {
  "use strict";

  function CookiesAlert() {

    var FLAG_NAME = 'cnr_cookiesAlertDisabled';
    var template = _.template(alertTemplate);

    this.defaultAttrs({
      disableSelector : 'button.close'
    });
        
    this.isAlertDisabled = function() {
      if (window.localStorage === undefined) {
        return false;
      }
      return (localStorage.getItem(FLAG_NAME) || false);
    };

    this.disableAlert = function() {
      console.log('Disable alert.');
      if (window.localStorage) {
        localStorage.setItem(FLAG_NAME, true);
      }
    };

    this.after('initialize', function() {
      if (this.isAlertDisabled()) {
        return;
      }
      this.$node.html(template());

      this.on('click', {
        disableSelector : this.disableAlert
      });
    });
  }

  return flight.component(CookiesAlert);
});
