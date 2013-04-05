define([ 'underscore' ], function(_) {
  'use strict';

  function WithTemplate() {
    this.templateFactory = function(html) {
      var template = _.template(html);
      return function(data, options) {
        data.translate = function(text) {
          return text;
        };
        return template(data, options);
      };
    };
  }
  return WithTemplate;
});
