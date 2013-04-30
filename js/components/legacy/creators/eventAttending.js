define(function() {
  return function(sandbox, $) {
    'use strict';

    function _addActivity(button) {
      var id = button.attr('data-id');
      var data = {
        item_id : +button.attr('data-itemId'),
        item_dao : +button.attr('data-itemDao'),
        value : +button.attr('data-value')
      };
      var options = {
        success : function(response) {
          sandbox.notify({
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
      var resetButton = function() {
        button.button('reset');
      };

      button.button('loading');
      if (id) {
        sandbox.rest.update('event-attending', id, data, options).always(resetButton);
      } else {
        sandbox.rest.create('event-attending', data, options).always(resetButton);
      }
    }

    function _removeActivity(button) {
      var id = button.attr('data-id');

      button.button('loading');
      sandbox.rest.destroy('event-attending', id, {
        success : function() {
          sandbox.notify({
            type : 'event-attending-member-removed',
            data : {
              id : id
            }
          });
        }
      }).always(function() {
        button.button('reset');
      });
    }

    function bindButtons() {

      $('body').on('click', '.addActivity', function() {
        var userSigned = sandbox.getUserData() != null;

        if (!userSigned) {
          sandbox.notify({
            type : 'user-sign-in-form'
          });
          return;
        }

        _addActivity($(this));
      });

      $('body').on('click', '.removeActivity', function() {
        var userSigned = sandbox.getUserData() != null;

        if (!userSigned) {
          sandbox.notify({
            type : 'user-sign-in-form'
          });
          return;
        }

        _removeActivity($(this));
      });
    }

    return {
      init : function() {
        sandbox.listen('user-signed-in', this.getSignedInSchedules, this);
        sandbox.listen('event-attending-member-added', this.updateMemberCount, this);
        bindButtons();
      },
      getSignedInSchedules : function() {
        sandbox.rest.getAll('event-attending', {}, {
          success : function(response) {
            sandbox.notify({
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
  };
});
