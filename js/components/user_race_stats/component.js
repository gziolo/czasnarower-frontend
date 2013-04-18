define([ 'flight', 'mixins', 'user_race_stats/collections/stats', 'text!user_race_stats/templates/user_column.html' ], function(flight, mixins, UserRaceStatsCollection, userColumnTemplate) {
  'use strict';

  function UserRaceStats() {

    this.userColumnTemplate = this.templateFactory(userColumnTemplate);

    this.setupDataGrid = function() {
      var self = this;
      var statsCollection = new UserRaceStatsCollection();
      var data = this.$node.data('stats') || [];
      var filterOptions = this.$node.data('filterOptions') || {};

      statsCollection.reset(data);

      this.trigger('uiUserRaceStatsServed', {
        $node : this.$node,
        tableId : 'cnr-races-stats',
        tableName : 'Statystyki uczestników wyścigów',
        filterOptions : filterOptions,
        collection : statsCollection,
        columns : [ {
          property : 'user',
          label : 'Użytkownik',
          sortable : false
        }, {
          property : 'total_time',
          label : 'Całkowity czas',
          sortable : true
        }, {
          property : 'total_odo',
          label : 'Całkowity dystans (km)',
          sortable : true
        }, {
          property : 'races',
          label : 'Liczba wyścigów',
          sortable : true
        }, {
          property : 'avg_speed',
          label : 'Średnia prędkość (km/h)',
          sortable : true
        } ],
        comparators : {
          'total_time' : function(model) {
            var timeParts = model.get('total_time').split(':');
            if (timeParts.length !== 3) {
              return 0;
            }
            return 3600 * parseInt(timeParts[0], 10) + 60 * parseInt(timeParts[1], 10) + parseInt(timeParts[2], 10);
          },
          'total_odo' : function(model) {
            return parseFloat(model.get('total_odo'));
          },
          'races' : function(model) {
            return parseInt(model.get('races'), 10);
          },
          'avg_speed' : function(model) {
            return parseFloat(model.get('avg_speed'));
          }
        },
        formatter : function(model) {
          var data = model.toJSON();
          data.user = self.userColumnTemplate(data);
          return data;
        },
        dataOptions : {
          sortProperty : 'total_time',
          sortDirection : 'desc'
        }
      });
    };

    this.render = function(ev, data) {
      this.dataGrid.render(data);
    };

    this.after('initialize', function() {
      this.on('uiUserRaceStatsRequested', this.setupDataGrid);
      this.on('uiUserRaceStatsServed', this.render);

      this.trigger('uiUserRaceStatsRequested');
    });
  }

  return flight.component(mixins.WithDataGrid, mixins.WithTemplate, UserRaceStats);

});
