/*global Core:false */
Core.Creator.register('teamView', function(facade, $) {

  function _addActivity(params) {

    var urlData = {
      dao : params.dao || 26,
      action : 1,
      dataType : 'json',
      params : JSON.stringify(params)
    };

    facade.ajax({
      data : urlData,
      url : 'ajax',
      beforeSend : function() {},
      success : function(sData) {
        if (sData.add.data) {
          facade.notify({
            type : 'event-attending-member-added',
            data : sData.add.data
          });
        }
      },
      cache : false,
      global : false
    });
  }

  function _removeActivity(params) {

    var urlData = {
      dao : 26,
      action : 2,
      dataType : 'json',
      params : JSON.stringify(params)
    };

    facade.ajax({
      data : urlData,
      url : 'ajax',
      beforeSend : function() {},
      success : function(sData) {
        if (sData['delete'].data) {
          facade.notify({
            type : 'event-attending-member-removed',
            data : sData['delete'].data
          });
        }
      },
      cache : false,
      global : false
    });
  }

  function bindButtons() {

    $('body').on('click', '.cnr-team-join', function() {
      var userSigned = facade.getUserData() != null;
      if (!userSigned) {
        facade.notify({
          type : 'user-sign-in-form'
        });
        return;
      }
      var elem = $(this);

      var params = {
        id : +elem.attr('data-id'),
        dao : 26
      };
      _addActivity(params);
    });

    $('body').on('click', '.cnr-team-leave', function() {
      var elem = $(this);
      var params = {
        id : +elem.attr('data-id'),
        dao : 26
      };
      _removeActivity(params);
    });
  }

  return {
    init : function(data) {
      facade.listen('event-attending-member-added', this.addMemberToTeam, this);
      facade.listen('event-attending-member-removed', this.removeMemberFromTeam, this);
      facade.listen('user-signed-out', this.updateMemberSignedOut, this);
      facade.listen('user-signed-in', this.updateMemberSignedIn, this);
      bindButtons();
    },
    addMemberToTeam : function(messageInfo) {

      var memberData = messageInfo.data;
      if ($("#team_members").length) {
        $(facade.template('teamAttendingMember', memberData)).prependTo("#team_members");
      }
      $('#join_team_btn, .addActivity[data-itemId="' + messageInfo.data.item_id + '"]').hide();
      $('#leave_team_btn').show();
      $('#leave_team_btn.removeActivity').attr('data-id', messageInfo.data.id);
      var numAttendee = $('#team_members .cnr-attendee').size();
      $("#cnr-team_members_no").html(numAttendee ? 'Liczba zapisanych: ' + numAttendee : 'Ta drużyna nie ma jeszcze zawodników. Możesz być pierwszy!');
    },
    removeMemberFromTeam : function(messageInfo) {
      var user = facade.getUserData();
      $('.cnr-attendee[data-user-id=' + messageInfo.data.id + ']').remove();
      $('#join_team_btn').show();
      $('#leave_team_btn').hide();
      var numAttendee = $('#team_members .cnr-attendee').size();
      $("#cnr-team_members_no").html(numAttendee ? 'Liczba zapisanych: ' + numAttendee : 'Ta drużyna nie ma jeszcze zawodników. Możesz być pierwszy!');

    },
    updateMemberSignedIn : function(messageInfo) {
      var user = messageInfo.data, id = 0;

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
    updateMemberSignedOut : function(messageInfo) {
      $('#join_team_btn').show();
      $('#leave_team_btn').hide();
    },
    destroy : function() {}
  };
});
