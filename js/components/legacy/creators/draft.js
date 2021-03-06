/*jshint unused:false, strict:false */
define(function() {
  return function(facade, $) {
    var draftsLoaded = false;
    function _getDrafts() {

      draftsLoaded = true;

      var urlData = {
        dao : 22,
        action : 13,
        dataType : 'json'
      };
      facade.ajax({
        data : urlData,
        url : 'ajax',
        success : function(oData) {
          if (oData.drafts) {
            facade.notify({
              type : 'draft-items-loaded',
              data : oData.drafts
            });
          } else if (oData.error) {
            facade.notify({
              type : 'draft-items-loaded',
              data : {
                error : oData.error.sMessage
              }
            });
            draftsLoaded = false;
          } else {
            facade.notify({
              type : 'draft-items-loaded',
              data : {
                error : 'Brak draftów'
              }
            });
            draftsLoaded = false;
          }
        },
        cache : false,
        global : false
      });
    }
    function appendDrafts(messageInfo) {
      var drafts = messageInfo.data, el;
      $('.cnr-user-drafts').removeClass('cnr-loading');
      if (drafts.error) {
        $('.drafts_list').append($('<p><i>' + drafts.error + '</i></p>'));
        return;
      }
      if (!drafts.length) {
        $('.drafts_list').append($('<p><i>Nie masz żadnych nieopublikowanych wpisów</i></p>'));
        return;
      }
      for ( var i = 0; i < drafts.length; i++) {
        el = facade.template('entryDraftItem', drafts[i]);
        $('.drafts_list').append(el);
      }
      $('.drafts_list .draft:last').addClass('last');
    }
    function bindButtons() {

      $('body').on('click', '#user_menu .drafts.button', function() {
        $('.user_quickbox').not('.drafts').addClass('hidden');
        $('.user_quickbox.drafts').toggleClass('hidden');
        if (!draftsLoaded) {
          $('.cnr-user-drafts').addClass('cnr-loading');
          _getDrafts();
        }
      });
    }
    return {
      init : function(data) {
        facade.listen('draft-items-loaded', this.appendDrafts, this);
        facade.listen('user-signed-out', this.unbindUserPanel, this);
        bindButtons();
      },
      unbindUserPanel : function() {
        draftsLoaded = false;
      },
      appendDrafts : appendDrafts,
      destroy : function() {}
    };
  };
});
