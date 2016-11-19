/*jshint unused:false, strict:false */
define(function() {
  return function(facade, $) {
    'use strict';

    return {
      init : function(data) {
        facade.listen('file-uploader-form', this.showFileUploaderForm, this);
        facade.listen('avatar-uploader-form', this.showAvatarUploaderForm, this);
      },
      showAvatarUploaderForm: function(messageInfo) {
        facade.requireScripts(['js/fileinput/fileinput_pl.js', 'js/fileinput/fileinput_theme.js'], function() {
          var data = messageInfo.data;

          $("#fileupload").fileinput({
            allowedFileExtensions: ["jpg", "jpeg"],
            browseOnZoneClick: true,
            elErrorContainer: '#error_communique',
            deleteUrl: "ajax",
            defaultPreviewContent: '<img src="' + data.defaultAvatar + '" alt="" style="width: 50px"><h6 class="text-muted">Kliknij, aby wybrać zdjęcie</h6>',
            initialPreviewAsData: true,
            initialPreview: data.initialPreview,
            initialPreviewConfig: data.initialPreviewConfig,
            initialPreviewFileType: 'image',
            language: "pl",
            fileActionSettings: {
              showZoom: false,
              uploadIcon: 'Wgraj <i class="icon icon-upload icon-blue"></i>',
            },
            layoutTemplates: {
              main2: '{preview} {remove} {upload} {browse}',
              footer: '<div class="file-thumbnail-footer"><div class="file-footer-caption" title="{caption}">&nbsp;</div>{progress} {actions}</div>'
            },
            minImageHeight: data.minImageHeight,
            minImageWidth: data.minImageWidth,
            maxFileCount: data.maxFileCount,
            msgErrorClass: 'alert alert-error',
            overwriteInitial: true,
            previewSettings: {
              image: {width: "50px", height: "50px"},
              other: {width: "100%", height: "auto"}
            },
            removeLabel: '',
            showClose: false,
            showBrowse: false,
            showCaption: false,
            showRemove: false,
            showUpload: false,
            theme: "gly",
            uploadAsync: true,
            uploadExtraData: data.params,
            uploadUrl: "ajax",
            validateInitialCount: true
          }).on('fileuploaded', function(event, data, previewId, index) {
            var response = data.response;
            var result = response.result;
            if (result.length) {
              if(!result[0]['iStatus']) {
                $("#status_communique").append(
                  $('<p class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    'Avatar został dodany.</p>'));
              }
              else {
                $("#status_communique").html(
                  $('<p class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button>' +'<b>' + result[0]['sFileName'] + '</b>: ' +
                  result[0]['sMessage'] + '</p>'));
              }
            }
          }).on('filedeleted', function(event, key) {
            $("#status_communique").html(
              $('<p class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button>' +
                'Avatar został usunięty.</p>'));

            facade.notify({
              type : 'avatar-removed',
              data : {
                user_id : data.userId
              }
            });
          }).on('change', function(event){
            console.log('filechange');
            $("#status_communique").html('');
          });
        });
      },
      showFileUploaderForm : function(messageInfo) {
        facade.requireScripts(['js/fileinput/fileinput_pl.js', 'js/fileinput/fileinput_theme.js'], function() {
          var data = messageInfo.data;

          $("#fileupload").fileinput({
            allowedFileExtensions: ["jpg", "jpeg"],
            deleteUrl: "ajax",
            initialPreviewAsData: true,
            initialPreview: data.initialPreview,
            initialPreviewConfig: data.initialPreviewConfig,
            initialPreviewFileType: 'image',
            language: "pl",
            layoutTemplates: {
              main1: '{preview}\n' +
                '<div class="input-group {class}">\n' +
                '   {caption}\n' +
                '   <div class="input-group-btn">\n' +
                '       {remove}\n' +
                '       {cancel}\n' +
                '       {upload}\n' +
                '       {browse}\n' +
                '   </div>\n' +
                '</div>'
            },
            minImageHeight: data.minImageHeight,
            minImageWidth: data.minImageWidth,
            maxFileCount: data.maxFileCount,
            overwriteInitial: false,
            showClose: false,
            showUpload: true,
            showRemove: false,
            theme: "gly",
            uploadAsync: true,
            uploadExtraData: data.params,
            uploadUrl: "ajax",
            validateInitialCount: true
          }).on('fileuploaded', function(event, data, previewId, index) {
            var response = data.response;
            var result = response.result;
            if (result.length) {
              if(!result[0]['iStatus']) {
                $("#status_communique").append(
                  $('<p class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>' +'<b>' + result[0]['sFileName'] + '</b>: ' +
                  result[0]['sMessage'] + '</p>'));
              }
              else {
                $("#status_communique").append(
                  $('<p class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button>' +'<b>' + result[0]['sFileName'] + '</b>: ' +
                  result[0]['sMessage'] + '</p>'));
              }
            }
          });
        });
      },
      destroy : function() {}
    };
  };
});
