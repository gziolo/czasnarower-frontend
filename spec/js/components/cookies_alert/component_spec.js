define(function () {
  'use strict';

  describeComponent('cookies_alert/component', function () {

    describe('Cookies alert', function () {

      describe('Alert block disbled', function () {

        beforeEach(function () {
          this.storageGetItemStub = sinon.stub(this.Component.prototype.storage, 'getItem').returns(true);
          setupComponent('<div id="cookies-alert"></div>');
        });

        afterEach(function () {
          this.storageGetItemStub.restore();
        });

        it('should be empty', function () {
          this.component.$node.html().should.be.empty;
        });
      });

      describe('Alert block enabled', function () {

        beforeEach(function () {
          this.storageGetItemStub = sinon.stub(this.Component.prototype.storage, 'getItem').returns(false);
          setupComponent('<div id="cookies-alert"></div>');
        });

        afterEach(function () {
          this.storageGetItemStub.restore();
        });

        it('should have text', function () {
          this.component.$node.find('p').text().should.not.be.empty;
        });

        it('should have privacy link', function () {
          this.component.$node.find('p a').should.have.length(1);
        });

        it('should have close button', function () {
          this.component.$node.find('button').should.have.length(1);
        });

        it('should end up with empty node when close button clicked', function () {
          var storageSetItemSpy = sinon.spy(this.Component.prototype.storage, 'setItem');

          this.component.$node.find('button').trigger('click');
          storageSetItemSpy.should.have.been.calledWith('cnr_cookiesAlertDisabled', true);
          this.component.$node.html().should.be.empty;

          storageSetItemSpy.restore();
        });
      });
    });
  });
});
