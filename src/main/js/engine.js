var q = require('q');
var im = require('im');

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
      var last = lastValues[path];
      if (!last) last = im.vector();
      this.set(path, last.push(value));
    }
  };
}