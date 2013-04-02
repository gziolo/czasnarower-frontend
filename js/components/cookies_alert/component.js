define([ 'underscore', 'flight', 'js/mixins/with_storage', 'text!cookies_alert/templates/alert.html' ], function(_, flight, withStorage, alertTemplate) {
  "use strict";

  var FLAG_NAME = 'cnr_cookiesAlertDisabled';

  function CookiesAlert() {

    var template = _.template(alertTemplate);

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
      this.$node.html(template({
        url_policy : 'polityka-prywatnosci'
      }));
    };

    this.after('initialize', function() {
      if (this.isAlertDisabled()) {
        return;
      }

      this.on('click', {
        disableSelector : this.disableAlert
      });

      this.render();
    });
  }

  return flight.component(CookiesAlert, withStorage);
});
