/*jshint strict:false */
define(function() {
  return function(sandbox, $) {

    function _removePhoto(params) {
      var urlData = {
        dao : 9,
        action : 5,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        cache : false,
        global : false
      }).done(function(data) {
        if (!Number(data['delete'].iStatus)) {
          sandbox.notify({
            type : 'photo-removed',
            data : {
              id : data['delete'].photo_id,
              result : data['delete']
            }
          });
        } else {
          sandbox.dialogError({
            title : 'Błąd',
            content : data['delete'].sMessage,
            errors : data.errors
          });
        }
      });
    }

    function _removeAvatar(params) {
      var urlData = {
        dao : 9,
        action : 5,
        sort : 44,
        avatar : 1,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        cache : false,
        global : false
      }).done(function(data) {
        if (!Number(data['delete'].iStatus)) {
          sandbox.notify({
            type : 'avatar-removed',
            data : {
              user_id : data.userId,
              id : data['delete'].photo_id
            }
          });
        } else {
          sandbox.dialogError({
            title : 'Błąd',
            content : data['delete'].sMessage,
            errors : data.errors
          });
        }
      });
    }

    function _removeLogo(params) {
      var urlData = {
        dao : 9,
        action : 5,
        sort : 46,
        avatar : 1,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        cache : false,
        global : false
      }).done(function(data) {
        if (!Number(data['delete'].iStatus)) {
          sandbox.notify({
            type : 'logo-removed',
            data : {
              team_id : params.id,
              user_id : data.userId,
              id : data['delete'].photo_id
            }
          });
        } else {
          sandbox.dialogError({
            title : 'Błąd',
            content : data['delete'].sMessage,
            errors : data.errors
          });
        }
      });
    }

    function _bindConfirmRemove(params) {
      var elem = $('#photo_' + params.photo_id + ' .cnr-photo-remove');
      var html = "<p>Czy na pewno chcesz usunąć zdjęcie?</p><button class='btn btn-small btn-danger confirm-remove'>Usuń</button><button class='btn btn-small cancel-remove'>Anuluj</button>";

      elem.popover({
        html : true,
        content : html,
        title : 'Potwierdzenie',
        placement : 'left'
      });

      $('body').on('click', '#photo_' + params.photo_id + ' .confirm-remove', function() {
        elem.popover('hide');
        _removePhoto(params);
      });
      $('body').on('click', '#photo_' + params.photo_id + ' .cancel-remove', function() {
        elem.popover('hide');
      });
    }

    function _bindConfirmRemoveAvatar(params) {
      var elem = $('.cnr-avatar-manage .cnr-avatar-remove');
      var html = "<p>Czy na pewno chcesz usunąć avatar?</p><button class='btn btn-small btn-danger confirm-remove'>Usuń</button><button class='btn btn-small cancel-remove'>Anuluj</button>";

      elem.popover({
        html : true,
        content : html,
        title : 'Potwierdzenie',
        placement : 'left'
      });

      $('body').on('click', '.cnr-avatar-manage .confirm-remove', function() {
        elem.popover('hide');
        _removeAvatar(params);
      });
      $('body').on('click', '.cnr-avatar-manage .cancel-remove', function() {
        elem.popover('hide');
      });
    }

    function _bindConfirmRemoveLogo(params) {
      var elem = $('.cnr-logo-manage .cnr-logo-remove');
      var html = "<p>Czy na pewno chcesz usunąć logo?</p><button class='btn btn-small btn-danger confirm-remove'>Usuń</button><button class='btn btn-small cancel-remove'>Anuluj</button>";

      elem.popover({
        html : true,
        content : html,
        title : 'Potwierdzenie',
        placement : 'left'
      });

      $('body').on('click', '.cnr-logo-manage .confirm-remove', function() {
        elem.popover('hide');
        _removeLogo(params);
      });
      $('body').on('click', '.cnr-logo-manage .cancel-remove', function() {
        elem.popover('hide');
      });
    }

    function _showEditForm(params) {
      var iId = params.photo_id;
      var sDescription = params.description;
      var oPhoto = $('#photo_' + iId);

      $(sandbox.template('photoEditForm', {
        description : sDescription
      })).appendTo("#photo_" + iId).show();

      oPhoto.find('.cnr-cancel-btn').click(function() {
        oPhoto.find('.form').remove();
      });

      oPhoto.find('.cnr-submit-btn').click(function() {
        var params = {
          photo_id : iId,
          photo_description : oPhoto.find('textarea').val()
        };

        _editPhoto($(this), params);
      });

    }
    function _editPhoto(button, params) {
      var iId = params.photo_id;
      var oPhoto = $('#photo_' + iId);
      var urlData = {
        dao : 9,
        action : 4,
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
        if (!Number(data.update.iStatus)) {
          sandbox.notify({
            type : 'photo-updated',
            data : data.update
          });
        } else {
          sandbox.dialogError({
            title : 'Błąd',
            content : data.update.sMessage,
            errors : data.errors
          });
        }
        oPhoto.find('.form').remove();
      }).always(function() {
        button.button('reset');
      });
    }
    function bindButtons() {

      $('.photo .cnr-photo-remove').each(function() {
        var elem = $(this);
        var params = {
          photo_id : elem.attr('data-id')
        };
        _bindConfirmRemove(params);
      });
      $('.cnr-avatar-remove').each(function() {
        var elem = $(this);
        var params = {
          id : elem.attr('data-id'),
          sort : 44,
          avatar : 1
        };
        _bindConfirmRemoveAvatar(params);
      });

      $('.cnr-logo-remove').each(function() {
        var elem = $(this);
        var params = {
          id : elem.attr('data-id'),
          sort : 46,
          avatar : 1
        };
        _bindConfirmRemoveLogo(params);
      });

      $('body').on('click', '.photo .cnr-photo-edit', function() {
        var elem = $(this);
        var params = {
          photo_id : elem.attr('data-id'),
          description : elem.attr('data-description')
        };
        _showEditForm(params);
      });

    }

    return {
      init : function() {
        sandbox.listen('photo-removed', this.photoRemoved, this);
        sandbox.listen('photo-updated', this.photoUpdated, this);
        sandbox.listen('avatar-removed', this.avatarRemoved, this);
        sandbox.listen('logo-removed', this.logoRemoved, this);
        bindButtons();
      },
      photoUpdated : function(messageInfo) {
        var data = messageInfo.data;
        var oPhoto = $("#photo_" + data.id);
        oPhoto.find('.cnr-photo-edit').attr('data-description', data.description);
        oPhoto.find('.txt').html(data.description);
      },
      photoRemoved : function(messageInfo) {
        var data = messageInfo.data;
        var elem = $("#photo_" + data.id);
        if (elem.find('.cnr-photo-remove').attr('data-redirect-url')) {
          elem.parent('.photo-content').css({
            position : 'relative'
          });
          elem
              .append('<div style="position: absolute; top: 0;left:0; right:0; bottom: 0; background-color: rgba(255,255,255, 0.7)"><div  class="alert alert-success alert-block"><h4>Zdjęcie zostało usunięte.</h4> <p>Za chwilę nastąpi przekierowanie do albumu.</p></div></div>');
          window.location.href = elem.find('.cnr-photo-remove').attr('data-redirect-url');
        } else {
          elem.fadeOut(500).remove();
        }
      },
      avatarRemoved : function(messageInfo) {
        var data = messageInfo.data;
        $(".cnr-avatar[data-user-id=" + data.user_id + "]").attr('src', 'photo/avatar/avatar_default.jpg');
        $('.cnr-avatar-remove').hide();
        $('.cnr-avatar-add').show();
        $('.cnr-user-profile[data-user-id="' + data.user_id + '"]').before(
            '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>Avatar został usunięty.</div>');
      },
      logoRemoved : function(messageInfo) {
        var data = messageInfo.data;
        $(".cnr-logo[data-team-id=" + data.team_id + "]").attr('src', 'photo/avatar/logo_default.jpg');
        $('.cnr-logo-remove').hide();
        $('.cnr-logo-add').show();
        $('.cnr-team-profile[data-team-id="' + data.team_id + '"]').before(
            '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>Logo zostało usunięte.</div>');
      },
      destroy : function() {}
    };
  };
});
