/*jshint maxparams:25, unused:false, strict:false */
define([
    'jquery',
    'underscore',
    'text!legacy/templates/entry/draftItem.html',
    'text!legacy/templates/event/attendingMember.html',
    'text!legacy/templates/message/group.html',
    'text!legacy/templates/message/row.html',
    'text!legacy/templates/photo/editForm.html',
    'text!legacy/templates/user/info.html',
    'text!legacy/templates/schedule/attendingMember.html',
    'text!legacy/templates/schedule/calendar.html',
    'text!legacy/templates/schedule/tag.html'
  ], function($,
              _,
              entryDraftItemTemplate,
              eventAttendingMemberTemplate,
              messageGroupTemplate,
              messageRowTemplate,
              photoEditFormTemplate,
              userInfoTemplate,
              scheduleAttendingMemberTemplate,
              scheduleCalendarTemplate,
              scheduleTagTemplate) {
    'use strict';

    // TODO: move this global to require.config
    var config = {
      staticUrl : window.staticUrl || ''
    };
    var moduleData = {};
    var listeners = [];

    var sandbox = (function($, config) {
      var loadedScripts = {};
      var modalDialog = null;
      var userData = null;
      var templates = {
        'entryDraftItem' : _.template(entryDraftItemTemplate),
        'eventAttendingMember' : _.template(eventAttendingMemberTemplate),
        'messageGroup' : _.template(messageGroupTemplate),
        'messageRow' : _.template(messageRowTemplate),
        'photoEditForm' : _.template(photoEditFormTemplate),
        'userInfo' : _.template(userInfoTemplate),
        'scheduleAttendingMember': _.template(scheduleAttendingMemberTemplate),
        'scheduleCalendar': _.template(scheduleCalendarTemplate),
        'scheduleTag': _.template(scheduleTagTemplate)
      };

      return {
        notify : function(messageInfo) {
          var length = listeners.length;
          while (length--) {
            if (listeners[length].type === messageInfo.type) {
              listeners[length].handler.call(listeners[length].scope, messageInfo);
            }
          }
        },
        listen : function(type, handler, scope) {
          if (typeof type !== "object") {
            type = [ type ];
          }
          var length = type.length;
          while (length--) {
            listeners.push({
              type : type[length],
              handler : handler,
              scope : scope
            });
          }
        },
        ajax : function(options) {
          options = options || {};
          options = $.extend({
            type : 'post',
            dataType : 'json'
          }, options);
          return $.ajax(options);
        },
        rest : (function() {
          var statusCode = {
            400 : function(jqXHR, textStatus, errorThrown) {
              var options = {};
              var response = JSON.parse(jqXHR.responseText);
              if (response.data && response.data.message) {
                options.content = response.data.message;
              }
              sandbox.dialogError(options);
            },
            401 : function() {
              sandbox.notify({
                type : 'user-sign-in-form'
              });
            },
            403 : function() {
              sandbox.dialogError({
                content : 'Nie masz wystarczających uprawnień, aby wykonać tą czynność.'
              });
            },
            404 : function() {
              sandbox.dialogError();
            },
            500 : function() {
              sandbox.dialogError();
            },
            501 : function() {
              sandbox.dialogError();
            }
          };
          var getUrl = function(serviceName, id) {
            var url = 'rest/' + serviceName;
            if (id) {
              url = url + '/' + id;
            }
            return url;
          };
          return {
            getAll : function(serviceName, data, options) {
              options = options || {};
              options = $.extend({
                url : getUrl(serviceName),
                type : 'get',
                data : data,
                statusCode : statusCode
              }, options);
              return sandbox.ajax(options);
            },
            getOne : function(serviceName, id, options) {
              options = options || {};
              options = $.extend({
                url : getUrl(serviceName, id),
                type : 'get',
                statusCode : statusCode
              }, options);
              return sandbox.ajax(options);
            },
            create : function(serviceName, data, options) {
              options = options || {};
              options = $.extend({
                url : getUrl(serviceName),
                type : 'post',
                data : data,
                cache : false,
                statusCode : statusCode
              }, options);
              return sandbox.ajax(options);
            },
            update : function(serviceName, id, data, options) {
              options = options || {};
              options = $.extend({
                url : getUrl(serviceName, id),
                type : 'put',
                data : data,
                cache : false,
                statusCode : statusCode
              }, options);
              return sandbox.ajax(options);
            },
            destroy : function(serviceName, id, options) {
              options = options || {};
              options = $.extend({
                url : getUrl(serviceName, id),
                type : 'post',
                headers : {
                  'X-HTTP-Method-Override' : 'DELETE'
                },
                cache : false,
                statusCode : statusCode
              }, options);
              return sandbox.ajax(options);
            }
          };
        })(),
        requireScript : function(scriptName, callback) {
          if (loadedScripts[scriptName]) {
            return;
          }
          this.ajax({
            async : false,
            cache : true,
            global : false,
            dataType : 'script',
            type : 'get',
            url : config.staticUrl + scriptName,
            success : function() {
              loadedScripts[scriptName] = true;
              if (callback) {
                callback();
              }
            }
          });
        },
        requireScripts : function(scripts, callback) {
          var length = scripts.length;
          if (0 < length) {
            var scriptName = scripts.shift();
            this.requireScript(scriptName, $.proxy(function() {
              this.requireScripts(scripts, callback);
            }, this));
            return;
          }
          callback();
        },
        loadScript : function(url, id) {
          if (0 < $('#' + id).length) {
            return;
          }
          var js = document.createElement('script');
          js.src = url;
          js.id = id;
          $('script:first').before(js);
        },
        template : function(name, data) {
          if (templates[name] === undefined) {
            return '';
          }
          data.translate = function(text) {
            return text;
          };
          return templates[name](data);
        },
        dialog : function(options) {
          options = options || {};
          options = $.extend({
            closeText : 'zamknij',
            content : '',
            draggable : false,
            modal : true,
            resizable : false,
            open : function() {
              $(this).parent().find('button').blur();
            }
          }, options);
          if (modalDialog) {
            modalDialog.modal('hide');
            modalDialog.remove();
          }
          var modal = [ '<div class="modal-header">', '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>', '<h3>' + options.title + '</h3>', '</div>',
              '<div class="modal-body' + (options.dialogClass ? ' ' + options.dialogClass : '') + '">', '<p>' + options.content + '</p>', '</div>', '<div class="modal-footer">',

              '</div>' ].join('');

          $('body').append('<div id="jQueryDialog" class="modal">' + modal + '</div>');

          /*jshint forin:false */
          for ( var i in options.buttons) {
            var btn = options.buttons[i];
            var btn_el = $('<button class="btn btn-primary">' + btn.text + '</button>').click(btn.click);
            $('#jQueryDialog .modal-footer').append(btn_el);
          }

          modalDialog = $("#jQueryDialog");
          modalDialog.modal('show');
        },
        dialogError : function(options) {
          options = options || {};
          options = $.extend({
            title : 'Błąd',
            content : 'Przepraszamy, wystąpił nieoczekiwany błąd. Spróbuj ponownie za chwilę lub skontaktuj się z redakcją serwisu.',
            buttons : [ {
              'text' : 'Ok',
              'click' : function() {
                $(this).closest('.modal').modal('hide');
              }
            } ],
            open : function() {
              var errorIcon = '<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em"></span>';
              $(this).parent().find('.ui-dialog-titlebar').addClass('ui-state-error').find('.ui-dialog-title').prepend(errorIcon).end().end().find('button').blur();
            },
            dialogClass : 'alert-error'
          }, options);
          this.dialog(options);
        },
        setUserData : function(data) {
          userData = data;
        },
        getUserData : function() {
          return userData;
        },
        config : config
      };
    }($, config));

    return {
      creator : (function() {
        var creators = {};
        return {
          register : function(name, creatorCallback) {
            creators[name] = creatorCallback;
          },
          get : function(name) {
            if (!creators[name]) {
              return null;
            }
            return creators[name];
          }
        };
      }()),
      register : function(moduleId, creatorName, data) {
        if (moduleData[moduleId]) {
          return;
        }
        var creatorCallback = this.creator.get(creatorName);
        if (!creatorCallback) {
          return;
        }
        data = data || null;
        moduleData[moduleId] = {
          creatorCallback : creatorCallback,
          instance : null,
          data : data
        };
      },

      start : function(moduleId) {
        moduleData[moduleId].instance = moduleData[moduleId].creatorCallback(sandbox, $);
        moduleData[moduleId].instance.init(moduleData[moduleId].data);
      },

      stop : function(moduleId) {
        var data = moduleData[moduleId];
        if (data.instance) {
          data.instance.destroy();
          data.instance = null;
        }
      },

      startAll : function() {
        var moduleId;
        for (moduleId in moduleData) {
          if (moduleData.hasOwnProperty(moduleId)) {
            this.start(moduleId);
          }
        }
      },

      stopAll : function() {
        var moduleId;
        for (moduleId in moduleData) {
          if (moduleData.hasOwnProperty(moduleId)) {
            this.stop(moduleId);
          }
        }
      },

      notify : function(messageInfo) {
        sandbox.notify(messageInfo);
      }
    };
  }
);
