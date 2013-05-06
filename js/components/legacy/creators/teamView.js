define(function() {
  return function(sandbox, $) {

    function _addActivity(button, params) {
      var urlData = {
        dao : params.dao || 26,
        action : 1,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      button.button('loading');
      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        cache : false,
        global : false
      }).done(function(data) {
        if (data.add.data) {
          sandbox.notify({
            type : 'event-attending-member-added',
            data : data.add.data
          });
        }
      }).always(function() {
        button.button('reset');
      });
    }

    function _removeActivity(button, params) {
      var urlData = {
        dao : 26,
        action : 2,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      button.button('loading');
      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        cache : false,
        global : false
      }).done(function(data) {
        if (data['delete'].data) {
          sandbox.notify({
            type : 'event-attending-member-removed',
            data : data['delete'].data
          });
        }
      }).always(function() {
        button.button('reset');
      });
    }

    function bindButtons() {

      $('body').on('click', '.cnr-team-join', function() {
        var userSigned = sandbox.getUserData() != null;
        var elem = $(this);
        var params = {
          id : +elem.attr('data-id'),
          dao : 26
        };

        if (!userSigned) {
          sandbox.notify({
            type : 'user-sign-in-form'
          });
          return;
        }
        _addActivity(elem, params);
      });

      $('body').on('click', '.cnr-team-leave', function() {
        var elem = $(this);
        var params = {
          id : +elem.attr('data-id'),
          dao : 26
        };

        _removeActivity(elem, params);
      });
    }

    return {
      init : function() {
        sandbox.listen('event-attending-member-added', this.addMemberToTeam, this);
        sandbox.listen('event-attending-member-removed', this.removeMemberFromTeam, this);
        sandbox.listen('user-signed-out', this.updateMemberSignedOut, this);
        sandbox.listen('user-signed-in', this.updateMemberSignedIn, this);
        bindButtons();
      },
      addMemberToTeam : function(messageInfo) {

        var memberData = messageInfo.data;
        if ($("#team_members").length) {
          $(sandbox.template('teamAttendingMember', memberData)).prependTo("#team_members");
        }
        $('#join_team_btn, .addActivity[data-itemId="' + messageInfo.data.item_id + '"]').hide();
        $('#leave_team_btn').show();
        $('#leave_team_btn.removeActivity').attr('data-id', messageInfo.data.id);
        var numAttendee = $('#team_members .cnr-attendee').size();
        $("#cnr-team_members_no").html(numAttendee ? 'Liczba zapisanych: ' + numAttendee : 'Ta drużyna nie ma jeszcze zawodników. Możesz być pierwszy!');
      },
      removeMemberFromTeam : function(messageInfo) {
        $('.cnr-attendee[data-user-id=' + messageInfo.data.id + ']').remove();
        $('#join_team_btn').show();
        $('#leave_team_btn').hide();
        var numAttendee = $('#team_members .cnr-attendee').size();
        $("#cnr-team_members_no").html(numAttendee ? 'Liczba zapisanych: ' + numAttendee : 'Ta drużyna nie ma jeszcze zawodników. Możesz być pierwszy!');

      },
      updateMemberSignedIn : function(messageInfo) {
        var user = messageInfo.data;

        // check if user is on the member list
        var matching = $('#team_members .cnr-attendee[data-user-id=' + user.id + ']');
        if (matching.size()) {
          $('#join_team_btn').hide();
          $('#leave_team_btn').show();
        } else {
          $('#join_team_btn').show();
          $('#leave_team_btn').hide();
        }
      },
      updateMemberSignedOut : function() {
        $('#join_team_btn').show();
        $('#leave_team_btn').hide();
      },
      destroy : function() {}
    };
  };
});
