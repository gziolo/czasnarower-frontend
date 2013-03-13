/*global describe, it, sinon */

define([ 'app/app' ], function(main) {
  'use strict';

  describe('Main', function() {
    describe('Main init', function() {
      it('should be main equal Test', function() {
        main.should.equal('Test');
      });
    });
  });
});
