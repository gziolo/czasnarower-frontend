/*jshint strict:false */
/*global tinymce */
define(function() {
  return function(sandbox, $) {

    function initTextarea() {

      tinymce.baseURL = sandbox.config.staticUrl + 'js/tinymce';
      tinymce.init({
        block_formats: 'Paragraph=p;Header 1=h3;Header 2=h4;Header 3=h5',
        formats: {
          cite: { inline: 'q', attributes: {class: 'cite'}}
        },
        language: 'pl',
        link_assume_external_targets: true,
        link_title: false,
        media_live_embeds: true,
        media_alt_source: false,
        media_poster: false,
        media_dimensions: false,
        menubar: false,
        paste_word_valid_elements: "b,strong,i,em,q,h1,h2,h3,h4,h5,h6,p,li,ul,ol",
        plugins: 'autolink link lists media paste preview wordcount',
        setup: function(editor) {
          editor.addButton('cite', {
            title: 'Cytat',
            icon: false,
            onclick: function() {
              tinymce.activeEditor.formatter.toggle('cite');
            },
            onPostRender: function() {
              var ctrl = this;
              editor.on('NodeChange', function(e) {
                ctrl.active(e.element.className === "cite");
              });
            }
          });
        },
        selector: '.cnr-wysihtml5-field',
        skin_url: sandbox.config.staticUrl + 'js/tinymce/skins/lightgray',
        target_list: false,
        theme_url: sandbox.config.staticUrl + 'js/tinymce/themes/modern/theme.min.js',
        toolbar: "bold italic underline cite blockquote | formatselect | bullist numlist | outdent indent | undo redo | link unlink media",
        wordcount_cleanregex: /[0-9.(),;:!?%#$?\x27\x22_+=\\\/\-]*/g
      });
    }

    return {
      init : function(data) {
        sandbox.listen('init-textarea-field', this.initTextarea, this);
      },
      initTextarea : function() {
        sandbox.requireScripts(['js/tinymce/tinymce.min.js'], function() {
          initTextarea();
        });
      },
      destroy : function() {}
    };
  };
});
