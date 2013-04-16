define([ 'flight', 'js/mixins/with_template', 'js/mixins/data_grid/data_source', 'text!js/mixins/data_grid/templates/data_grid.html' ], function(flight, WithTemplate, DataSource, dataGridTemplate) {
  'use strict';

  function WithDataGrid() {

    flight.compose.mixin(this, [ WithTemplate ]);

    this.dataGrid = {
      dataSourceFactory : function(options) {
        return new DataSource(options);
      },
      render : function(data) {
        data.$node.html(this.template({
          tableId : data.tableId,
          tableName : data.tableName,
          filterOptions : data.filterOptions,
          searchEnabled : false
        }));
        data.$node.find('thead .select').select('resize');
        data.$node.datagrid({
          dataSource : this.dataSourceFactory({
            collection : data.collection,
            columns : data.columns,
            comparators : data.comparators,
            formatter : data.formatter
          }),
          dataOptions : data.dataOptions,
          loadingHTML : '<div class="progress progress-striped active" style="width:50%;margin:auto;"><div class="bar" style="width:100%;"></div></div>',
          itemsText : 'wierszy',
          itemText : 'wiersz'
        });
      },
      template : this.templateFactory(dataGridTemplate)
    };
  }

  return WithDataGrid;
});
