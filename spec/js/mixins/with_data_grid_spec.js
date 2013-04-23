define([ 'jquery', 'backbone', 'flight', 'js/mixins/with_data_grid', 'js/mixins/data_grid/data_source' ], function($, Backbone, flight, WithDataGrid, DataSource) {
  'use strict';

  describe('Data grid mixin', function() {

    beforeEach(function() {
      var TestComponent = flight.component(function Test() {}, WithDataGrid);

      $('body').append('<div id="test1"></div>');
      this.instance = new TestComponent('#test1');
    });

    afterEach(function() {
      this.instance.teardown();
      $('#test1').remove();
    });

    it('should have dataGrid property', function() {
      this.instance.dataGrid.should.be.a('object');
    });

    it('should return DataSource object from data source factory', function() {
      this.instance.dataGrid.dataSourceFactory({
        collection : new Backbone.Collection()
      }).should.be.an.instanceOf(DataSource);
    });

    describe('Template method', function() {

      var data = {
        tableId : 'dataGrid1',
        tableName : 'Test table',
        filterOptions : {},
        searchEnabled : false
      };

      it('should have data grid template method', function() {
        this.instance.dataGrid.template.should.be.a('function');
      });

      it('should have table with proper id', function() {
        var templateHtml = this.instance.dataGrid.template(data);

        templateHtml.should.contain.string('<table id="dataGrid1"');
      });

      it('should have table with proper name', function() {
        var templateHtml = this.instance.dataGrid.template(data);

        templateHtml.should.contain.string('<span class="datagrid-header-title">Test table</span>');
      });

      it('should not have table with filter select', function() {
        var templateHtml = this.instance.dataGrid.template(data);

        templateHtml.should.not.contain.string('<div class="select filter"');
      });

      it('should have table with filter select', function() {
        var dataWithFilter = $.extend(data, {
          filterOptions : {
            'all' : 'All'
          }
        });
        var templateHtml = this.instance.dataGrid.template(dataWithFilter);

        templateHtml.should.contain.string('<div class="select filter"');
      });

      it('should not have table with search box', function() {
        var templateHtml = this.instance.dataGrid.template(data);

        templateHtml.should.not.contain.string('<div class="input-append search datagrid-search">');
      });

      it('should have table with search box', function() {
        var dataWithFilter = $.extend(data, {
          searchEnabled : true
        });
        var templateHtml = this.instance.dataGrid.template(dataWithFilter);

        templateHtml.should.contain.string('<div class="input-append search datagrid-search">');
      });
    });

    it('should throw exception for render method when target DOM node missing', function() {
      this.instance.dataGrid.render.should.Throw(Error, 'Data grid needs DOM element to render.');
    });

    describe('Render method with no rows', function() {

      beforeEach(function() {
        this.data = {
          collection : new Backbone.Collection(),
          $node : this.instance.$node
        };
      });


      afterEach(function() {
        this.data = undefined;
      });

      it('should have datagrid table', function() {
        this.instance.dataGrid.render(this.data);
        this.instance.$node.find('table.datagrid').length.should.equal(1);
      });

      it('should have datagrid with proper id', function() {
        this.instance.dataGrid.render(this.data);
        this.instance.$node.find('table.datagrid').attr('id').should.match(/^cnr-data-grid/);
      });

      it('should have datagrid table head with proper label', function() {
        this.instance.dataGrid.render(this.data);
        this.instance.$node.find('table.datagrid thead .datagrid-header-title').text().should.equal('');
      });

      it('should have no filtering combo box', function() {
        this.instance.dataGrid.render(this.data);
        this.instance.$node.find('.filter .dropdown-menu').length.should.equal(0);
      });

      it('should have datagrid table body with proper message', function() {
        this.instance.dataGrid.render(this.data);
        this.instance.$node.find('table.datagrid tbody').text().should.equal('0 wierszy');
      });

      it('should not mark column as sorted when sorting param provided', function() {
        this.data.dataOptions = {
          sortProperty : 'name',
          sortDirection : 'desc'
        };
        this.instance.dataGrid.render(this.data);
        this.instance.$node.find('table.datagrid th.sortable[data-property=name]').hasClass('sorted').should.equal(false);
      });
    });

    describe('Render method with rows', function() {

      beforeEach(function() {
        var collection = new Backbone.Collection();
        this.data = {
          collection : collection,
          $node : this.instance.$node,
          columns : [ {
            property : 'id',
            label : 'ID',
            sortable : false
          }, {
            property : 'name',
            label : 'Name',
            sortable : true
          } ]
        };
        collection.add([ {
          id : 1,
          name : 'Val 1'
        }, {
          id : 2,
          name : 'Val 2'
        } ]);
      });

      afterEach(function() {
        this.data = undefined;
      });

      it('should have sortable column with property name sortable', function() {
        this.instance.dataGrid.render(this.data);
        this.instance.$node.find('table.datagrid th.sortable[data-property=name]').length.should.be.equal(1);
      });

      it('should not mark column as sorted when sorting param provided for not sortable column', function() {
        this.data.dataOptions = {
          sortProperty : 'id',
          sortDirection : 'desc'
        };
        this.instance.dataGrid.render(this.data);
        this.instance.$node.find('table.datagrid th[data-property=id]').hasClass('sorted').should.equal(false);
      });

      it('should mark column as sorted when sorting param provided', function() {
        this.data.dataOptions = {
          sortProperty : 'name',
          sortDirection : 'desc'
        };
        this.instance.dataGrid.render(this.data);
        this.instance.$node.find('table.datagrid th.sortable[data-property=name]').hasClass('sorted').should.equal(true);
      });
    });
  });
});
