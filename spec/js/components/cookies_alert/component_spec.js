/*global describe, it, before */

define(['cookies_alert/component'], function(cookiesAlert) {
  'use strict';

  describe('Cookies alert', function() {
    it('should be a component function', function() {
      cookiesAlert.should.be.a('function');
    });
  });
});
