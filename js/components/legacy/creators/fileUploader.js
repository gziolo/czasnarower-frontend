/*jshint unused:false, strict:false */
define(function() {
  return function(facade, $) {
    'use strict';

    return {
      init : function(data) {
        facade.listen('file-uploader-form', this.showFileUploaderForm, this);
      },
      showFileUploaderForm : function(messageInfo) {
        facade.requireScripts(['js/fileinput_pl.js'], function() {
          $("#fileupload").fileinput({language: "pl"});
        });
      },
      destroy : function() {}
    };
  };
});
