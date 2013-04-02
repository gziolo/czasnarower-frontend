define(function() {

  var data = {};

  function withStorage() {

    this.storage = {

      localStorage : window.localStorage,

      setItem : function(key, value) {
        if (this.localStorage) {
          this.localStorage.setItem(key, value);
          return;
        }
        data[key] = value;
      },

      getItem : function(key) {
        if (this.localStorage) {
          return this.localStorage.getItem(key);
        }
        return data[key] || null;
      },

      removeItem : function(key) {
        if (this.localStorage) {
          this.localStorage.removeItem(key);
          return;
        }
        if (data[key]) {
          data[key] = undefined;
        }
      },

      clear : function() {
        if (this.localStorage) {
          this.localStorage.clear();
        }
        data = {};
      }
    };
  }

  return withStorage;
});
