define([ 'underscore', 'flight_index', 'js/mixins/with_translator' ], function(_, flight, WithTranslator) {
  'use strict';

  function WithTemplate() {

    flight.compose.mixin(this, [ WithTranslator ]);

    this.templateFactory = function(html) {
      var template = _.template(html);
      var translate = this.translate;

      return function(data, options) {
        data.translate = translate;
        return template(data, options);
      };
    };
  }
  return WithTemplate;
});
