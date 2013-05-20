define([ 'jquery', 'user_race_stats/component' ], function($, UserRaceStatsComponent) {
  'use strict';

  describe('User race stats', function() {

    describe('Data not provided', function() {

      before(function() {
        $('body').append('<div id="test"></div>');
        this.instance = new UserRaceStatsComponent('#test');
      });

      after(function() {
        this.instance.teardown();
        $('#test').remove();
      });

      it('should have datagrid table', function() {
        this.instance.$node.find('table.datagrid').length.should.equal(1);
      });

      it('should have datagrid with proper id', function() {
        this.instance.$node.find('table.datagrid').attr('id').should.equal('cnr-races-stats');
      });

      it('should have datagrid table head with proper label', function() {
        this.instance.$node.find('table.datagrid thead .datagrid-header-title').text().should.equal('Statystyki uczestników wyścigów');
      });

      it('should have no filtering combo box', function() {
        this.instance.$node.find('.filter .dropdown-menu').length.should.equal(0);
      });

      it('should have datagrid table body with proper message', function() {
        this.instance.$node.find('table.datagrid tbody').text().should.equal('0 wierszy');
      });
    });

    describe('Data provided', function() {

      before(function() {
        $('body').append('<div id="test"></div>');
        $('#test').data('stats', [ {
          total_time : '04:02:33',
          total_odo : '123',
          races : '2',
          avg_speed : '21',
          nick : 'test user',
          avatar_file_name : 'http://www.czasnarower.pl/photo/avatar/avatar_default.jpg',
          url_view : 'http://www.czasnarower/uzytkownik/123'
        }, {
          total_time : '05:02:33',
          total_odo : '120,5',
          races : '3',
          avg_speed : '18,5',
          nick : 'test user2',
          avatar_file_name : 'http://www.czasnarower.pl/photo/avatar/avatar_default.jpg',
          url_view : 'http://www.czasnarower/uzytkownik/323'
        } ]);
        $('#test').data('filterOptions', {
          0 : 'All',
          1 : 'MTB marathon',
          2 : 'Cross-country'
        });
        this.instance = new UserRaceStatsComponent('#test');
      });

      after(function() {
        this.instance.teardown();
        $('#test').remove();
      });

      it('should have filtering dropdown', function() {
        this.instance.$node.find('thead .filter ul.dropdown-menu').length.should.equal(1);
      });

      it('should have filtering dropdown with 3 options', function() {
        this.instance.$node.find('thead .filter ul.dropdown-menu li').length.should.equal(3);
      });

      it('should have filtering dropdown with first option value equal 0', function() {
        this.instance.$node.find('thead .filter ul.dropdown-menu li:first').data('value').should.equal(0);
      });

      it('should have filtering dropdown with first option label equal All', function() {
        this.instance.$node.find('thead .filter ul.dropdown-menu li:first').text().should.equal('All');
      });

      it('should have datagrid with two rows', function() {
        this.instance.$node.find('tbody tr').length.should.equal(2);
      });

      it('should have datagrid with five columns', function() {
        this.instance.$node.find('tbody tr:first td').length.should.equal(5);
      });

      it('should have datagrid sorted by total time column', function() {
        this.instance.$node.find('tbody tr:first > td:nth-child(2)').text().should.equal('05:02:33');
      });

      it('should have datagrid with image in first column', function() {
        this.instance.$node.find('tbody tr:first > td:nth-child(1) img').attr('src').should.equal('http://www.czasnarower.pl/photo/avatar/avatar_default.jpg');
      });

      it('should have datagrid with link to user profile in first column', function() {
        this.instance.$node.find('tbody tr:first > td:nth-child(1) a').attr('href').should.equal('http://www.czasnarower/uzytkownik/323');
      });
    });

  });
});
