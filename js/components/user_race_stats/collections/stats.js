define([ 'backbone' ], function(Backbone) {
  'use strict';

  return Backbone.Collection.extend({

    url : 'rest/user-race-stats',

    parse : function(response) {
      return response.data;
    }
  });
});
