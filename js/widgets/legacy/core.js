/*global sStaticUrl */

/* Sample creator
 * core.creator.register('instruction', function(facade, $){
 *     return {
 *         init: function(data){
 *             console.debug('instruction ' + data.test);
 *             facade.listen('test', this.test, this);
 *         },
 *         test: function(messageInfo){
 *             alert('test');
 *         },
 *         destroy: function(){
 *         }
 *     }
 * });
 */

/*
 * Sample for dialog show
 * facade.dialog({
 *     title: 'Bardzo fajny dialog',
 *     content: 'Czy chcesz przejsc dalej???',
 *     buttons: {
 *         Dalej: function() {
 *             $(this).dialog('close');
 *         },
 *     }
 * });
 */
define([ 'jquery', 'underscore', 'text!legacy/templates/comment/addForm.html', 'text!legacy/templates/comment/row.html', 'text!legacy/templates/entry/draftItem.html',
    'text!legacy/templates/event/attendingMember.html', 'text!legacy/templates/message/group.html', 'text!legacy/templates/message/row.html', 'text!legacy/templates/photo/editForm.html',
    'text!legacy/templates/team/attendingMember.html', 'text!legacy/templates/user/info.html' ], function($, _, commentAddFormTemplate, commentRowTemplate, entryDraftItemTemplate,
    eventAttendingMemberTemplate, messageGroupTemplate, messageRowTemplate, photoEditFormTemplate, teamAttendingMemberTemplate, userInfoTemplate) {
  "use strict";

  // TODO: move this global to require.config
  var config = {
    staticUrl : sStaticUrl || ''
  };
  var moduleData = {};
  var listeners = [];

  var facade = (function($, config) {
    var loadedScripts = {};
    var modalDialog = null;
    var userData = null;
    var templates = {
        'commentAddForm' : _.template(commentAddFormTemplate),
        'commentRow' : _.template(commentRowTemplate),
        'entryDraftItem' : _.template(entryDraftItemTemplate),
        'eventAttendingMember' : _.template(eventAttendingMemberTemplate),
        'messageGroup' : _.template(messageGroupTemplate),
        'messageRow' : _.template(messageRowTemplate),
        'photoEditForm' : _.template(photoEditFormTemplate),
        'teamAttendingMember' : _.template(teamAttendingMemberTemplate),
        'userInfo' : _.template(userInfoTemplate)
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
          dataType : 'json',
          beforeSend : function() {},
          success : function() {},
          error : function() {}
        }, options);
        $.ajax(options);
      },
      rest : (function() {
        var statusCode = {
          400 : function(jqXHR, textStatus, errorThrown) {
            var options = {};
            var response = JSON.parse(jqXHR.responseText);
            if (response.data && response.data.message) {
              options.content = response.data.message;
            }
            facade.dialogError(options);
          },
          401 : function() {
            facade.notify({
              type : 'user-sign-in-form'
            });
          },
          403 : function() {
            facade.dialogError({
              content : 'Nie masz wystarczających uprawnień, aby wykonać tą czynność.'
            });
          },
          404 : function() {
            facade.dialogError();
          },
          500 : function() {
            facade.dialogError();
          },
          501 : function() {
            facade.dialogError();
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
            facade.ajax(options);
          },
          getOne : function(serviceName, id, options) {
            options = options || {};
            options = $.extend({
              url : getUrl(serviceName, id),
              type : 'get',
              statusCode : statusCode
            }, options);
            facade.ajax(options);
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
            facade.ajax(options);
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
            facade.ajax(options);
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
            facade.ajax(options);
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
        // } else {
        var modal = [ '<div class="modal-header">', '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>', '<h3>' + options.title + '</h3>', '</div>',
            '<div class="modal-body' + (options.dialogClass ? ' ' + options.dialogClass : '') + '">', '<p>' + options.content + '</p>', '</div>', '<div class="modal-footer">',

            '</div>' ].join('');

        $('body').append('<div id="jQueryDialog" class="modal">' + modal + '</div>');

        for ( var i in options.buttons) {
          var btn = options.buttons[i];
          var btn_el = $('<button class="btn btn-primary">' + btn.text + '</button>').click(btn.click);
          $('#jQueryDialog .modal-footer').append(btn_el);
        }

        modalDialog = $("#jQueryDialog");
        modalDialog.modal('show');
      },
      showLoader : function(params) {
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
      },
      hideLoader : function(params) {
        var elem = params.elem;
        elem.find('.loader').remove();
        elem.find('.overlay').remove();
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
      moduleData[moduleId].instance = moduleData[moduleId].creatorCallback(facade, $);
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
      facade.notify(messageInfo);
    }
  };
});
