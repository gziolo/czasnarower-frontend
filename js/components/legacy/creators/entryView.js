/*jshint unused:false */
define(function() {
  return function(facade, $) {

    function _removeNews(params) {
      var urlData = {
        dao : 1,
        action : 19,
        dataType : 'json',
        params : JSON.stringify({
          id : params.news_id
        })
      };

      facade.ajax({
        data : urlData,
        url : 'ajax',
        success : function(oData) {
          if (!Number(oData['delete'].iStatus)) {
            facade.notify({
              type : 'news-removed',
              data : {
                id : oData['delete'].news_id
              }
            });
          } else {
            facade.dialogError({
              title : 'Błąd',
              content : oData['delete'].sMessage,
              errors : oData.errors
            });
          }
        },
        cache : false,
        global : false
      });
    }

    function _removeTrack(params) {

      var urlData = {
        dao : 10,
        action : 19,
        dataType : 'json',
        params : JSON.stringify({
          id : params.track_id
        })
      };

      facade.ajax({
        data : urlData,
        url : 'ajax',
        success : function(oData) {
          if (!Number(oData['delete'].iStatus)) {
            facade.notify({
              type : 'track-removed',
              data : {
                id : oData['delete'].track_id
              }
            });
          } else {
            facade.dialogError({
              title : 'Błąd',
              content : oData['delete'].sMessage,
              errors : oData.errors
            });
          }
        },
        cache : false,
        global : false
      });
    }

    function _removeSchedule(params) {

      var urlData = {
        dao : 8,
        action : 19,
        dataType : 'json',
        params : JSON.stringify({
          id : params.schedule_id
        })
      };

      facade.ajax({
        data : urlData,
        url : 'ajax',
        success : function(oData) {
          if (!Number(oData['delete'].iStatus)) {
            facade.notify({
              type : 'schedule-removed',
              data : {
                id : oData['delete'].schedule_id
              }
            });
          } else {
            facade.dialogError({
              title : 'Błąd',
              content : oData['delete'].sMessage,
              errors : oData.errors
            });
          }
        },
        cache : false,
        global : false
      });
    }
    function _bindConfirmNewsRemove(params) {
      var elem = $('#news_' + params.news_id + ' .cnr-news-remove');
      var html = "<p>Czy na pewno chcesz usunąć news?</p><button class='btn btn-small btn-danger confirm-remove'>Usuń</button><button class='btn btn-small cancel-remove'>Anuluj</button>";
      elem.popover({
        html : true,
        content : html,
        title : 'Potwierdzenie',
        placement : 'left'
      });

      $('body').on('click', '#news_' + params.news_id + ' .confirm-remove', function() {
        elem.popover('hide');
        _removeNews(params);
      });
      $('body').on('click', '#news_' + params.news_id + ' .cancel-remove', function() {
        elem.popover('hide');
      });
    }

    function _bindConfirmTrackRemove(params) {
      var elem = $('#track_' + params.track_id + ' .cnr-track-remove');
      var html = "<p>Czy na pewno chcesz usunąć trasę?</p><button class='btn btn-small btn-danger confirm-remove'>Usuń</button><button class='btn btn-small cancel-remove'>Anuluj</button>";
      elem.popover({
        html : true,
        content : html,
        title : 'Potwierdzenie',
        placement : 'left'
      });

      $('body').on('click', '#track_' + params.track_id + ' .confirm-remove', function() {
        elem.popover('hide');
        _removeTrack(params);
      });
      $('body').on('click', '#track_' + params.track_id + ' .cancel-remove', function() {
        elem.popover('hide');
      });
    }

    function _bindConfirmScheduleRemove(params) {
      var elem = $('#schedule_' + params.schedule_id + ' .cnr-schedule-remove');
      var html = "<p>Czy na pewno chcesz usunąć wyścig?</p><button class='btn btn-small btn-danger confirm-remove'>Usuń</button><button class='btn btn-small cancel-remove'>Anuluj</button>";
      elem.popover({
        html : true,
        content : html,
        title : 'Potwierdzenie',
        placement : 'left'
      });

      $('body').on('click', '#schedule_' + params.schedule_id + ' .confirm-remove', function() {
        elem.popover('hide');
        _removeSchedule(params);
      });
      $('body').on('click', '#schedule_' + params.schedule_id + ' .cancel-remove', function() {
        elem.popover('hide');
      });
    }
    function bindButtons() {

      $('.cnr-news-remove').each(function(index) {
        var elem = $(this);
        var params = {
          news_id : elem.attr('data-id')
        };
        _bindConfirmNewsRemove(params);
      });

      $('.cnr-track-remove').each(function(index) {
        var elem = $(this);
        var params = {
          track_id : elem.attr('data-id')
        };
        _bindConfirmTrackRemove(params);
      });

      $('.cnr-schedule-remove').each(function(index) {
        var elem = $(this);
        var params = {
          schedule_id : elem.attr('data-id')
        };
        _bindConfirmScheduleRemove(params);
      });
    }

    return {
      init : function(data) {
        facade.listen('news-removed', this.newsRemoved, this);
        facade.listen('track-removed', this.trackRemoved, this);
        facade.listen('schedule-removed', this.scheduleRemoved, this);
        bindButtons();
      },
      scheduleRemoved : function(messageInfo) {
        var data = messageInfo.data;
        $("#schedule_" + data.id).fadeOut(500);
      },
      trackRemoved : function(messageInfo) {
        var data = messageInfo.data;
        $("#track_" + data.id).fadeOut(500);
      },
      newsRemoved : function(messageInfo) {
        var data = messageInfo.data;
        $("#news_" + data.id).fadeOut(500);
      },
      destroy : function() {}
    };
  };
});
