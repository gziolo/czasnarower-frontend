/*global Core */
Core.Creator.register('comment', function(facade, $) {

  function _showLoader(params) {
    var elem = params.elem;
    var msg = params.msg || 'Moment...';
    var overlayCss = {
      opacity : '0.8',
      'background-color' : '#333'
    };
    var loaderCss = {};
    if (params.loaderCss) {
      $.extend(loaderCss, params.loaderCss);
    }
    if (params.overlayCss) {
      $.extend(overlayCss, params.overlayCss);
    }

    elem.append('<div class="overlay">&nbsp;</div><div class="loader"><p>' + msg + '</p></div>');
    elem.find('.overlay').css(overlayCss).show();
    elem.find('.loader').css(loaderCss).show();
  }

  function _hideLoader(params) {
    var elem = params.elem;
    elem.find('.loader').remove();
    elem.find('.overlay').remove();
  }

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

    $(facade.template('commentAddForm', {
      message : sMessage
    })).appendTo("#comment_" + iId).show();
    oComment.find('.overlay').css({
      opacity : '0.8',
      'background-color' : '#333'
    });

    oComment.find('.btn_cancel').click(function() {
      _hideLoader({
        elem : oComment
      });
      oComment.find('.form').remove();
    });

    oComment.find('.btn_send').click(function() {
      var params = {
        comment_id : iId,
        message : oComment.find('textarea').val()
      };
      _editComment(params);
    });
  }

  function _addComment(params) {

    var oForm = $('#comment_form');
    if (!_validate(oForm)) {
      return false;
    }

    var urlData = {
      dao : oForm.attr('data-dao'),
      action : 1,
      dataType : 'json',
      params : JSON.stringify(params)
    };

    facade.ajax({
      data : urlData,
      url : 'ajax',
      beforeSend : function() {
        _showLoader({
          elem : oForm,
          loaderCss : {
            'height' : 'auto',
            'bottom' : 0
          }
        });
      },
      complete : function() {
        _hideLoader({
          elem : oForm
        });
      },
      success : function(oData) {
        if (!Number(oData.add.iStatus)) {
          oForm.append('<div class="communique"><p class="alert alert-success">' + oData.add.sMessage + '</p></div>');
          oForm.find('.communique').show();
          var newAdded = oData.comment;
          Core.notify({
            type : 'comment-added',
            data : newAdded
          });
          oForm.find('.communique').delay(2000).fadeOut(100, function() {
            $(this).remove();
          });
        } else {
          showAlert({
            title : 'Błąd',
            content : oData.add.sMessage,
            errors : oData.errors,
            elem : oForm
          });
        }

      },
      cache : false,
      global : false
    });
  }

  function _editComment(params) {

    var iId = params.comment_id;
    var oComment = $('#comment_' + iId);
    var oForm = oComment.find('.form');
    if (!_validate(oForm)) {
      return false;
    }
    var urlData = {
      dao : 63,
      action : 2,
      dataType : 'json',
      params : JSON.stringify(params)
    };

    facade.ajax({
      data : urlData,
      url : 'ajax',
      beforeSend : function() {
        _showLoader({
          elem : oComment
        });
      },
      complete : function() {
        _hideLoader({
          elem : oComment
        });
      },
      success : function(oData) {
        if (!Number(oData.update.iStatus)) {

          oComment.find('.form').remove();
          oComment.append('<div class="communique"><p class="text-info">' + oData.update.sMessage + '</p></div>');
          oComment.find('.communique').show();
          oComment.find('.communique').delay(2000).fadeOut(100, function() {
            $(this).remove();
          });
          Core.notify({
            type : 'comment-updated',
            data : oData.comment
          });
        } else {
          showAlert({
            title : 'Błąd',
            content : oData.update.sMessage,
            errors : oData.errors,
            elem : oComment
          });
        }

      },
      cache : false,
      global : false
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

    facade.ajax({
      data : urlData,
      url : 'ajax',
      beforeSend : function() {
        _showLoader({
          elem : oComment,
          overlayCss : {
            'height' : 'auto',
            'bottom' : 0
          },
          loaderCss : {
            'height' : 'auto',
            'bottom' : 0
          }
        });
      },
      complete : function() {
        _hideLoader({
          elem : oComment
        });
      },
      success : function(oData) {
        if (!Number(oData.remove.iStatus)) {
          Core.notify({
            type : 'comment-removed',
            data : {
              id : oData.remove.comment_id
            }
          });
        } else {
          showAlert({
            title : 'Błąd',
            content : oData.remove.sMessage,
            errors : oData.errors,
            elem : oComment
          });
        }
      },
      cache : false,
      global : false
    });
  }

  function _getMoreComments(params) {
    var urlData = {
      dao : params.dao ? params.dao : 63,
      action : 5,
      dataType : 'json',
      params : JSON.stringify(params)
    };

    facade.ajax({
      data : urlData,
      url : 'ajax',
      beforeSend : function() {
        $('.comments .get_more').addClass('loading').find('.alink').hide();
      },
      complete : function() {
        $('.comments .get_more').removeClass('loading').find('.alink').show();
      },
      success : function(oData) {
        if (oData.comments) {
          if (oData.comments.length > 0) {
            $('.comments .get_more').attr('data-page', Number($('.comments .get_more').attr('data-page')) + 1);
            Core.notify({
              type : 'comment-more-loaded',
              data : oData.comments
            });
          } else {
            $('.get_more').hide();
          }
        } else {
          showAlert({
            title : 'Błąd',
            content : oData.error.sMessage,
            errors : oData.errors
          });
        }
      },
      cache : false,
      global : false
    });
  }

  function addComment(messageInfo) {
    var comment = messageInfo.data;
    comment.featured = true;
    $('#comment_form').removeClass('active').find('textarea').val('');
    var newComment = $(facade.template('commentRow', comment));
    $('#comments_content').prepend(newComment);
    _bindConfirmRemove({
      comment_id : comment.comment_id
    });

  }

  function appendComments(messageInfo) {
    var commentsData = messageInfo.data;
    $.each(commentsData, function(ob, item) {
      item.featured = false;
      $('#comments_content').append(facade.template('commentRow', item));
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

    $('body').on('click', '#add_comment', function(e) {
      var userSigned = facade.getUserData() != null;
      if (!userSigned) {
        facade.notify({
          type : 'user-sign-in-form'
        });
        return;
      }
      var elem = $('#comment_form');
      var params = {
        thread_id : elem.attr('data-thread-id'),
        id : elem.attr('data-id'),
        message : $('#comments_message').val()
      };
      _addComment(params);
      e.preventDefault();
      e.stopPropagation();
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

    $('.comments .cnr-comment-remove').each(function(index) {
      var elem = $(this);
      var params = {
        comment_id : elem.attr('data-id')
      };
      _bindConfirmRemove(params);
    });

    $('.comments .get_more .alink').click(function() {
      var elem = $('.comments .get_more');
      if (elem.hasClass('disabled')) {
        return;
      }
      var params = {
        thread_id : elem.attr('data-thread-id'),
        page : elem.attr('data-page'),
        dao : elem.attr('data-dao')
      };
      _getMoreComments(params);
    });
  }

  return {
    init : function(data) {
      facade.listen('comment-added', this.addComment, this);
      facade.listen('comment-updated', this.updateComment, this);
      facade.listen('comment-removed', this.removeComment, this);
      facade.listen('comment-more-loaded', this.appendComments, this);

      bindButtons();
    },
    addComment : addComment,
    appendComments : appendComments,
    updateComment : updateComment,
    removeComment : removeComment,
    destroy : function() {}
  };
});
