var q = require('q');

module.exports = function() {
  var subscribers = {};
  var lastValues = {};
  return {
    subscribe: function(path, callback) {
      if (!subscribers[path]) subscribers[path] = [];
      subscribers[path].push(callback);
      callback(lastValues[path]);
    },
    set: function(path, value) {
      lastValues[path] = value;
      if (subscribers[path]) {
        subscribers[path].forEach(function(sub) {
          sub(value);
        });
      }
      return q();
    },
    add: function(path, value) {
      this.set(path, [value]);
    }
  };
}