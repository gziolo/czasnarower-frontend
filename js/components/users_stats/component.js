define([ 'underscore', 'flight', 'mixins', 'users_stats/data/races_stats_data_source', 'text!users_stats/templates/data_grid.html' ], function(_, flight, mixins, RacesStatsDataSource, dataGridTemplate) {
  'use strict';

  function UserStats() {

    this.render = function() {
      this.$node.html(this.dataGridTemplate({
        tableId : 'cnr-races-stats',
        tableName : 'Statystyki uczestników wyścigów',
        filterOptions : {},
        searchEnabled : false
      }));
      this.$node.datagrid({
        dataSource : new RacesStatsDataSource({
          columns : [ {
            property : 'user',
            label : 'Użytkownik',
            sortable : false
          }, {
            property : 'x',
            label : 'Liczba wyścigów',
            sortable : true
          }, {
            property : 'y',
            label : 'Całkowity czas',
            sortable : true
          }, {
            property : 'z',
            label : 'Całkowity dystans (km)',
            sortable : true
          }, {
            property : 'z',
            label : 'Średnia prędkość (km/h)',
            sortable : true
          } ],
          formatter: function (items) {
            _.each(items, function (item, index) {
              item.user = 'Użytkownik ' + item.x;
            });
          }
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

  return flight.component(UserStats, mixins.WithTemplate);

});
