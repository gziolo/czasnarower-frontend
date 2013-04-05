define([ 'flight', 'mixins', 'text!cookies_alert/templates/alert.html' ], function(flight, mixins, alertTemplate) {
  'use strict';

  var FLAG_NAME = 'cnr_cookiesAlertDisabled';

  function CookiesAlert() {

    this.defaultAttrs({
      disableSelector : 'button.close'
    });

    this.isAlertDisabled = function() {
      return (this.storage.getItem(FLAG_NAME) || false);
    };

    this.disableAlert = function() {
      this.storage.setItem(FLAG_NAME, true);
      this.teardown();
    };

    this.render = function() {
      this.$node.html(this.alertTemplate({
        url_policy : 'polityka-prywatnosci'
      }));
    };

    this.after('initialize', function() {
      if (this.isAlertDisabled()) {
        return;
      }

      this.alertTemplate = this.templateFactory(alertTemplate);

      this.on('click', {
        disableSelector : this.disableAlert
      });

      this.render();
    });
  }

  return flight.component(CookiesAlert, mixins.WithStorage, mixins.WithTemplate);
});
