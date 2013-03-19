/*global describe, it, sinon */

define([ 'js/app' ], function(main) {
  'use strict';

  describe('Main', function() {
    describe('Main init', function() {
      it('should be main equal Test', function() {
        main.should.be.a('object');
      });
    });
  });
});
