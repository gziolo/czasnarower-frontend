define([ 'underscore', 'flight', 'mixins', 'user_race_stats/collections/stats', 'user_race_stats/model/data_source', 'text!user_race_stats/templates/data_grid.html' ], function(_, flight, mixins,
    UserRaceStatsCollection, DataSource, dataGridTemplate) {
  'use strict';

  function UserRaceStats() {

    this.render = function() {
      var statsCollection = new UserRaceStatsCollection();
      statsCollection.reset(this.$node.data('stats'));
      this.$node.html(this.dataGridTemplate({
        tableId : 'cnr-races-stats',
        tableName : 'Statystyki uczestników wyścigów',
        filterOptions : {},
        searchEnabled : false
      }));
      this.$node.datagrid({
        dataSource : new DataSource({
          collection : statsCollection,
          columns : [ {
            property : 'user',
            label : 'Użytkownik',
            sortable : false
          }, {
            property : 'races',
            label : 'Liczba wyścigów',
            sortable : true
          }, {
            property : 'total_time',
            label : 'Całkowity czas',
            sortable : true
          }, {
            property : 'total_odo',
            label : 'Całkowity dystans (km)',
            sortable : true
          }, {
            property : 'avg_speed',
            label : 'Średnia prędkość (km/h)',
            sortable : true
          } ]
        }),
        dataOptions : {
          sortDirection : 'asc',
          sortProperty : 'x'
        },
        itemsText : 'wierszy',
        itemText : 'wiersz'
      });
    };

    this.after('initialize', function() {
      this.dataGridTemplate = this.templateFactory(dataGridTemplate);
      this.render();
    });
  }

  return flight.component(UserRaceStats, mixins.WithTemplate);

});
