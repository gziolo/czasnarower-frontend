define([ 'underscore', 'flight', 'js/mixins/with_template', 'js/mixins/data_grid/data_source', 'text!js/mixins/data_grid/templates/data_grid.html' ], function(_, flight, WithTemplate, DataSource,
    dataGridTemplate) {
  'use strict';

  function WithDataGrid() {

    flight.compose.mixin(this, [ WithTemplate ]);

    this.dataGrid = {
      dataSourceFactory : function(options) {
        return new DataSource(options);
      },
      render : function(data) {
        var $node = data && data.$node;

        if ($node === undefined) {
          throw new Error('Data grid needs DOM element to render.');
        }

        $node.html(this.template({
          tableId : data.tableId || _.uniqueId('dataGrid'),
          tableName : data.tableName || '',
          filterOptions : data.filterOptions || {},
          searchEnabled : false
        }));
        $node.find('thead .select').select('resize');
        $node.datagrid({
          dataSource : this.dataSourceFactory({
            collection : data.collection,
            columns : data.columns || [],
            comparators : data.comparators || {},
            formatter : data.formatter || function() {}
          }),
          dataOptions : data.dataOptions || {},
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
