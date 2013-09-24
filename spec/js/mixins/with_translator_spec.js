define(function () {
  'use strict';

  describeMixin('js/mixins/with_translator', function () {

    describe('Translator mixin', function () {

      beforeEach(function () {
        setupComponent();
      });

      it('should translate expression', function () {
        var expression = 'test';

        this.component.translate(expression).should.equal(expression);
      });
    });
  });
});
