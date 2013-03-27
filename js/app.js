define([ 'aura/aura' ], function(Aura) {
  var app = new Aura({
    widgets : {
      sources : {
        'default' : 'js/widgets'
      }
    }
  });
  app.use('extensions/backbone').use('extensions/bootstrap').start({
    widgets : 'body'
  }).then(function() {
    require([ 'legacy/main' ], function() {});
  });
  return app;
});
