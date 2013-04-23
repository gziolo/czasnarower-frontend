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
          tableId : data.tableId || _.uniqueId('cnr-data-grid'),
          tableName : data.tableName || '',
          filterOptions : data.filterOptions || {},
          searchEnabled : false
        }));
        $node.find('thead .select').select('resize');
        $node.one('loaded', function() {
          if (data.collection.size() === 0) {
            return;
          }
          if (data.dataOptions === undefined || data.dataOptions.sortProperty === undefined) {
            return;
          }
          $node.find('table.datagrid th.sortable[data-property=' + data.dataOptions.sortProperty + ']').addClass('sorted');
        });
        $node.datagrid({
          dataSource : this.dataSourceFactory({
            collection : data.collection,
            columns : data.columns,
            comparators : data.comparators,
            formatter : data.formatter
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
