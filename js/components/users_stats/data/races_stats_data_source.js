define([ 'jquery', 'underscore' ], function($, _) {
  'use strict';

  function RacesStatsDataSource(options) {
    this._columns = options.columns;
  }

  RacesStatsDataSource.prototype = {

    columns : function() {
      return this._columns;
    },

    data : function(options, callback) {
      console.log(options);
      var data = [ {
        x : 'a 1',
        y : 'b 1',
        z : 'c 1'
      }, {
        x : 'af 21',
        y : 'bf 21',
        z : 'cf 21'
      }, {
        x : 'a4 21',
        y : 'b4 21',
        z : 'c4 21'
      }, {
        x : 'ad 21',
        y : 'bd 21',
        z : 'cd 21'
      }, {
        x : 'ac 21',
        y : 'bc 21',
        z : 'cc 21'
      }, {
        x : 'ac 21',
        y : 'bc 21',
        z : 'cc 21'
      }, {
        x : 'ab 21',
        y : 'bb 21',
        z : 'cb 21'
      }, {
        x : 'a 215',
        y : 'b 215',
        z : 'c 215'
      }, {
        x : 'a 219',
        y : 'b 219',
        z : 'c 219'
      }, {
        x : 'a 215',
        y : 'b 215',
        z : 'c 215'
      }, {
        x : 'a 216',
        y : 'b 216',
        z : 'c 216'
      }, {
        x : 'a 2331',
        y : 'b 2331',
        z : 'c 2331'
      }, {
        x : 'a 2441',
        y : 'b 2441',
        z : 'c 2441'
      }, {
        x : 'a 2551',
        y : 'b 2551',
        z : 'c 2551'
      }, {
        x : 'a 241',
        y : 'b 241',
        z : 'c 241'
      }, {
        x : 'a 251',
        y : 'b 251',
        z : 'c 251'
      }, {
        x : 'a 261',
        y : 'b 261',
        z : 'c 261'
      }, {
        x : 'a 204',
        y : 'b 204',
        z : 'c 204'
      }, {
        x : 'a 205',
        y : 'b 205',
        z : 'c 205'
      }, {
        x : 'a 206',
        y : 'b 206',
        z : 'c 206'
      }, {
        x : 'a 207',
        y : 'b 207',
        z : 'c 207'
      }, {
        x : 'a 208',
        y : 'b 208',
        z : 'c 208'
      }, {
        x : 'a 209',
        y : 'b 209',
        z : 'c 209'
      }, {
        x : 'a 211',
        y : 'b 211',
        z : 'c 211'
      }, {
        x : 'a 221',
        y : 'b 221',
        z : 'c 221'
      }, {
        x : 'a 231',
        y : 'b 231',
        z : 'c 231'
      } ];
      var start = options.pageIndex * options.pageSize;
      var count = data.length;
      var end = count < (start + options.pageSize) ? count : (start + options.pageSize);
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

      if (options.sortProperty) {
        data = _.sortBy(data, options.sortProperty);
        if (options.sortDirection === 'desc') {
          data.reverse();
        }
      }

      data = data.slice(start, end);

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

  return RacesStatsDataSource;
});
