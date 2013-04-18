define([ 'backbone', 'js/mixins/data_grid/data_source' ], function(Backbone, DataSource) {
  'use strict';

  describe('Data grid data source', function() {

    var restUrl = '/rest/test';
    var columns = [ {
      property : 'id',
      label : 'Identifier',
      sortable : true
    } ];
    var rows = [ {
      id : 1
    }, {
      id : 2
    } ];

    describe('Constuctor', function() {

      it('should throw exception when no collection is provided', function() {
        var func = function() {
          new DataSource();
        };

        func.should.Throw(Error, 'Backbone collection must be passed to data source.');
      });

      it('should not throw exception when collection is provided', function() {
        var func = function() {
          new DataSource({
            collection : new Backbone.Collection()
          });
        };

        func.should.not.Throw();
      });
    });

    describe('Columns method', function() {

      it('should return empty array when columns are not provided', function() {
        var dataSource = new DataSource({
          collection : new Backbone.Collection()
        });

        dataSource.columns().should.be.empty;
      });

      it('should return same columns structure when columns property is provided', function() {
        var dataSource = new DataSource({
          collection : new Backbone.Collection(),
          columns : columns
        });

        dataSource.columns().should.equal(columns);
      });
    });

    describe('Data method', function() {

      beforeEach(function() {
        var Collection = Backbone.Collection.extend({
          url : restUrl
        });
        this.collection = new Collection();
        this.fixture = new DataSource({
          collection : this.collection,
          columns : columns,
          comparators : {
            id : function(model) {
              return model.get('id');
            }
          }
        });
        this.server = sinon.fakeServer.create();
      });

      afterEach(function() {
        this.server.restore();
        this.fixture = undefined;
        this.collection = undefined;
      });

      it('should execute callback properly when no data rows provided', function() {
        var callback = sinon.spy();

        this.fixture.data({}, callback);
        callback.should.have.been.calledWith({
          data : [],
          start : 1,
          end : 0,
          count : 0,
          pages : 0,
          page : 1
        });
      });

      it('should execute callback properly when data rows provided', function() {
        var callback = sinon.spy();

        this.collection.add(rows);
        this.fixture.data({}, callback);
        callback.should.have.been.calledWith({
          data : rows,
          start : 1,
          end : 2,
          count : 2,
          pages : 1,
          page : 1
        });
      });

      it('should execute callback properly when pagination and data rows provided', function() {
        var callback = sinon.spy();

        this.collection.add(rows);
        this.fixture.data({
          pageIndex : 1,
          pageSize : 1
        }, callback);
        callback.should.have.been.calledWith({
          data : rows.slice(1),
          start : 2,
          end : 2,
          count : 2,
          pages : 2,
          page : 2
        });
      });

      it('should fetch data from web service when filter param provided', function() {
        var filterValue = 1;
        var callback = sinon.spy();

        this.server.respondWith('GET', restUrl + '?filter=' + filterValue, [ 200, {
          'Content-Type' : 'application/json'
        }, JSON.stringify(rows) ]);

        this.fixture.data({
          pageIndex : 0,
          pageSize : 20,
          filter : {
            value : filterValue
          }
        }, callback);

        this.server.respond();

        callback.should.have.been.calledWith({
          data : rows,
          start : 1,
          end : 2,
          count : 2,
          pages : 1,
          page : 1
        });

      });

      it('should execute callback with data sorted when sort param is provided', function() {
        var callback = sinon.spy();

        this.collection.add(rows);
        this.fixture.data({
          sortProperty : 'id'
        }, callback);
        callback.should.have.been.calledWith({
          data : rows,
          start : 1,
          end : 2,
          count : 2,
          pages : 1,
          page : 1
        });
      });

      it('should execute callback with data sorted in descending order when sort direction is provided', function() {
        var callback = sinon.spy();

        this.collection.add(rows);
        this.fixture.data({
          sortProperty : 'id',
          sortDirection : 'desc'
        }, callback);
        callback.should.have.been.calledWith({
          data : rows.slice(0).reverse(),
          start : 1,
          end : 2,
          count : 2,
          pages : 1,
          page : 1
        });
      });

      it('should execute callback with formatted output data when formatter is provided', function() {
        var callback = sinon.spy();

        this.fixture = new DataSource({
          collection : this.collection,
          columns : columns,
          formatter : function(model) {
            var data = model.toJSON();
            data.test = 'test' + data.id;
            return data;
          }
        });
        this.collection.add([ {
          id : 1
        } ]);
        this.fixture.data({}, callback);
        callback.should.have.been.calledWith({
          data : [ {
            id : 1,
            test : 'test1'
          } ],
          start : 1,
          end : 1,
          count : 1,
          pages : 1,
          page : 1
        });
      });
    });
  });
});
