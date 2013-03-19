/*global describe, it, sinon */

define([ 'js/app' ], function(app) {
  'use strict';

  describe('Main', function() {
    describe('Main init', function() {
      it('should be main equal Test', function() {
        app.should.be.a('object');
      });
    });
  });
});
