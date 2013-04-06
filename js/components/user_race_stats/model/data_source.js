define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {
  'use strict';

  function DataSource(options) {

    if (!(options.collection instanceof Backbone.Collection)) {
      throw new Error('Backbone collection must be passed to data source.');
    }
    this.collection = options.collection;
    this.columnsData = options.columns || [];
    this.comparators = options.comparators || {};
    this.formatter = options.formatter || function(model) {
      return model.toJSON();
    };
  }

  DataSource.prototype = {

    columns : function() {
      return this.columnsData;
    },

    data : function(options, callback) {
      var data;
      var count = this.collection.size();
      var startIndex = options.pageIndex * options.pageSize;
      var start = startIndex + 1;
      var endIndex = startIndex + options.pageSize;
      var end = count < endIndex ? count : endIndex;
      var pages = Math.ceil(count / options.pageSize);
      var page = options.pageIndex + 1;

      if (options.search) {
      }

      if (options.filter) {
      }

      if (options.sortProperty && this.comparators[options.sortProperty] !== undefined) {
        this.collection.comparator = this.comparators[options.sortProperty];
        this.collection.sort({
          order : options.sortDirection
        });
      }
      
      data = this.collection.slice(startIndex, end);
      
      data = _.map(data, this.formatter);
      
      callback({
        data : data,
        start : start,
        end : end,
        count : count,
        pages : pages,
        page : page
      });
    }
  };

  return DataSource;
});
