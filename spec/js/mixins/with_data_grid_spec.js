define([ 'jquery', 'flight', 'js/mixins/with_data_grid' ], function($, flight, WithDataGrid) {
  'use strict';

  describe('Data grid mixin', function() {

    beforeEach(function() {
      var TestComponent = flight.component(function Test() {}, WithDataGrid);

      $('body').append('<div id="test1"></div>');
      this.instance = new TestComponent('#test1');
    });

    afterEach(function() {
      this.instance.teardown();
      $('#test1').remove();
    });

    it('should have dataGrid property', function() {
      this.instance.dataGrid.should.be.a('object');
    });

    it('should have data grid template method', function() {
      this.instance.dataGrid.template.should.be.a('function');
    });

    it('should have data grid render method', function() {
      this.instance.dataGrid.render.should.be.a('function');
    });
  });
});
