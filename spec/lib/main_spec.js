/*global describe:true it:true sinon:true */

define([ 'lib/main' ], function(main) {
  'use strict';

  describe('Main', function() {
    describe('Main init', function() {
      it('should be main equal Test', function() {
        main.should.equal('Test');
      });
    });
  });
});
