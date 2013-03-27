/*global describe, it, before */

define([ 'jquery', 'js/app' ], function($, app) {
  'use strict';

  describe('Application', function() {
    describe('Application start', function() {
      it('should be main equal Test', function() {
        app.should.be.a('object');
      });
    });
  });
});
