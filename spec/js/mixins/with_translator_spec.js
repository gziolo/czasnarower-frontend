define([ 'jquery', 'flight', 'js/mixins/with_translator' ], function($, flight, WithTranslator) {
  'use strict';

  describe('Translation mixin', function() {

    before(function() {
      var TestComponent = flight.component(function Test() {}, WithTranslator);

      $('body').append('<div id="test1"></div>');
      this.instance = new TestComponent('#test1');
    });

    after(function() {
      this.instance.teardown();
      $('#test1').remove();
    });

    it('should translate expression', function() {
      var expression = 'test';

      this.instance.translate(expression).should.equal(expression);
    });
  });
});
