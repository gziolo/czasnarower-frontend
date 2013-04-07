define([ 'jquery', 'user_race_stats/component' ], function($, UserRaceStats) {
  'use strict';

  describe('User race stats', function() {

    before(function() {
      $('body').append('<div id="test"></div>');
      this.instance = new UserRaceStats('#test');
    });

    it('has datagrid table', function() {
      this.instance.$node.find('table.datagrid').length.should.equal(1);
    });
    
    it('has empty datagrid table tbody', function() {
      this.instance.$node.find('table.datagrid tbody').text().should.equal('0 wierszy');
    });

    after(function() {
      this.instance.teardown();
      $('#test').remove();
    });

  });
});
