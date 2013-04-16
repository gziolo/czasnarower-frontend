define([ 'flight', 'mixins', 'text!cookies_alert/templates/alert.html' ], function(flight, mixins, alertTemplate) {
  'use strict';

  var FLAG_NAME = 'cnr_cookiesAlertDisabled';

  function CookiesAlert() {

    this.defaultAttrs({
      disableSelector : 'button.close'
    });

    this.alertTemplate = this.templateFactory(alertTemplate);

    this.isAlertDisabled = function() {
      return (this.storage.getItem(FLAG_NAME) || false);
    };

    this.disableAlert = function() {
      this.storage.setItem(FLAG_NAME, true);
      this.teardown();
    };

    this.serve = function() {
      if (this.isAlertDisabled()) {
        return;
      }
      this.trigger('uiCookiesAlertServed');
    },

    this.render = function() {
      this.$node.html(this.alertTemplate({
        url_policy : 'polityka-prywatnosci'
      }));
    };

    this.after('initialize', function() {
      this.on('click', {
        disableSelector : this.disableAlert
      });
      this.on('uiCookiesAlertRequested', this.serve);
      this.on('uiCookiesAlertServed', this.render);

      this.trigger('uiCookiesAlertRequested');
    });
  }

  return flight.component(mixins.WithStorage, mixins.WithTemplate, CookiesAlert);
});
