define([ 'underscore', 'backbone' ], function(_, Backbone) {
  'use strict';

  return Backbone.Collection.extend({

    url : 'rest/user-race-stats',

    sort : function(options) {
      if (!this.comparator) {
        throw new Error('Cannot sort a set without a comparator');
      }
      options || (options = {});

      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }
      if (options.order === 'desc') {
        this.models.reverse();
      }

      if (!options.silent) {
        this.trigger('sort', this, options);
      }
      return this;
    }
  });
});
