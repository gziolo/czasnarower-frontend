define([ 'jquery', 'flight', 'js/mixins/with_storage' ], function($, flight, WithStorage) {
  'use strict';

  describe('Storage mixin', function() {

    before(function() {
      var TestComponent = flight.component(function Test() {}, WithStorage);
      var Test2Component = flight.component(function Test() {}, WithStorage);

      $('body').append('<div id="test1"></div><div id="test2"></div>');
      this.instance = new TestComponent('#test1');
      this.instance2 = new Test2Component('#test2');
    });

    after(function() {
      this.instance.teardown();
      this.instance2.teardown();
      $('#test1, #test2').remove();
    });

    it('should have storage property', function() {
      this.instance.storage.should.be.a('object');
    });

    describe('Local storage is on', function() {

      after(function() {
        this.instance.storage.clear();
      });

      it('should set value in storage', function() {
        this.instance.storage.setItem('test', 'value');
        this.instance.storage.getItem('test').should.be.equal('value');
      });

      it('should share values between storage instances', function() {
        this.instance.storage.setItem('test', 'value');
        this.instance.storage.getItem('test').should.be.equal(this.instance2.storage.getItem('test'));
      });

      it('should remove value from storage', function() {
        this.instance.storage.setItem('test', 'value');
        this.instance.storage.removeItem('test');
        should.equal(null, this.instance.storage.getItem('test'));
      });

      it('should clear storage', function() {
        this.instance.storage.setItem('test', 'value');
        this.instance.storage.clear();
        should.equal(null, this.instance.storage.getItem('test'));
      });
    });

    describe('Local storage is off', function() {

      before(function() {
        this.storage = this.instance.storage.localStorage;
        this.instance.storage.localStorage = this.instance2.storage.localStorage = undefined;
      });

      after(function() {
        this.instance.storage.clear();
        this.instance.storage.localStorage = this.instance2.storage.localStorage = this.storage;
      });

      it('should set value in storage', function() {
        this.instance.storage.setItem('test', 'value');
        this.instance.storage.getItem('test').should.be.equal('value');
      });

      it('should share values between storage instances', function() {
        this.instance.storage.setItem('test', 'value');
        this.instance.storage.getItem('test').should.be.equal(this.instance2.storage.getItem('test'));
      });

      it('should remove value from storage', function() {
        this.instance.storage.setItem('test', 'value');
        this.instance.storage.removeItem('test');
        should.equal(null, this.instance.storage.getItem('test'));
      });

      it('should clear storage', function() {
        this.instance.storage.setItem('test', 'value');
        this.instance.storage.clear();
        should.equal(null, this.instance.storage.getItem('test'));
      });
    });

  });
});
