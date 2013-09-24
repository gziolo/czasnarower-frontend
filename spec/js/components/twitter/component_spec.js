define([ 'jquery' ], function ($) {
  'use strict';

  describeComponent('twitter/component', function () {

    describe('Twitter', function () {

      beforeEach(function () {
        this.loadScriptStub = sinon.stub(this.Component.prototype, 'loadScript');
      });

      afterEach(function () {
        this.loadScriptStub.restore();
      });

      it('should not load twitter library when no twitter widget found.', function () {

        setupComponent();

        this.loadScriptStub.should.not.have.been.called;
      });

      it('should not load twitter library when twitter widget found but not visible.', function () {

        var $fixture = $('<div id="twitter-component"><div class="twitter-share-button" style="display: none"></div></div>');

        setupComponent($fixture);

        this.loadScriptStub.should.not.have.been.called;
      });

      it('should load twitter library when visible twitter widget found after window resize.', function () {

        var $fixture = $('<div id="twitter-component" style="display: none"><div class="twitter-share-button"></div></div>');

        setupComponent($fixture);
        $fixture.show();
        $(window).resize();

        this.loadScriptStub.should.have.been.calledOnce;
      });

      it('should load twitter library exactly once when twitter widget found.', function () {

        var $fixture = $('<div id="twitter-component"><div class="twitter-share-button"></div></div>');

        setupComponent($fixture);
        $(window).resize();
        $(window).resize();

        this.loadScriptStub.should.have.been.calledOnce;
      });
    });
  });
});
