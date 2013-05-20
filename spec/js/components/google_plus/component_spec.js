define([ 'jquery', 'google_plus/component' ], function($, GooglePlusComponent) {
  'use strict';

  describe('Google plus', function() {

    beforeEach(function() {
      this.loadScriptStub = sinon.stub(GooglePlusComponent.prototype, 'loadScript');
    });

    afterEach(function() {
      this.loadScriptStub.restore();
    });

    it('should not load google plus library when no plus one widget found.', function() {
      var instance;

      instance = new GooglePlusComponent('body');

      this.loadScriptStub.should.not.have.been.called;

      instance.teardown();
    });

    it('should not load twitter library when twitter widget found but not visible.', function() {
      var instance;

      $('body').append('<div id="google-component" style="display: none"><div class="g-plusone"></div></div>');

      instance = new GooglePlusComponent('body');

      this.loadScriptStub.should.not.have.been.called;

      instance.teardown();
      $('#google-component').remove();
    });

    it('should load google plus library when visible plus one widget found after window resize.', function() {
      var instance;

      $('body').append('<div id="google-component" style="display: none"><div class="g-plusone"></div></div>');

      instance = new GooglePlusComponent('body');
      $('#google-component').show();
      $(window).resize();

      this.loadScriptStub.should.have.been.calledOnce;

      instance.teardown();
      $('#google-component').remove();
    });

    it('should load google plus library exactly once when plus one widget found.', function() {
      var instance;

      $('body').append('<div id="google-component"><div class="g-plusone"></div></div>');

      instance = new GooglePlusComponent('body');
      $(window).resize();
      $(window).resize();

      this.loadScriptStub.should.have.been.calledOnce;

      instance.teardown();
      $('#google-component').remove();
    });
  });
});
