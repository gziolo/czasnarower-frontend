define([ 'jquery', 'twitter/component' ], function($, TwitterComponent) {
  'use strict';

  describe('Twitter', function() {

    beforeEach(function() {
      this.loadScriptStub = sinon.stub(TwitterComponent.prototype, 'loadScript');
    });

    afterEach(function() {
      this.loadScriptStub.restore();
    });

    it('should not load twitter library when no twitter widget found.', function() {
      var instance;

      instance = new TwitterComponent('body');

      this.loadScriptStub.should.not.have.been.called;

      instance.teardown();
    });

    it('should not load twitter library when twitter widget found but not visible.', function() {
      var instance;

      $('body').append('<div id="twitter-component"><div class="twitter-share-button" style="display: none"></div></div>');

      instance = new TwitterComponent('body');

      this.loadScriptStub.should.not.have.been.called;

      instance.teardown();
      $('#twitter-component').remove();
    });

    it('should load twitter library when visible twitter widget found after window resize.', function() {
      var instance;

      $('body').append('<div id="twitter-component" style="display: none"><div class="twitter-share-button"></div></div>');

      instance = new TwitterComponent('body');
      $('#twitter-component').show();
      $(window).resize();

      this.loadScriptStub.should.have.been.calledOnce;

      instance.teardown();
      $('#twitter-component').remove();
    });

    it('should load twitter library exactly once when twitter widget found.', function() {
      var instance;

      $('body').append('<div id="twitter-component"><div class="twitter-share-button"></div></div>');

      instance = new TwitterComponent('body');
      $(window).resize();
      $(window).resize();

      this.loadScriptStub.should.have.been.calledOnce;

      instance.teardown();
      $('#twitter-component').remove();
    });
  });
});
