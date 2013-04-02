/*global describe, it, before, after */

define([ 'cookies_alert/component' ], function(CookiesAlert) {
  'use strict';

  describe('Cookies alert', function() {

    describe('Block disbled', function() {
      var instance;
      var storage;

      before(function() {
        storage = CookiesAlert.prototype.storage.localStorage;
        CookiesAlert.prototype.storage.localStorage = undefined;
        CookiesAlert.prototype.storage.setItem('cnr_cookiesAlertDisabled', true);
        $('body').append('<div id="cookies-alert"></div>');
        instance = new CookiesAlert('#cookies-alert');
      });

      it('should be empty', function() {
        instance.$node.html().should.be.empty;
      });

      after(function() {
        instance.teardown();
        $('#cookies-alert').remove();
        CookiesAlert.prototype.storage.clear();
        CookiesAlert.prototype.storage.localStorage = storage;
      });
    });

    describe('Block enabled', function() {
      var instance;

      before(function() {
        $('body').append('<div id="cookies-alert"></div>');
        instance = new CookiesAlert('#cookies-alert');
      });

      it('should have text', function() {
        instance.$node.find('p').text().should.not.be.empty;
      });

      it('should have privacy link', function() {
        instance.$node.find('p a').should.have.length(1);
      });

      it('should have close button', function() {
        instance.$node.find('button').should.have.length(1);
      });

      after(function() {
        instance.teardown();
        $('#cookies-alert').remove();
      });
    });
  });
});
