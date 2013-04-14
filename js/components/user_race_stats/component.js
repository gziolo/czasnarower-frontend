/*jshint maxparams:10 */
define([ 'underscore', 'flight', 'mixins', 'user_race_stats/collections/stats', 'user_race_stats/model/data_source', 'text!user_race_stats/templates/data_grid.html',
    'text!user_race_stats/templates/user_column.html' ], function(_, flight, mixins, UserRaceStatsCollection, DataSource, dataGridTemplate, userColumnTemplate) {
  'use strict';

  function UserRaceStats() {

    this.render = function() {
      var self = this;
      var statsCollection = new UserRaceStatsCollection();
      var data = this.$node.data('stats') || [];
      var filterOptions = this.$node.data('filterOptions') || {};
      
      statsCollection.reset(data);
      this.$node.html(this.dataGridTemplate({
        tableId : 'cnr-races-stats',
        tableName : 'Statystyki uczestników wyścigów',
        filterOptions : filterOptions,
        searchEnabled : false
      }));
      this.$node.find('thead .select').select('resize');
      this.$node.datagrid({
        dataSource : new DataSource({
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
          }
        }),
        dataOptions : {
          sortProperty : 'total_time',
          sortDirection : 'desc'
        },
        loadingHTML : '<div class="progress progress-striped active" style="width:50%;margin:auto;"><div class="bar" style="width:100%;"></div></div>',
        itemsText : 'wierszy',
        itemText : 'wiersz'
      });
    };

    this.after('initialize', function() {
      this.dataGridTemplate = this.templateFactory(dataGridTemplate);
      this.userColumnTemplate = this.templateFactory(userColumnTemplate);
      this.render();
    });
  }

  return flight.component(UserRaceStats, mixins.WithTemplate);

});
