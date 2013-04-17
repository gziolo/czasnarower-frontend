define([ 'js/mixins/with_data_grid', 'js/mixins/with_storage', 'js/mixins/with_template', 'js/mixins/with_translator' ], function(WithDataGrid, WithStorage, WithTemplate, WithTranslator) {
  'use strict';

  return {
    WithDataGrid : WithDataGrid,
    WithStorage : WithStorage,
    WithTemplate : WithTemplate,
    WithTranslator : WithTranslator
  };
});
