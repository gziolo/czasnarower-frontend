define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {
  'use strict';

  function DataSource(options) {
    var collection = options && options.collection;

    if (!(collection instanceof Backbone.Collection)) {
      throw new Error('Backbone collection must be passed to data source.');
    }
    this.collection = collection;
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
      var success = function() {
        options.filter = undefined;
        this.renderDataGrid(options, callback);
      };

      if (options.filter !== undefined) {
        this.collection.fetch({
          success : success.bind(this),
          data : {
            category_id : options.filter.value
          }
        });
        return;
      }

      this.renderDataGrid(options, callback);
    },

    renderDataGrid : function(options, callback) {
      var data;
      var pageIndex = options.pageIndex || 0;
      var pageSize = options.pageSize || 25;
      var count = this.collection.size();
      var startIndex = pageIndex * pageSize;
      var start = startIndex + 1;
      var endIndex = startIndex + pageSize;
      var end = count < endIndex ? count : endIndex;
      var pages = Math.ceil(count / pageSize);
      var page = pageIndex + 1;

      if (options.search) {
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
