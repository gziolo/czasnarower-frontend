/*global Core:false */
Core.Creator.register('eventAttending', function(facade, $) {
  "use strict";

  function _addActivity(id, data) {
    var options = {
      success : function(response) {
        Core.notify({
          type : 'event-attending-member-added',
          data : {
            id : response.data.id,
            item_id : data.item_id,
            item_dao : data.item_dao,
            value : data.value
          }
        });
      }
    };
    if (id) {
      facade.rest.update('event-attending', id, data, options);
    } else {
      facade.rest.create('event-attending', data, options);
    }
  }

  function _removeActivity(id) {

    facade.rest.destroy('event-attending', id, {
      success : function() {
        Core.notify({
          type : 'event-attending-member-removed',
          data : {
            id : id
          }
        });
      }
    });
  }

  function bindButtons() {

    $('body').on('click', '.addActivity', function() {
      var userSigned = facade.getUserData() != null;
      if (!userSigned) {
        facade.notify({
          type : 'user-sign-in-form'
        });
        return;
      }
      var elem = $(this);

      var params = {
        item_id : +elem.attr('data-itemId'),
        item_dao : +elem.attr('data-itemDao'),
        value : +elem.attr('data-value')
      };
      _addActivity(elem.attr('data-id'), params);
    }).mouseover(function() {
      $(this).parent().parent().addClass('active');
    }).mouseout(function() {
      $(this).parent().parent().removeClass('active');
    });

    $('body').on('click', '.removeActivity', function() {
      var elem = $(this);
      _removeActivity(elem.attr('data-id'));
    });
  }

  return {
    init : function(data) {
      facade.listen('user-signed-in', this.getSignedInSchedules, this);
      facade.listen('event-attending-member-added', this.updateMemberCount, this);
      bindButtons();
    },
    getSignedInSchedules : function() {
      facade.rest.getAll('event-attending', {}, {
        success : function(response) {
          Core.notify({
            type : 'schedule-view-mark-user-events',
            data : response.data
          });
        },
        cache : false
      });
    },
    updateMemberCount : function(messageInfo) {
      var counter = $('.total-attendees[data-id=' + messageInfo.data.id + ']');
      counter.text(+counter.first().text() + 1);
    },
    destroy : function() {}
  };
});
