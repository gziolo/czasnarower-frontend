define(function() {
  return function(facade, $) {

    var bindNavigation = function() {
      $('.component').each(function() {
        var component = $(this);
        if (component.hasClass('user_box')) {
          return true;
        }
        var navigation = component.find('header.menu h4');
        if (2 > navigation.length) {
          return;
        }
        navigation.each(function() {
          $(this).click(function(e) {
            var link = $(this);
            if (!link.hasClass('clickable') || !link.data('content')) {
              return false;
            }
            navigation.filter('.active').removeClass('active').addClass('clickable');
            link.addClass('active').removeClass('clickable');
            component.find('div.body').hide().filter('.' + link.data('content')).show();
            return false;
          });
        });
      });
    };

    return {
      init : function(data) {
        bindNavigation();
      },
      destroy : function() {}
    };
  };
});
