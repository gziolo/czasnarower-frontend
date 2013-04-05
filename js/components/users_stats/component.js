define([ 'flight', 'mixins', 'users_stats/data/races_stats_data_source', 'text!users_stats/templates/data_grid.html' ], function(flight, mixins, RacesStatsDataSource, dataGridTemplate) {
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
            property : 'x',
            label : 'X',
            sortable : true
          }, {
            property : 'y',
            label : 'Y',
            sortable : false
          }, {
            property : 'z',
            label : 'Z',
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

  return flight.component(UserStats, mixins.WithTemplate);

});
