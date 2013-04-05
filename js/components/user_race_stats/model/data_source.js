define([ 'jquery', 'underscore' ], function($, _) {
  'use strict';

  function DataSource(options) {
    this.collection = options.collection;
    this.columnsData = options.columns;
    this.comparators = {
      'races' : function(model) {
        return parseInt(model.get('races'), 10);
      },
      'total_odo' : function(model) {
        return parseFloat(model.get('total_odo'));
      },
      'avg_speed' : function(model) {
        return parseFloat(model.get('avg_speed'));
      }
    };
  }

  DataSource.prototype = {

    columns : function() {
      return this.columnsData;
    },

    data : function(options, callback) {
      var data = this.collection.toJSON();
      var count = this.collection.size();
      var startIndex = options.pageIndex * options.pageSize;
      var start = startIndex + 1;
      var endIndex = startIndex + options.pageSize;
      var end = count < endIndex ? count : endIndex;
      var pages = Math.ceil(count / options.pageSize);
      var page = options.pageIndex + 1;

      if (options.search) {
        data = _.filter(data, function(item) {
          for ( var prop in item) {
            if (!item.hasOwnProperty(prop)) {
              continue;
            }
            if (item[prop].toString().toLowerCase().indexOf(options.search.toLowerCase())) {
              return true;
            }
          }
          return false;
        });
      }

      if (options.filter) {
        data = _.filter(data, function(item) {
          switch (options.filter.value) {
            case 'lt5m':
              if (item.population < 5000000) {
                return true;
              }
              break;
            case 'gte5m':
              if (item.population >= 5000000) {
                return true;
              }
              break;
            default:
              return true;
          }
        });
      }

      if (options.sortProperty && this.comparators[options.sortProperty] !== undefined) {
        this.collection.comparator = this.comparators[options.sortProperty];
        this.collection.sort();
      }
      data = this.collection.toJSON();
      if (options.sortDirection === 'desc') {
        data.reverse();
      }
      data = data.slice(startIndex, end);
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
