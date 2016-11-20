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

    function initForm() {
      // Field to bind wysihtml5editor
      $('.cnr-wysihtml5-field').wysihtml5({"locale": "pl-PL"});

      $('#schedule_form').validator();

      $('#schedule_form').on('submit', function (e) {
        var form = $(this);
        var button = form.find(':input[type=submit]');
        form.find(".control-group").removeClass(
          'alert alert-error error').find('span[id$="communique"]').hide();
        button.button('loading');
        return true;
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
        }
      });

      $('#schedule_start_datepicker').datepicker({
        format: 'yyyy-mm-dd',
        language: 'pl'
      }).on('changeDate', function(ev) {
        $('#schedule_start_day').val($('#schedule_start_datepicker').data('date'));
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
