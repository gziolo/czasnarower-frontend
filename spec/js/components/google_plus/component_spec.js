define([ 'jquery' ], function ($) {
  'use strict';

  describeComponent('google_plus/component', function () {

    describe('Google plus', function () {

      beforeEach(function () {
        this.loadScriptStub = sinon.stub(this.Component.prototype, 'loadScript');
      });

      afterEach(function () {
        this.loadScriptStub.restore();
      });

      it('should not load google plus library when no plus one widget found.', function () {

        setupComponent();

        this.loadScriptStub.should.not.have.been.called;
      });

      it('should not load twitter library when twitter widget found but not visible.', function () {
        var $fixture = $('<div id="google-component" style="display: none"><div class="g-plusone"></div></div>');

        setupComponent($fixture);

        this.loadScriptStub.should.not.have.been.called;
      });

      it('should load google plus library when visible plus one widget found after window resize.', function () {
        var $fixture = $('<div id="google-component" style="display: none"><div class="g-plusone"></div></div>');

        setupComponent($fixture);
        $fixture.show();
        $(window).resize();

        this.loadScriptStub.should.have.been.calledOnce;
      });

      it('should load google plus library exactly once when plus one widget found.', function () {
        var $fixture = $('<div id="google-component"><div class="g-plusone"></div></div>');

        setupComponent($fixture);
        $(window).resize();
        $(window).resize();

        this.loadScriptStub.should.have.been.calledOnce;
      });
    });
  });
});