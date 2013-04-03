define([ 'jquery', 'cookies_alert/component' ], function($, CookiesAlert) {
  'use strict';

  describe('Cookies alert', function() {

    describe('Alert block disbled', function() {

      before(function() {
        this.storageGetItemStub = sinon.stub(CookiesAlert.prototype.storage, 'getItem').returns(true);
        $('body').append('<div id="cookies-alert"></div>');
        this.instance = new CookiesAlert('#cookies-alert');
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
        this.storageGetItemStub = sinon.stub(CookiesAlert.prototype.storage, 'getItem').returns(false);
        $('body').append('<div id="cookies-alert"></div>');
        this.instance = new CookiesAlert('#cookies-alert');
      });

      afterEach(function() {
        CookiesAlert.teardownAll();
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
        var storageSetItemSpy = sinon.spy(CookiesAlert.prototype.storage, 'setItem');

        this.instance.$node.find('button').trigger('click');
        storageSetItemSpy.should.have.been.calledWith('cnr_cookiesAlertDisabled', true);
        this.instance.$node.html().should.be.empty;

        storageSetItemSpy.restore();
      });
    });
  });
});
