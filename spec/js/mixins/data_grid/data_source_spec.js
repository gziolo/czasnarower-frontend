define([ 'js/mixins/data_grid/data_source' ], function(DataSource) {
  'use strict';

  describe('Data grid data source', function() {
    it('should throw exception when no collection is provided', function() {
      var func = function() {
        new DataSource();
      };

      func.should.Throw(Error, 'Backbone collection must be passed to data source.');
    });
  });
});
