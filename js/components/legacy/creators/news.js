/*jshint strict:false */
define(function() {
  return function(sandbox, $) {

    var draft;
    var button;

    function initForm() {
      $('#news_form').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
          //e.preventDefault();
          return false;
        } else {
          e.preventDefault();
          saveNews(button);
        }
      });

      // Field to bind wysihtml5editor
      $('.cnr-wysihtml5-field').wysihtml5({"locale": "pl-PL"});

      $('#news_submit').on('click', function() {
        $('#validation_communique').removeClass('alert alert-error error').html('');
        draft = false;
        button = $('#news_submit');
        $('#news_form').submit();
      });

      $('#news_draft_submit').on('click', function() {
        $('#validation_communique').removeClass('alert alert-error error').html('');
        draft = true;
        button = $('#news_draft_submit');
        $('#news_form').submit();
      });
    }

    /**
     *
     */
    function getNewsParams() {
      var audience = $('input[name="audience"]:checked');

      return {
        title : $('#news_title').val(),
        description : $('#news_description').val(),
        category : +$("select[name='category']").val(),
        tags : $('#news_tags').val(),
        url: $("input[name='url']").val(),
        fb_publish : $('#fb_publish').prop('checked'),
        special_highlighted : $('#special_highlighted').prop('checked'),
        special_sponsored: $('#special_sponsored').prop('checked'),
        audience: (audience.length ? audience.val() : 0),
        news_id: $('#news_id').val(),
        draft: draft
      };
    }


    /**
     * save news
     */
    function saveNews(button) {
      var params, urlData;
      button.button('loading');
      params = getNewsParams();
      if (!params) {
        button.button('reset');
        return false;
      }

      urlData = {
        dao : 15,
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
          if (data.result.iId && !params['news_id']) {
            $('#news_id').val(data.result.iId);
            history.pushState({}, 'Edycja artykułu rowerowego', data.url.edition);
          }
          if (!draft) {
            $('#validation_communique').addClass("alert alert-success").html(
              data.result.sMessage);
            window.location = data.url.preview;
          } else {
            $('#validation_communique').addClass("alert alert-success").html(
              data.result.sMessage +
              (data.url && data.url.preview ? (" | <a href='" + data.url.preview + "'>Wyświetl podgląd</a>") : "") +
              (data.url && data.url.manage_photos ? (" | <a href='" + data.url.manage_photos + "'>Dodaj zdjęcia</a>") : "")
            );
          }
        } else {
          if (data.errors) {
            $.each(data.errors, function(key, err) {
              var formElem = $('#' + key);
              formElem.parent().find('.help-block.with-errors').html(err);
              formElem.closest('.control-group').addClass('has-error has-danger');
            });
          }
          $('#validation_communique').addClass("alert alert-error").html(data.result.sMessage);
        }
      }).always(function() {
        button.button('reset');
      });
    }

    return {
      init : function(data) {
        sandbox.listen('init-news-form', this.initForm, this);
      },
      initForm : function() {
        initForm();
      },
      destroy : function() {}
    };
  };
});
