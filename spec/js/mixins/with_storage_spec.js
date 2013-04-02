/*global describe, it, before, after, should */

define([ 'flight', 'js/mixins/with_storage' ], function(flight, withStorage) {
  'use strict';

  describe('Storage mixin', function() {
    var instance, instance2;

    before(function() {
      var TestComponent = flight.component(function test() {}, withStorage);
      var Test2Component = flight.component(function test() {}, withStorage);

      $('body').append('<div id="test1"></div><div id="test2"></div>');
      instance = new TestComponent('#test1');
      instance2 = new Test2Component('#test2');
    });

    it('should have storage property', function() {
      instance.storage.should.be.a('object');
    });

    describe('Local storage is on', function() {

      it('should set value in storage', function() {
        instance.storage.setItem('test', 'value');
        instance.storage.getItem('test').should.be.equal('value');
      });

      it('should share values between storage instances', function() {
        instance.storage.setItem('test', 'value');
        instance.storage.getItem('test').should.be.equal(instance2.storage.getItem('test'));
      });

      it('should remove value from storage', function() {
        instance.storage.setItem('test', 'value');
        instance.storage.removeItem('test');
        should.equal(null, instance.storage.getItem('test'));
      });

      it('should clear storage', function() {
        instance.storage.setItem('test', 'value');
        instance.storage.clear();
        should.equal(null, instance.storage.getItem('test'));
      });

      after(function() {
        instance.storage.clear();
      });
    });

    describe('Local storage is off', function() {
      var storage;

      before(function() {
        storage = instance.storage.localStorage;
        instance.storage.localStorage = instance2.storage.localStorage = undefined;
      });

      it('should set value in storage', function() {
        instance.storage.setItem('test', 'value');
        instance.storage.getItem('test').should.be.equal('value');
      });

      it('should share values between storage instances', function() {
        instance.storage.setItem('test', 'value');
        instance.storage.getItem('test').should.be.equal(instance2.storage.getItem('test'));
      });

      it('should remove value from storage', function() {
        instance.storage.setItem('test', 'value');
        instance.storage.removeItem('test');
        should.equal(null, instance.storage.getItem('test'));
      });

      it('should clear storage', function() {
        instance.storage.setItem('test', 'value');
        instance.storage.clear();
        should.equal(null, instance.storage.getItem('test'));
      });

      after(function() {
        instance.storage.clear();
        instance.storage.localStorage = instance2.storage.localStorage = storage;
      });
    });

    after(function() {
      instance.teardown();
      instance2.teardown();
      $('#test1, #test2').remove();
    });

  });
});
