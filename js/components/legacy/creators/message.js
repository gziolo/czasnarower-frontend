/*jshint strict:false */
define(
    [ 'moment_pl' ],
    function(moment) {
      return function(sandbox, $) {

        var messagesLoaded = false;

        function showError(params) {
          sandbox.dialog({
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

        function _removeMessage(params) {
          var urlData = {
            dao : 52,
            action : 5,
            dataType : 'json',
            params : JSON.stringify(params)
          };

          sandbox.ajax({
            data : urlData,
            url : 'ajax',
            success : function(data) {
              if (!Number(data.remove.iStatus)) {
                sandbox.notify({
                  type : 'message-removed',
                  data : {
                    id : data.remove.message_id
                  }
                });
              } else {
                showError({
                  title : 'Błąd',
                  content : data.remove.sMessage,
                  errors : data.errors
                });
              }
            },
            cache : false,
            global : false
          });
        }

        function _addMessage(button, form, params) {
          var urlData = {
            dao : params.dao || 51,
            action : 2,
            dataType : 'json',
            params : JSON.stringify(params)
          };

          button.button('loading');
          if (!_validate(form)) {
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
              var newAdded = data.message;
              newAdded.form = form;
              sandbox.notify({
                type : 'message-added',
                data : newAdded
              });
            } else {
              showError({
                title : 'Błąd',
                content : data.add.sMessage,
                errors : data.errors
              });
            }

          }).always(function() {
            button.button('reset');
          });
        }

        function _getRecentChats(params) {
          var urlData = {
            dao : params.dao || 63,
            action : params.action || 3,
            dataType : 'json'
          };

          messagesLoaded = true;
          sandbox.ajax({
            data : urlData,
            url : 'ajax',
            cache : false,
            global : false
          }).done(function(data) {
            if (data.mail_group) {
              if (data.mail_group.length > 0) {
                sandbox.notify({
                  type : 'message-chats-loaded',
                  data : data.mail_group
                });
              }
            } else if (data.error) {
              sandbox.notify({
                type : 'message-chats-loaded',
                data : {
                  error : 'Brak wiadomości'
                }
              });
              messagesLoaded = false;
            } else {
              sandbox.notify({
                type : 'message-chats-loaded',
                data : {
                  error : 'Brak wiadomości'
                }
              });
              messagesLoaded = false;
            }
          });
        }

        function _getMoreMessages(button, params) {
          var urlData = {
            dao : params.dao ? params.dao : 63,
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
            if (data.mail_box) {
              if (data.mail_box.length > 0) {
                $('.chat .get_more').attr('data-page', Number($('.chat .get_more').attr('data-page')) + 1);
                sandbox.notify({
                  type : 'message-more-loaded',
                  data : data.mail_box
                });
              } else {
                $('.get_more').hide();
              }
            } else {
              showError({
                title : 'Błąd',
                content : data.error.sMessage,
                errors : data.errors
              });
            }
          }).always(function() {
            button.button('reset');
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
            var el = $(sandbox.template('messageRow', message));
            if (message.sender.id === currSender) {
              firstMsg.find('.message-content:first').before(el.find('.message-content'));
            } else {
              $('#chat_list article:first').after(el);
            }
          }
          _bindConfirmRemove({
            id : message.id
          });
        }

        function appendMessages(messageInfo) {
          var messagesData = messageInfo.data;

          $.each(messagesData, function(ob, item) {
            var lastMsg = $('#chat_list .message').last();
            var currSender = +lastMsg.attr('data-sender') || 0;
            var el = $(sandbox.template('messageRow', item));
            _bindConfirmRemove({
              id : item.id
            });
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

            evt.stopPropagation();
            txt.toggleClass('expanded');
            if (txt.hasClass('expanded')) {
              el.text('\xAB zwiń');
            } else {
              el.text('więcej \xBB');
            }
          };
          var handleAnswerBtn = function(evt) {
            evt.stopPropagation();
            var el = $(this), btn = el.closest('.answer-btn'), partner_id = el.attr('data-receiver-id'), form = $('<div data-receiver-id="' +
                partner_id +
                '" class="answer-form"><textarea class="message-content" name="content" rows="4"></textarea><div class="form_btn"><span class="btn btn-small btn-primary send-message">Wyślij</span><span class="btn btn-small cancel-message">Anuluj</span></div></div>');

            form.find('.cancel-message').click(function(e) {
              e.stopPropagation();
              form.replaceWith(btn);
              btn.click(handleAnswerBtn);
            });
            form.find('.send-message').click(function() {
              var userSigned = sandbox.getUserData() != null;
              if (!userSigned) {
                sandbox.notify({
                  type : 'user-sign-in-form'
                });
                return;
              }
              var elem = $(this).closest('.answer-form');
              var params = {
                receiver : elem.attr('data-receiver-id'),
                content : elem.find('.message-content').val()
              };
              _addMessage(btn, elem, params);

            });
            btn.replaceWith(form);
            form.find('textarea').focus();
          };
          var handleMsgClick = function() {
            var el = $(this), msg = el.closest('.message'), href = msg.attr('data-href');
            if (href) {
              window.location = href;
            }
          };
          itemEl = $(sandbox.template('messageGroup', item));
          itemEl.find('.toggleMore').click(handleToggleMore);
          itemEl.find('.answer-btn').click(handleAnswerBtn);
          itemEl.find('.content').click(handleMsgClick);
          return itemEl;

        }
        function appendChats(messageInfo) {
          var itemEl;
          var messagesData = messageInfo.data;
          $('.cnr-user-messages').removeClass('cnr-loading');
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

          $('body').on('click', '.message-form .send-message', function() {
            var userSigned = sandbox.getUserData() != null;
            var button = $(this);
            var elem = button.closest('.message-form');
            var params = {
              receiver : elem.attr('data-receiver-id'),
              content : elem.find('.message-content').val()
            };

            if (!userSigned) {
              sandbox.notify({
                type : 'user-sign-in-form'
              });
              return;
            }
            _addMessage(button, elem, params);
            return false;
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
          $('.cnr-message-remove').each(function() {
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
            _getMoreMessages($(this), params);
            return false;
          });
          $('.message-form textarea').focus();

          var formatTime = function() {
            $('.message time').each(function() {
              var dt = $(this).attr('datetime');
              var timeFormatted = moment(dt, "YYYY-MM-DD HH:mm:ss").fromNow();
              $(this).text(timeFormatted);
            });
          };
          formatTime();
          setInterval(formatTime, 1000);

        }
        return {
          init : function() {
            bindButtons();
            sandbox.listen('message-added', this.addMessage, this);
            sandbox.listen('message-more-loaded', this.appendMessages, this);
            sandbox.listen('message-removed', this.removeMessage, this);
            sandbox.listen('message-chats-loaded', this.appendChats, this);
            sandbox.listen('user-signed-in', this.bindUserPanel, this);
            sandbox.listen('user-signed-out', this.unbindUserPanel, this);
          },
          unbindUserPanel : function() {
            messagesLoaded = false;
          },
          bindUserPanel : function() {
            $('#user_menu .messages.button').click(function() {
              $('.user_quickbox').not('.messages').addClass('hidden');
              $('.user_quickbox.messages').toggleClass('hidden');
              if (!messagesLoaded) {
                var params = {
                  dao : 52,
                  action : 3
                };
                $('.cnr-user-messages').addClass('cnr-loading');
                _getRecentChats(params);
              }
              return false;
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
