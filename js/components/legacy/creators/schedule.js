/*jshint strict:false */
define(function() {
  return function(sandbox, $) {

    function getRaces4selectedDay(sStartDay) {
      var sUrlData = "dao=8&action=12&start_day=" + sStartDay;

      $.ajax({
        type: 'POST',
        data: sUrlData,
        url: 'ajax',
        beforeSend: function() {
          $("#planned_races").hide();
        },
        success: function(sData) {
          $("#planned_races").html(sData);
        },
        cache: false,
        global: false
      });
    }

    /**
     * Get schedule params to save
     */
    function getScheduleParams() {
      return {
        start_day: $('#schedule_start_day').val(),
        start_hour: $("select[name='start_hour']").val(),
        start_minute: $("select[name='start_minute']").val(),
        start_place: $('#schedule_start_place').val(),
        race_name : $('#schedule_race_name').val(),
        cycle: $('#schedule_cycle').val(),
        race_sort : +$("select[name='race_sort']").val(),
        description : $('#schedule_description').val(),
        tags : $('#race_tags').val(),
        url: $("input[name='url']").val(),
        licence: $('#schedule_licence').prop('checked'),
        fb_publish : $('#fb_publish').prop('checked'),
        id: $('#schedule_id').val()
      };
    }

    /**
     * save schedule
     */
    function saveSchedule() {
      var params, urlData, button = $('#schedule_submit');
      button.button('loading');
      params = getScheduleParams();
      if (!params) {
        button.button('reset');
        return false;
      }

      urlData = {
        dao : 20,
        action : 1,
        dataType : 'json',
        params : JSON.stringify(params)
      };

      sandbox.ajax({
        type : 'POST',
        data : urlData,
        dataType : 'json',
        url : 'ajax',
        cache : false
      }).done(function(data) {
        if (!data.result.iStatus) {
          // no errors, everything is fine
          if (data.result.iId && !params['id']) {
            $('#schedule_id').val(data.result.iId);
          }
          $('#validation_communique').addClass("alert alert-success").html(
            data.result.sMessage);
          window.location = data.url.redirect;
        } else {
          if (data.errors) {
            $.each(data.errors, function(key, err) {
              var formElem = $('[name="' + key + '"]');
              formElem.closest('.control-group').addClass(
                'has-error has-danger').find('.help-block.with-errors').html(err);
            });
          }
          $('#validation_communique').addClass(
            "alert alert-error").html(data.result.sMessage);
        }
      }).always(function() {
        button.button('reset');
      });
    }

    function initForm() {
      // Field to bind wysihtml5editor
      $('.cnr-wysihtml5-field').wysihtml5({"locale": "pl-PL"});

      $('#schedule_form').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
          return false;
        } else {
          e.preventDefault();
          saveSchedule();
        }
      });

      $('#schedule_submit').on('click', function() {
        $('#validation_communique').removeClass(
          'alert alert-error error').html('');
        $('#schedule_form').submit();
      });

      $('#schedule_cycle').change(function() {
        var cycleName = $(this);
        var raceName = $("#schedule_race_name");
        var changeValue = true;
        if (raceName.val()) {
          changeValue = false;
          $(this).find('option').each(function() {
            if ($(this).text() === raceName.val()) {
              changeValue = true;
            }
          });
        }
        if (changeValue) {
          if (cycleName.val() !== 'inny') {
            raceName.val(cycleName.val());
          } else {
            raceName.val('');
          }
          raceName.focus();
        }
      });

      $('#schedule_start_datepicker').datepicker({
        format: 'yyyy-mm-dd',
        language: 'pl'
      }).on('changeDate', function(ev) {
        $('#schedule_start_day').val(
          $('#schedule_start_datepicker').data('date'));
        var date = $('#schedule_start_day').val();
        getRaces4selectedDay(date);
        $('#schedule_start_datepicker').datepicker('hide');
      });
    }

    return {
      init : function(data) {
        sandbox.listen('init-schedule-form', this.initForm, this);
      },
      initForm : function() {
        initForm();
      },
      destroy : function() {}
    };
  };
});
