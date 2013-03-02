define(['lib/main'], function(main) {
  'use strict';
  /*global describe:true it:true sinon:true */

  describe('Main', function() {
    describe('Main init', function() {
      it('should be main equal Test', function() {
        main.should.equal('Test');
      });
    });
  });
});
