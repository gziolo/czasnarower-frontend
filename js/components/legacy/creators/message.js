/*jshint unused:false */
define(
    [ 'moment_pl' ],
    function(moment) {
      return function(facade, $) {

        var messagesLoaded = false;

        function showError(params) {
          facade.dialog({
            title : params.title,
            content : params.content,
            buttons : [ {
              text : 'Popraw',
              'click' : function() {
                $(this).closest('.modal').modal('hide');
              }
            } ],
            dialogClass : 'alert-error'
          });
          $('button').removeClass('ui-state-focus');

          if (params.errors) {
            var aErrors = params.errors;
            $.each(aErrors, function(key, err) {
              var id = key.split('_')[1];
              $('#' + id + '_communique').html('<span>' + err + '</span>').show();
            });
          }
        }

        function _validate(form) {

          if (!form.find("textarea[name='content']").val()) {
            showError({
              'title' : 'Formularz zawiera błędy.',
              'content' : 'Wiadomość musi zawierać tekst.'
            });
            return false;
          }
          return true;
        }

        function _confirmRemove(params) {
          facade.dialog({
            title : 'Potwierdzenie',
            content : 'Czy na pewno chcesz usunąć wiadomość?',
            modal : true,
            buttons : [ {
              text : 'Usuń',
              click : function() {
                _removeMessage(params);
                $(this).closest('.modal').modal('hide');
              }
            }, {
              text : 'Anuluj',
              click : function() {
                $(this).closest('.modal').modal('hide');
              }
            } ]
          });

        }
        function _removeMessage(params) {
          var urlData = {
            dao : 52,
            action : 5,
            dataType : 'json',
            params : JSON.stringify(params)
          };

          facade.ajax({
            data : urlData,
            url : 'ajax',
            beforeSend : function() {},
            complete : function() {},
            success : function(oData) {
              if (!Number(oData.remove.iStatus)) {
                facade.notify({
                  type : 'message-removed',
                  data : {
                    id : oData.remove.message_id
                  }
                });
              } else {
                showError({
                  title : 'Błąd',
                  content : oData.remove.sMessage,
                  errors : oData.errors
                });
              }
            },
            cache : false,
            global : false
          });
        }
        function _addMessage(params, form) {

          var oForm = form;
          if (!_validate(oForm)) {
            return false;
          }

          var urlData = {
            dao : params.dao || 51,
            action : 2,
            dataType : 'json',
            params : JSON.stringify(params)
          };

          facade.ajax({
            data : urlData,
            url : 'ajax',
            success : function(oData) {
              if (!Number(oData.add.iStatus)) {
                var newAdded = oData.message;
                newAdded.form = oForm;
                facade.notify({
                  type : 'message-added',
                  data : newAdded
                });
              } else {
                showError({
                  title : 'Błąd',
                  content : oData.add.sMessage,
                  errors : oData.errors
                });
              }

            },
            cache : false,
            global : false
          });
        }
        function _getRecentChats(params) {
          messagesLoaded = true;

          var urlData = {
            dao : params.dao || 63,
            action : params.action || 3,
            dataType : 'json'
          };
          facade.ajax({
            data : urlData,
            url : 'ajax',
            success : function(oData) {
              if (oData.mail_group) {
                if (oData.mail_group.length > 0) {
                  facade.notify({
                    type : 'message-chats-loaded',
                    data : oData.mail_group
                  });
                }
              } else if (oData.error) {
                facade.notify({
                  type : 'message-chats-loaded',
                  data : {
                    error : 'Brak wiadomości'
                  }
                });
                messagesLoaded = false;
              } else {
                facade.notify({
                  type : 'message-chats-loaded',
                  data : {
                    error : 'Brak wiadomości'
                  }
                });
                messagesLoaded = false;
              }
            },
            cache : false,
            global : false
          });
        }
        function _getMoreMessages(params) {

          var urlData = {
            dao : params.dao ? params.dao : 63,
            action : 2,
            dataType : 'json',
            params : JSON.stringify(params)
          };

          facade.ajax({
            data : urlData,
            url : 'ajax',
            beforeSend : function() {
              $('.chat .get_more').addClass('loading').find('.alink').hide();
            },
            complete : function() {
              $('.chat .get_more').removeClass('loading').find('.alink').show();
            },
            success : function(oData) {
              if (oData.mail_box) {
                if (oData.mail_box.length > 0) {
                  $('.chat .get_more').attr('data-page', Number($('.chat .get_more').attr('data-page')) + 1);
                  facade.notify({
                    type : 'message-more-loaded',
                    data : oData.mail_box
                  });
                } else {
                  $('.get_more').hide();
                }
              } else {
                showError({
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
        function addMessage(messageInfo) {
          var message = messageInfo.data, form = message.form;

          form.removeClass('active').find('textarea').val('');
          if (form.hasClass('answer-form')) {
            var cnt = form.closest('.message');
            cnt.find('.msg').html("<span class='author'>" + message.sender_nick + "</span>: " + message.content);
            cnt.find('h6').text(message.created_date);
            form.remove();
          }
          if (messagesLoaded) {
            var chat = message.chat;
            chat.last_msg = message;
            var itemEl = createChat(chat);
            $('#user_menu .messages_list .message[data-partner="' + chat.partner.id + '"]').remove();
            if ($('#user_menu .messages_list .message').length === 4) {
              $('#user_menu .messages_list .message:last').remove();
            }
            if ($("#user_menu .messages_list .message").length > 0) {
              $('#user_menu .messages_list .message:first').before(itemEl);
            } else {
              $('#user_menu .messages_list').append(itemEl);
            }
          }
          if ($('#chat_list').length) {
            var firstMsg = $('#chat_list .message').not('.form').first();
            var currSender = +firstMsg.attr('data-sender') || 0;
            var el = $(facade.template('messageRow', message));
            if (message.sender.id === currSender) {
              firstMsg.find('.message-content:first').before(el.find('.message-content'));
            } else {
              $('#chat_list article:first').after(el);
            }
          }
          _bindConfirmRemove({id: message.id});
        }

        function appendMessages(messageInfo) {
          var messagesData = messageInfo.data;

          $.each(messagesData, function(ob, item) {
            var lastMsg = $('#chat_list .message').last();
            var currSender = +lastMsg.attr('data-sender') || 0;
            var el = $(facade.template('messageRow', item));
            _bindConfirmRemove({id: item.id});
            if (item.sender_id === currSender) {
              var elCnt = el.find('.message-content');
              lastMsg.find('.message-content:last').after(elCnt);
            } else {
              lastMsg.after(el);
            }
          });

          $('.getMore').attr('data-page', Number($('.getMore').attr('data-page')) + 1);

        }

        function createChat(item) {
          var itemEl;
          var handleToggleMore = function(evt) {
            var el = $(this);
            var txt = el.closest('.msg');
            txt.toggleClass('expanded');
            if (txt.hasClass('expanded')) {
              el.text('\xAB zwiń');
            } else {
              el.text('więcej \xBB');
            }
            evt.stopPropagation();
          };
          var handleAnswerBtn = function(evt) {
            evt.stopPropagation();
            var el = $(this), btn = el.closest('.answer-btn'), cnt = el.closest('.content'), partner_id = el.attr('data-receiver-id'), form = $('<div data-receiver-id="' +
                partner_id +
                '" class="answer-form"><textarea class="message-content" name="content" rows="4"></textarea><div class="form_btn"><span class="btn btn-small btn-primary send-message">Wyślij</span><span class="btn btn-small cancel-message">Anuluj</span></div></div>');

            form.find('.cancel-message').click(function(e) {
              e.stopPropagation();
              form.replaceWith(btn);
              btn.click(handleAnswerBtn);
            });
            form.find('.send-message').click(function(e) {
              var userSigned = facade.getUserData() != null;
              if (!userSigned) {
                facade.notify({
                  type : 'user-sign-in-form'
                });
                return;
              }
              var elem = $(this).closest('.answer-form');
              var params = {
                receiver : elem.attr('data-receiver-id'),
                content : elem.find('.message-content').val()
              };
              _addMessage(params, elem);

            });
            btn.replaceWith(form);
            form.find('textarea').focus();
          };
          var handleMsgClick = function(evt) {
            var el = $(this), msg = el.closest('.message'), href = msg.attr('data-href');
            if (href) {
              window.location = href;
            }
          };
          itemEl = $(facade.template('messageGroup', item));
          itemEl.find('.toggleMore').click(handleToggleMore);
          itemEl.find('.answer-btn').click(handleAnswerBtn);
          itemEl.find('.content').click(handleMsgClick);
          return itemEl;

        }
        function appendChats(messageInfo) {
          var itemEl;
          var messagesData = messageInfo.data;

          if (messagesData.error) {
            $('.user_quickbox.messages .messages_list').append('<p><i>' + messagesData.error + '</i></p>');
            return;
          }
          if (messagesData.length === 0) {
            return;
          }
          $.each(messagesData, function(ob, item) {
            itemEl = createChat(item);
            $('.user_quickbox.messages .messages_list').append(itemEl);
          });
          if (itemEl !== undefined) {
            itemEl.addClass('last');
          }
        }

        function removeMessage(messageInfo) {
          var data = messageInfo.data;
          var chatEl = $("#message_" + data.id).closest('article');
          if (chatEl.find('.message-content:visible').length > 1) {
            $("#message_" + data.id).fadeOut(500, function() {
              $(this).remove();
            });
          } else {
            chatEl.fadeOut(500, function() {
              $(this).remove();
            });
          }
        }
        function _bindConfirmRemove(params) {
          var elem = $('#message_' + params.id + ' .cnr-message-remove');
          var html = '<p>Czy na pewno chcesz usunąć wiadomość?</p>';
          html += '<button class="btn btn-small btn-danger confirm-remove">Usuń</button>';
          html += '<button class="btn btn-small cancel-remove">Anuluj</button>';
          elem.popover({
            html : true,
            content : html,
            title : 'Potwierdzenie',
            placement : 'left'
          });

          $('body').on('click', '#message_' + params.id + ' .confirm-remove', function() {
            elem.popover('hide');
            _removeMessage(params);
          });
          $('body').on('click', '#message_' + params.id + ' .cancel-remove', function() {
            elem.popover('hide');
          });
        }
        function bindButtons() {

          $('body').on('click', '.message-form .send-message', function(e) {
            var userSigned = facade.getUserData() != null;
            if (!userSigned) {
              facade.notify({
                type : 'user-sign-in-form'
              });
              return;
            }
            var elem = $(this).closest('.message-form');
            var params = {
              receiver : elem.attr('data-receiver-id'),
              content : elem.find('.message-content').val()
            };
            _addMessage(params, elem);
            e.preventDefault();
            e.stopPropagation();
          }).on('click', '.message-form .cancel-message', function() {
            var elem = $(this).closest('.message-form');
            elem.find('textarea').val('');
            elem.removeClass('active');
          });

          $('body').on({
            'focus' : function() {
              $(this).closest('.message-form').addClass('active');
            },
            'blur' : function() {
              $(this).removeClass('focused');
            }
          }, '.message-form textarea');
          /*
           * $('body').on('click', '.message .remove-message', function() { var
           * elem = $(this); var params = { id : elem.attr('data-id') };
           * _confirmRemove(params); });
           */
          $('.cnr-message-remove').each(function(index) {
            var elem = $(this);
            var params = {
              id : elem.attr('data-id')
            };
            _bindConfirmRemove(params);
          });

          $('body').on('click', '.message.group', function() {
            var elem = $(this), sUrl = elem.attr('data-href');
            if (sUrl) {
              window.location.href = sUrl;
            }
          });
          $('.chat .get_more .alink').click(function() {
            var elem = $('.chat .get_more');
            if (elem.hasClass('disabled')) {
              return;
            }
            var params = {
              user2 : elem.attr('data-user2'),
              page : elem.attr('data-page'),
              dao : elem.attr('data-dao')
            };
            _getMoreMessages(params);
          });
          $('.message-form textarea').focus();

          var formatTime = function() {
            $('.message time').each(function(i) {
              var dt = $(this).attr('datetime');
              var timeFormatted = moment(dt, "YYYY-MM-DD HH:mm:ss").fromNow();
              $(this).text(timeFormatted);
            });
          };
          formatTime();
          setInterval(formatTime, 1000);

        }
        return {
          init : function(data) {
            bindButtons();
            facade.listen('message-added', this.addMessage, this);
            facade.listen('message-more-loaded', this.appendMessages, this);
            facade.listen('message-removed', this.removeMessage, this);
            facade.listen('message-chats-loaded', this.appendChats, this);
            facade.listen('user-signed-in', this.bindUserPanel, this);
            facade.listen('user-signed-out', this.unbindUserPanel, this);
          },
          unbindUserPanel : function() {
            messagesLoaded = false;
          },
          bindUserPanel : function() {
            $('#user_menu .messages.button').click(function(e) {
              $('.user_quickbox').not('.messages').addClass('hidden');
              $('.user_quickbox.messages').toggleClass('hidden');
              if (!messagesLoaded) {
                var params = {
                  dao : 52,
                  action : 3
                };
                _getRecentChats(params);
              }
            });

          },
          addMessage : addMessage,
          removeMessage : removeMessage,
          appendMessages : appendMessages,
          appendChats : appendChats,
          destroy : function() {}
        };
      };
    });
