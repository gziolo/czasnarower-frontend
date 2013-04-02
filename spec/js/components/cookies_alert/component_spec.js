/*global describe, it, before, after */

define([ 'cookies_alert/component' ], function(CookiesAlert) {
  'use strict';

  describe('Cookies alert', function() {

    describe('Alert block disbled', function() {

      before(function() {
        this.storage = CookiesAlert.prototype.storage.localStorage;
        CookiesAlert.prototype.storage.localStorage = undefined;
        CookiesAlert.prototype.storage.setItem('cnr_cookiesAlertDisabled', true);
        $('body').append('<div id="cookies-alert"></div>');
        this.instance = new CookiesAlert('#cookies-alert');
      });

      it('should be empty', function() {
        this.instance.$node.html().should.be.empty;
      });

      after(function() {
        this.instance.teardown();
        $('#cookies-alert').remove();
        CookiesAlert.prototype.storage.clear();
        CookiesAlert.prototype.storage.localStorage = this.storage;
      });
    });

    describe('Alert block enabled', function() {

      before(function() {
        $('body').append('<div id="cookies-alert"></div>');
        this.instance = new CookiesAlert('#cookies-alert');
      });

      it('should have text', function() {
        this.instance.$node.find('p').text().should.not.be.empty;
      });

      it('should have privacy link', function() {
        this.instance.$node.find('p a').should.have.length(1);
      });

      it('should have close button', function() {
        this.instance.$node.find('button').should.have.length(1);
      });

      after(function() {
        this.instance.teardown();
        $('#cookies-alert').remove();
      });
    });
  });
});
