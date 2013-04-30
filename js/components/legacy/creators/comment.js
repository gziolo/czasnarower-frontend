define(function() {
  return function(sandbox, $) {

    function showAlert(params) {
      var alert;
      var elem = params.elem;
      if (!elem) {
        return;
      }
      alert = $('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>' + params.title + '</strong>' + params.content + '</div>');
      alert.alert();
      elem.append(alert);
    }

    function _validate(form) {

      form.find('.alert').remove();

      if (!form.find("textarea[name='message']").val()) {
        showAlert({
          'title' : 'Formularz zawiera błędy.',
          'content' : 'Komentarz musi zawierać tekst.',
          'elem' : form
        });
        return false;
      }
      return true;
    }

    function _showEditForm(params) {
      var iId = params.id;
      var oComment = $('#comment_' + iId);

      var sMessage = oComment.clone().find('q').find('a').each(function() {
        $(this).replaceWith($(this).attr('href'));
      }).end().find('br').each(function() {
        $(this).replaceWith('\n');
      }).end().html();

      $(sandbox.template('commentAddForm', {
        message : sMessage
      })).appendTo("#comment_" + iId).show();

      oComment.find('.btn_cancel').click(function() {
        oComment.find('.overlay, .form').remove();
      });

      oComment.find('.btn_send').click(function() {
        var params = {
          comment_id : iId,
          message : oComment.find('textarea').val()
        };
        _editComment($(this), params);
      });
    }

    function _addComment(button, params) {
      var oForm = $('#comment_form');
      var urlData = {
        dao : oForm.attr('data-dao'),
        action : 1,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      button.button('loading');
      if (!_validate(oForm)) {
        button.button('reset');
        return false;
      }

      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        cache : false,
        global : false
      }).done(function(data) {
        if (!Number(data.add.iStatus)) {
          oForm.append('<div class="communique"><p class="alert alert-success">' + data.add.sMessage + '</p></div>');
          oForm.find('.communique').show();
          var newAdded = data.comment;
          sandbox.notify({
            type : 'comment-added',
            data : newAdded
          });
          oForm.find('.communique').delay(2000).fadeOut(100, function() {
            $(this).remove();
          });
        } else {
          showAlert({
            title : 'Błąd',
            content : data.add.sMessage,
            errors : data.errors,
            elem : oForm
          });
        }
      }).always(function() {
        button.button('reset');
      });
    }

    function _editComment(button, params) {
      var iId = params.comment_id;
      var oComment = $('#comment_' + iId);
      var oForm = oComment.find('.form');
      var urlData = {
        dao : 63,
        action : 2,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      button.button('loading');
      if (!_validate(oForm)) {
        button.button('reset');
        return false;
      }
      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        cache : false,
        global : false
      }).done(function(data) {
        if (!Number(data.update.iStatus)) {
          oComment.find('.overlay, .form').remove();
          oComment.append('<div class="communique"><p class="text-info">' + data.update.sMessage + '</p></div>');
          oComment.find('.communique').show();
          oComment.find('.communique').delay(2000).fadeOut(100, function() {
            $(this).remove();
          });
          sandbox.notify({
            type : 'comment-updated',
            data : data.comment
          });
        } else {
          showAlert({
            title : 'Błąd',
            content : data.update.sMessage,
            errors : data.errors,
            elem : oComment
          });
        }

      }).always(function() {
        button.button('reset');
      });
    }

    function _bindConfirmRemove(params) {
      var elem = $('#comment_' + params.comment_id + ' .cnr-comment-remove');
      var html = "<p>Czy na pewno chcesz usunąć komentarz?</p><button class='btn btn-small btn-danger confirm-remove'>Usuń</button><button class='btn btn-small cancel-remove'>Anuluj</button>";
      elem.popover({
        html : true,
        content : html,
        title : 'Potwierdzenie',
        placement : 'left'
      });

      $('body').on('click', '#comment_' + params.comment_id + ' .confirm-remove', function() {
        elem.popover('hide');
        _removeComment(params);
      });
      $('body').on('click', '#comment_' + params.comment_id + ' .cancel-remove', function() {
        elem.popover('hide');
      });
    }
    function _removeComment(params) {

      var iId = params.comment_id;
      var oComment = $('#comment_' + iId);
      var urlData = {
        dao : 63,
        action : 3,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      sandbox.ajax({
        data : urlData,
        url : 'ajax',
        success : function(data) {
          if (!Number(data.remove.iStatus)) {
            sandbox.notify({
              type : 'comment-removed',
              data : {
                id : data.remove.comment_id
              }
            });
          } else {
            showAlert({
              title : 'Błąd',
              content : data.remove.sMessage,
              errors : data.errors,
              elem : oComment
            });
          }
        },
        cache : false,
        global : false
      });
    }

    function _getMoreComments(button, params) {
      var urlData = {
        dao : params.dao ? params.dao : 63,
        action : 5,
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
        if (data.comments) {
          if (data.comments.length > 0) {
            $('.comments .get_more').attr('data-page', Number($('.comments .get_more').attr('data-page')) + 1);
            sandbox.notify({
              type : 'comment-more-loaded',
              data : data.comments
            });
          } else {
            $('.comments .get_more').hide();
          }
        } else {
          showAlert({
            title : 'Błąd',
            content : data.error.sMessage,
            errors : data.errors
          });
        }
      }).always(function() {
        button.button('reset');
      });
    }

    function addComment(messageInfo) {
      var comment = messageInfo.data;
      comment.featured = true;
      $('#comment_form').removeClass('active').find('textarea').val('');
      var newComment = $(sandbox.template('commentRow', comment));
      $('#comments_content').prepend(newComment);
      _bindConfirmRemove({
        comment_id : comment.comment_id
      });

    }

    function appendComments(messageInfo) {
      var commentsData = messageInfo.data;
      $.each(commentsData, function(ob, item) {
        item.featured = false;
        $('#comments_content').append(sandbox.template('commentRow', item));
        _bindConfirmRemove({
          comment_id : item.comment_id
        });
      });

      $('.getMore').attr('data-page', Number($('.getMore').attr('data-page')) + 1);

      $('#comments_content :odd').addClass('odd');
      $('#comments_content :even').removeClass('odd');

    }

    function updateComment(messageInfo) {
      var commentData = messageInfo.data;
      $("#comment_" + commentData.comment_id + ' q').html(commentData.text_message);
    }

    function removeComment(messageInfo) {
      var data = messageInfo.data;
      $("#comment_" + data.id).fadeOut(500);
    }

    function bindButtons() {

      $('body').on('click', '#add_comment', function() {
        var userSigned = sandbox.getUserData() != null;
        var elem = $('#comment_form');
        var params = {
          thread_id : elem.attr('data-thread-id'),
          id : elem.attr('data-id'),
          message : $('#comments_message').val()
        };

        if (!userSigned) {
          sandbox.notify({
            type : 'user-sign-in-form'
          });
          return;
        }
        _addComment($(this), params);
        return false;
      });

      $('body').on({
        'focus' : function() {
          $(this).addClass('focused');
          $('#comment_form').addClass('active');
        },
        'blur' : function() {
          $(this).removeClass('focused');
        }
      }, '#comment_form textarea');

      $('body').on('click', '.comments .cnr-comment-edit', function() {
        var elem = $(this);
        var params = {
          id : elem.attr('data-id')
        };
        _showEditForm(params);
      });

      $('.comments .cnr-comment-remove').each(function() {
        var elem = $(this);
        var params = {
          comment_id : elem.attr('data-id')
        };
        _bindConfirmRemove(params);
      });

      $('.comments').on('click', '.get_more .alink', function() {
        var button = $(this);
        var elem = button.parent();
        var params = {
          thread_id : elem.attr('data-thread-id'),
          page : elem.attr('data-page'),
          dao : elem.attr('data-dao')
        };

        if (elem.hasClass('disabled')) {
          return;
        }
        _getMoreComments(button, params);
      });
    }

    return {
      init : function() {
        sandbox.listen('comment-added', this.addComment, this);
        sandbox.listen('comment-updated', this.updateComment, this);
        sandbox.listen('comment-removed', this.removeComment, this);
        sandbox.listen('comment-more-loaded', this.appendComments, this);

        bindButtons();
      },
      addComment : addComment,
      appendComments : appendComments,
      updateComment : updateComment,
      removeComment : removeComment,
      destroy : function() {}
    };
  };
});
