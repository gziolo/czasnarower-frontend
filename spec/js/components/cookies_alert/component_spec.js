define([ 'jquery', 'cookies_alert/component' ], function($, CookiesAlertComponent) {
  'use strict';

  describe('Cookies alert', function() {

    describe('Alert block disbled', function() {

      before(function() {
        this.storageGetItemStub = sinon.stub(CookiesAlertComponent.prototype.storage, 'getItem').returns(true);
        $('body').append('<div id="cookies-alert"></div>');
        this.instance = new CookiesAlertComponent('#cookies-alert');
      });

      after(function() {
        this.instance.teardown();
        $('#cookies-alert').remove();
        this.storageGetItemStub.restore();
      });

      it('should be empty', function() {
        this.instance.$node.html().should.be.empty;
      });
    });

    describe('Alert block enabled', function() {

      beforeEach(function() {
        this.storageGetItemStub = sinon.stub(CookiesAlertComponent.prototype.storage, 'getItem').returns(false);
        $('body').append('<div id="cookies-alert"></div>');
        this.instance = new CookiesAlertComponent('#cookies-alert');
      });

      afterEach(function() {
        CookiesAlertComponent.teardownAll();
        $('#cookies-alert').remove();
        this.storageGetItemStub.restore();
      });

      it('should have text', function() {
        this.instance.$node.find('p').text().should.not.be.empty;
      });

      it('should have privacy link', function() {
        this.instance.$node.find('p a').should.have.length(1);
      });

      it('should have close button', function() {
        this.instance.$node.find('button').should.have.length(1);
      });

      it('should end up with empty node when close button clicked', function() {
        var storageSetItemSpy = sinon.spy(CookiesAlertComponent.prototype.storage, 'setItem');

        this.instance.$node.find('button').trigger('click');
        storageSetItemSpy.should.have.been.calledWith('cnr_cookiesAlertDisabled', true);
        this.instance.$node.html().should.be.empty;

        storageSetItemSpy.restore();
      });
    });
  });
});
