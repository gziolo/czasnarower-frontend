define([ 'jquery', 'flight', 'js/mixins/with_template' ], function($, flight, WithTemplate) {
  'use strict';

  describe('Template mixin', function() {

    before(function() {
      var TestComponent = flight.component(function Test() {}, WithTemplate);

      $('body').append('<div id="test1"></div>');
      this.instance = new TestComponent('#test1');
    });

    after(function() {
      this.instance.teardown();
      $('#test1').remove();
    });

    it('should have template factory property', function() {
      this.instance.templateFactory.should.be.a('function');
    });

    it('should return template helper from template factory', function() {
      var template = this.instance.templateFactory('<h1>test</h1>');
      template.should.be.a('function');
    });

    it('should return HTML code from template with replaced data', function() {
      var template = this.instance.templateFactory('<h1>test <%- value %> <%= value2 %></h1>');
      var output = template({
        value : '1&2',
        value2 : '3&4'
      });
      output.should.equal('<h1>test 1&amp;2 3&4</h1>');
    });

    it('should return HTML code from template with translated expression', function() {
      var template = this.instance.templateFactory("<h1><%- translate('test') %></h1>");
      var output = template({});
      output.should.equal('<h1>test</h1>');
    });

  });
});
