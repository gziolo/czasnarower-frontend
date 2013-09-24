define([ 'jquery', 'flight_index', 'js/mixins/with_storage' ], function ($, flight, WithStorage) {
  'use strict';

  describe('js/mixins/with_storage', function () {

    describe('Storage mixin', function () {

      before(function () {
        var TestComponent = flight.component(function Test() {
        }, WithStorage);
        var Test2Component = flight.component(function Test() {
        }, WithStorage);

        $('body').append('<div id="test1"></div><div id="test2"></div>');
        this.component = (new TestComponent()).initialize('#test1');
        this.component2 = (new Test2Component()).initialize('#test2');
      });

      after(function () {
        this.component.teardown();
        this.component2.teardown();
        $('#test1, #test2').remove();
      });

      it('should have storage property', function () {
        this.component.storage.should.be.a('object');
      });

      describe('Local storage is on', function () {

        after(function () {
          this.component.storage.clear();
        });

        it('should set value in storage', function () {
          this.component.storage.setItem('test', 'value');
          this.component.storage.getItem('test').should.be.equal('value');
        });

        it('should share values between storage components', function () {
          this.component.storage.setItem('test', 'value');
          this.component.storage.getItem('test').should.be.equal(this.component2.storage.getItem('test'));
        });

        it('should remove value from storage', function () {
          this.component.storage.setItem('test', 'value');
          this.component.storage.removeItem('test');
          should.equal(null, this.component.storage.getItem('test'));
        });

        it('should clear storage', function () {
          this.component.storage.setItem('test', 'value');
          this.component.storage.clear();
          should.equal(null, this.component.storage.getItem('test'));
        });
      });

      describe('Local storage is off', function () {

        before(function () {
          this.storage = this.component.storage.localStorage;
          this.component.storage.localStorage = this.component2.storage.localStorage = undefined;
        });

        after(function () {
          this.component.storage.clear();
          this.component.storage.localStorage = this.component2.storage.localStorage = this.storage;
        });

        it('should set value in storage', function () {
          this.component.storage.setItem('test', 'value');
          this.component.storage.getItem('test').should.be.equal('value');
        });

        it('should share values between storage components', function () {
          this.component.storage.setItem('test', 'value');
          this.component.storage.getItem('test').should.be.equal(this.component2.storage.getItem('test'));
        });

        it('should remove value from storage', function () {
          this.component.storage.setItem('test', 'value');
          this.component.storage.removeItem('test');
          should.equal(null, this.component.storage.getItem('test'));
        });

        it('should clear storage', function () {
          this.component.storage.setItem('test', 'value');
          this.component.storage.clear();
          should.equal(null, this.component.storage.getItem('test'));
        });
      });

    });
  });
});
